import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

// Safety settings to prevent over-blocking legitimate content
// Chinese characters or certain cultural contexts can sometimes trigger strict filters
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export const generateImage = async (
  prompt: string, 
  aspectRatio: string = "1:1"
): Promise<string> => {
  try {
    // 1. Detect text inside Chinese brackets 「」 or 『』
    const textMatch = prompt.match(/[「『](.*?)[」』]/);
    let specialTextInstruction = "";
    
    if (textMatch && textMatch[1]) {
      const detectedText = textMatch[1];
      specialTextInstruction = `
        CRITICAL OVERRIDE: The user wants to render specific text: "${detectedText}".
        YOU MUST RENDER THE CHARACTERS "${detectedText}" EXACTLY AS WRITTEN.
        Treat this text as a high-contrast NEON SIGN, GOLDEN METAL SIGNAGE, or DIGITAL OVERLAY.
        The text must be the focal point, sharp, legible, and structurally correct.
      `;
    }

    // 2. Stronger Prompt Engineering
    const enhancedPrompt = `
      High-fidelity image generation task.
      
      USER PROMPT: ${prompt}
      
      ${specialTextInstruction}

      GENERAL RENDERING INSTRUCTIONS:
      1. STYLE: Photorealistic, 8k resolution, cinematic lighting, detailed textures.
      2. If no specific text is requested, focus on visual storytelling.
      3. If Chinese characters are requested (inside brackets), ensure stroke accuracy and prevent pseudo-characters.
    `.trim();

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
        safetySettings: safetySettings,
      }
    });

    console.log("Generate Image Response:", response);

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from API.");
    }

    const candidate = candidates[0];

    // Check for safety finish reason
    if (candidate.finishReason === "SAFETY") {
      throw new Error("Generated content was blocked due to safety settings.");
    }

    let textResponse = "";

    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }
    
    if (textResponse) {
      throw new Error(`Model returned text instead of image: ${textResponse}`);
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const editImage = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string
): Promise<string> => {
  try {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    // Detect text for editing as well
    const textMatch = prompt.match(/[「『](.*?)[」』]/);
    let specialTextInstruction = "";
    
    if (textMatch && textMatch[1]) {
      const detectedText = textMatch[1];
      specialTextInstruction = `
        CRITICAL: The user wants to ADD or MODIFY text to match: "${detectedText}".
        Render "${detectedText}" with high legibility.
      `;
    }

    const enhancedPrompt = `
      Image Editing Task.
      INSTRUCTION: ${prompt}
      
      ${specialTextInstruction}
      
      GUIDELINES:
      1. Maintain the photorealism and perspective of the original image.
      2. Seamlessly integrate any new elements.
    `.trim();

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: enhancedPrompt }
        ]
      },
      config: {
        safetySettings: safetySettings,
      }
    });

    console.log("Edit Image Response:", response);

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from API.");
    }

    const candidate = candidates[0];

    if (candidate.finishReason === "SAFETY") {
      throw new Error("Edited content was blocked due to safety settings.");
    }

    let textResponse = "";

    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          const resultMimeType = part.inlineData.mimeType || 'image/png';
          return `data:${resultMimeType};base64,${base64EncodeString}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (textResponse) {
      throw new Error(`Model returned text instead of image: ${textResponse}`);
    }

    throw new Error("No edited image data found in response.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
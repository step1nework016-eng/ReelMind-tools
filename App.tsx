import React, { useState, useRef } from 'react';
import { Sparkles, Edit, Upload, Image as ImageIcon, Zap, Cpu, Terminal, Grid } from 'lucide-react';
import { generateImage, editImage } from './services/geminiService';
import { Button } from './components/Button';
import { ImageResult } from './components/ImageResult';
import { Mode, GeneratedImage, LoadingState, AspectRatio } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('image/png');
  const [resultImage, setResultImage] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ASPECT_RATIOS: AspectRatio[] = [
    { label: "1:1 方形", value: "1:1" },
    { label: "16:9 橫向", value: "16:9" },
    { label: "9:16 直向", value: "9:16" },
    { label: "3:4 垂直", value: "3:4" },
    { label: "4:3 水平", value: "4:3" },
  ];

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setResultImage(null);
    setPrompt('');
    // Don't clear source image immediately, user might want to switch back
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceImage(event.target.result as string);
          setSourceMimeType(file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceImage(event.target.result as string);
          setSourceMimeType(file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    if (mode === 'edit' && !sourceImage) {
      alert("請上傳圖片以進行編輯。");
      return;
    }

    setLoading({ 
      isLoading: true, 
      message: mode === 'generate' ? '正在初始化神經網路...' : '正在分析視覺數據...' 
    });
    setResultImage(null);

    try {
      let imageUrl = '';
      if (mode === 'generate') {
        imageUrl = await generateImage(prompt, aspectRatio);
      } else {
        if (!sourceImage) throw new Error("缺少原始圖片");
        imageUrl = await editImage(sourceImage, sourceMimeType, prompt);
      }

      setResultImage({
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now(),
        mode: mode
      });
    } catch (error) {
      console.error(error);
      alert(`操作失敗: ${(error as Error).message}`);
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage.url;
      link.download = `reelmind-${mode}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text font-sans selection:bg-cyber-primary selection:text-cyber-black bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]">
      
      {/* Header */}
      <header className="border-b border-cyber-gray bg-cyber-black/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyber-primary text-cyber-black flex items-center justify-center font-bold rounded-sm animate-pulse-fast">
              R
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white">
              REEL<span className="text-cyber-primary">MIND</span> <span className="text-xs font-mono text-cyber-secondary border border-cyber-secondary px-1 ml-2 rounded opacity-80">v2.5 FLASH</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-cyber-primary/60">
             <span className="hidden sm:flex items-center gap-1"><Cpu size={14} /> 系統狀態：連線中</span>
             <span className="hidden sm:flex items-center gap-1"><Zap size={14} /> 核心效率：100%</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Toggles */}
        <div className="flex justify-center mb-10">
          <div className="bg-cyber-gray p-1 rounded flex gap-1 border border-cyber-gray/50 shadow-lg">
            <button
              onClick={() => handleModeChange('generate')}
              className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                mode === 'generate' 
                  ? 'bg-cyber-primary text-cyber-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={16} />
              生成影像
            </button>
            <button
              onClick={() => handleModeChange('edit')}
              className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                mode === 'edit' 
                  ? 'bg-cyber-secondary text-white shadow-[0_0_15px_rgba(255,0,60,0.4)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Edit size={16} />
              編輯影像
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-cyber-dark border border-cyber-gray p-6 rounded-lg shadow-xl relative overflow-hidden">
               {/* Decorative Lines */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary to-transparent opacity-50"></div>
               
               <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase">
                 <Terminal size={18} className="text-cyber-primary" />
                 {mode === 'generate' ? '生成參數設定' : '編輯參數設定'}
               </h2>

               {/* Edit Mode: Image Uploader */}
               {mode === 'edit' && (
                 <div className="mb-6 space-y-2">
                   <label className="text-xs text-cyber-primary font-mono uppercase">參考圖源</label>
                   <div 
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={handleDrop}
                     onClick={() => fileInputRef.current?.click()}
                     className={`w-full aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden bg-black/40 ${
                       sourceImage ? 'border-cyber-primary' : 'border-gray-700 hover:border-gray-500'
                     }`}
                   >
                     {sourceImage ? (
                       <div className="relative w-full h-full">
                         <img src={sourceImage} alt="Source" className="w-full h-full object-contain p-2" />
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-mono text-sm flex items-center gap-2"><Upload size={16}/> 更換圖片</p>
                         </div>
                       </div>
                     ) : (
                       <div className="text-center p-6">
                         <ImageIcon className="mx-auto w-12 h-12 text-gray-600 mb-2 group-hover:text-cyber-primary transition-colors" />
                         <p className="text-gray-400 text-sm font-mono">拖放檔案</p>
                         <p className="text-gray-600 text-xs mt-1">或是點擊上傳</p>
                       </div>
                     )}
                     <input 
                       ref={fileInputRef}
                       type="file" 
                       accept="image/*" 
                       onChange={handleFileUpload} 
                       className="hidden" 
                     />
                   </div>
                 </div>
               )}

               {/* Generate Mode: Aspect Ratio Selector */}
               {mode === 'generate' && (
                 <div className="mb-4">
                    <label className="text-xs text-cyber-primary font-mono uppercase block mb-2">畫面比例</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`text-xs py-2 px-1 border rounded transition-colors font-mono ${
                            aspectRatio === ratio.value
                              ? "border-cyber-primary text-cyber-primary bg-cyber-primary/10"
                              : "border-gray-700 text-gray-500 hover:border-gray-500"
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                 </div>
               )}

               {/* Prompt Input */}
               <div className="space-y-2">
                 <label className="text-xs text-cyber-primary font-mono uppercase">
                   {mode === 'generate' ? '提示詞指令' : '編輯指令'}
                 </label>
                 <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        mode === 'generate' 
                        ? "請輸入描述以生成影像... 例如：『具有賽博龐克美感的 4x4 ReelMind Logo』" 
                        : "請輸入編輯指令... 例如：『加入復古濾鏡』、『將背景改為下雪場景』"
                      }
                      className="w-full h-32 bg-black/50 border border-gray-700 rounded p-3 text-sm focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all font-mono resize-none text-gray-300 placeholder-gray-600"
                    />
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-600 font-mono">
                      GEMINI 2.5 FLASH 模型
                    </div>
                 </div>
               </div>

               {/* Submit Button */}
               <div className="mt-6">
                 <Button 
                   onClick={handleSubmit} 
                   isLoading={loading.isLoading} 
                   className="w-full"
                   disabled={!prompt || (mode === 'edit' && !sourceImage)}
                   variant={mode === 'generate' ? 'primary' : 'secondary'}
                   icon={<Zap size={18} />}
                 >
                   {mode === 'generate' ? '開始生成' : '執行編輯'}
                 </Button>
               </div>
            </div>

            {/* Hint Box */}
            <div className="bg-cyber-gray/30 border-l-2 border-cyber-accent p-4 rounded-r text-sm text-gray-400 font-mono">
              <p className="flex items-center gap-2 mb-1 text-cyber-accent uppercase font-bold text-xs"><Grid size={12}/> 創作建議</p>
              {mode === 'generate' 
                ? "您可以嘗試輸入『具有未來科技感的 3D Logo』來體驗品牌設計能力。" 
                : "建議上傳清晰的圖片，並給予具體明確的指令，例如『將天空換成極光』。"}
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7">
            <div className="bg-cyber-dark border border-cyber-gray p-1 rounded-lg shadow-2xl h-full min-h-[500px] flex flex-col relative">
               
               {/* Status Bar */}
               <div className="bg-black/50 p-2 flex justify-between items-center text-[10px] font-mono text-gray-500 mb-1 rounded-t">
                 <span>視覺輸出控制台</span>
                 <span>{loading.isLoading ? '影像處理中...' : resultImage ? '渲染完成' : '待機中'}</span>
               </div>

               {/* Main Display Area */}
               <div className="flex-1 bg-black/20 rounded relative p-4 flex items-center justify-center overflow-hidden">
                 {/* Grid Background */}
                 <div className="absolute inset-0 z-0 opacity-10" 
                      style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                 </div>

                 {loading.isLoading ? (
                   <div className="text-center z-10 relative">
                     <div className="w-16 h-16 border-4 border-cyber-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-cyber-primary font-mono animate-pulse">{loading.message}</p>
                     <p className="text-xs text-gray-500 mt-2 font-mono">AI 正在運算中...</p>
                   </div>
                 ) : (
                   <div className="w-full max-w-xl z-10">
                     <ImageResult image={resultImage} onDownload={handleDownload} />
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-cyber-gray bg-cyber-black py-6 mt-12">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-600 font-mono">
              REELMIND AI STUDIO • POWERED BY GEMINI 2.5 FLASH IMAGE • <span className="text-cyber-primary">SECURE CONNECTION</span>
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;
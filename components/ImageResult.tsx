import React from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageResultProps {
  image: GeneratedImage | null;
  onDownload: () => void;
}

export const ImageResult: React.FC<ImageResultProps> = ({ image, onDownload }) => {
  if (!image) {
    return (
      <div className="w-full aspect-square bg-cyber-dark border-2 border-dashed border-cyber-gray rounded-lg flex flex-col items-center justify-center text-gray-500 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite] pointer-events-none"></div>
        <Maximize2 className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-mono text-sm uppercase tracking-widest opacity-50">尚未生成輸出</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in zoom-in duration-500">
      <div className="relative group bg-cyber-dark border border-cyber-primary/30 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        {/* Cyberpunk corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyber-primary z-10"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyber-primary z-10"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyber-primary z-10"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyber-primary z-10"></div>

        <img 
          src={image.url} 
          alt={image.prompt} 
          className="w-full h-auto object-contain bg-black/50"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <p className="text-white/80 text-xs font-mono truncate max-w-[70%]">{image.prompt}</p>
          <button 
            onClick={onDownload}
            className="p-2 bg-cyber-primary text-cyber-black rounded hover:bg-white transition-colors"
            title="下載圖片"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
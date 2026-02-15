import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Layers, Video } from 'lucide-react';

interface ImageUploaderProps {
  onImagesSelected: (files: { base64: string; preview: string; type: 'image' | 'video'; mimeType: string; filename: string }[]) => void;
  compact?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected, compact = false }) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  
  const isMultiple = compact || mode === 'batch';

  const getMimeType = (file: File): string => {
    // If browser detects it, use it.
    if (file.type && file.type !== '') return file.type;
    
    // Fallback for RAW/Special files based on extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'cr2': return 'image/x-canon-cr2';
      case 'nef': return 'image/x-nikon-nef';
      case 'arw': return 'image/x-sony-arw';
      case 'dng': return 'image/x-adobe-dng';
      case 'orf': return 'image/x-olympus-orf';
      case 'rw2': return 'image/x-panasonic-rw2';
      case 'heic': return 'image/heic';
      case 'heif': return 'image/heif';
      case 'mkv': return 'video/x-matroska';
      default: return 'application/octet-stream';
    }
  };

  const processFiles = (fileList: FileList | File[]) => {
    let files = Array.from(fileList);
    
    // Filter out obvious non-media files if possible, but allow our raw extensions
    // Logic: If it has an image/video mime type OR it has a recognized extension
    const validExtensions = ['.arw', '.cr2', '.nef', '.dng', '.orf', '.rw2', '.heic', '.heif', '.mkv'];
    
    files = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('video/') || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (files.length === 0) return;

    if (!isMultiple && files.length > 1) {
      files = [files[0]];
    }

    const promises = files.map(file => {
      return new Promise<{ base64: string; preview: string; type: 'image' | 'video'; mimeType: string; filename: string }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const mimeType = getMimeType(file);
          const isVideo = mimeType.startsWith('video/');
          
          resolve({ 
            base64: result, 
            preview: result, 
            type: isVideo ? 'video' : 'image',
            mimeType: mimeType,
            filename: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      onImagesSelected(results);
    });
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(event.target.files);
    }
    event.target.value = '';
  }, [onImagesSelected, isMultiple]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      processFiles(event.dataTransfer.files);
    }
  }, [onImagesSelected, isMultiple]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  if (compact) {
    return (
      <label className="block w-full h-full cursor-pointer">
        <input 
          type="file" 
          accept="image/*,video/*,.heic,.heif,.avif,.webp,.dng,.cr2,.nef,.arw,.mp4,.mov,.webm,.mkv"
          multiple
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
    );
  }

  return (
    <div 
      className="w-full max-w-2xl mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 flex gap-1 backdrop-blur-sm">
          <button 
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              mode === 'single' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon size={16} />
            <span>Single Shot</span>
          </button>
          <button 
            onClick={() => setMode('batch')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              mode === 'batch' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers size={16} />
            <span>Batch Upload</span>
          </button>
        </div>
      </div>

      <label 
        htmlFor="file-upload" 
        className="group relative flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-800/40 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative z-10 flex flex-col items-center p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-indigo-500/30">
            {isMultiple ? (
              <Layers className="w-10 h-10 text-indigo-400" />
            ) : (
              <ImageIcon className="w-10 h-10 text-indigo-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">
              {isMultiple ? "Upload Media" : "Upload Media"}
            </h3>
            <p className="text-slate-400 max-w-sm">
              {isMultiple 
                ? "Drag & drop photos or videos to analyze them in batch."
                : "Drag & drop a single photo or video clip for analysis."}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest mt-4">
            <Upload size={14} />
            <span className="flex items-center gap-1">
              {isMultiple ? "Batch Mode" : "Single Mode"} • JPG, RAW, MP4, MOV
            </span>
          </div>
        </div>
        
        <input 
          id="file-upload" 
          type="file" 
          accept="image/*,video/*,.heic,.heif,.avif,.webp,.dng,.cr2,.nef,.arw,.mp4,.mov,.webm,.mkv"
          multiple={isMultiple}
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
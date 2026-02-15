import React, { useState, useEffect } from 'react';
import { analyzeMedia } from './services/geminiService';
import { AnalysisState, AnalysisItem } from './types';
import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import Hero from './components/Hero';
import { Sparkles, X, Plus, AlertCircle, Image as ImageIcon, Video, FileQuestion, FileImage } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const handleImagesSelected = async (newFiles: { base64: string; preview: string; type: 'image' | 'video'; mimeType: string; filename: string }[]) => {
    // Create new items
    const newItems: AnalysisItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      type: file.type,
      mimeType: file.mimeType,
      filename: file.filename,
      preview: file.preview,
      analysis: null,
      status: AnalysisState.ANALYZING,
    }));

    setItems(prev => [...prev, ...newItems]);

    // Process each new item independently
    newItems.forEach(async (item, index) => {
      try {
        const result = await analyzeMedia(newFiles[index].base64, newFiles[index].mimeType);
        setItems(currentItems => 
          currentItems.map(i => 
            i.id === item.id 
              ? { ...i, analysis: result, status: AnalysisState.SUCCESS } 
              : i
          )
        );
      } catch (err: any) {
        console.error(err);
        setItems(currentItems => 
          currentItems.map(i => 
            i.id === item.id 
              ? { ...i, status: AnalysisState.ERROR, error: err.message || "Analysis failed" } 
              : i
          )
        );
      }
    });
  };

  const removeItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedItem = items.find(i => i.id === selectedId);

  // Helper to check if browser can display this mimetype
  const isPreviewable = (mime: string) => {
    // Browsers typically support these:
    return mime.startsWith('image/jpeg') || 
           mime.startsWith('image/png') || 
           mime.startsWith('image/gif') || 
           mime.startsWith('image/webp') || 
           mime.startsWith('image/bmp') ||
           mime.startsWith('video/mp4') ||
           mime.startsWith('video/webm');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200 overflow-x-hidden flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Layout */}
      {items.length === 0 ? (
        // Empty State (Landing)
        <main className="relative flex-grow container mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
          <Hero />
          <ImageUploader onImagesSelected={handleImagesSelected} />
        </main>
      ) : (
        // Workspace State (Sidebar + Main)
        <div className="relative flex-grow flex flex-col lg:flex-row h-screen overflow-hidden">
          
          {/* Sidebar / List View */}
          <aside className="w-full lg:w-96 bg-slate-950/80 border-r border-slate-800 flex flex-col z-10 backdrop-blur-xl h-auto lg:h-full lg:flex-shrink-0">
             <div className="p-4 border-b border-slate-800 flex items-center justify-between">
               <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <ImageIcon size={16} />
                 Gallery ({items.length})
               </h2>
               <div className="relative group">
                 <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-indigo-400">
                    <Plus size={20} />
                 </button>
                 <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden">
                    <ImageUploader onImagesSelected={handleImagesSelected} compact />
                 </div>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 custom-scrollbar">
               {items.map(item => (
                 <div 
                   key={item.id}
                   onClick={() => setSelectedId(item.id)}
                   className={`relative group p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg flex gap-3 items-start ${
                     selectedId === item.id 
                       ? 'bg-indigo-500/10 border-indigo-500/50 shadow-indigo-500/10' 
                       : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                   }`}
                 >
                   {/* Thumbnail */}
                   <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-800 relative flex items-center justify-center">
                     {isPreviewable(item.mimeType) ? (
                        item.type === 'video' ? (
                          <video src={item.preview} className="w-full h-full object-cover opacity-80" muted />
                        ) : (
                          <img src={item.preview} alt="Thumb" className="w-full h-full object-cover" />
                        )
                     ) : (
                        // Fallback for RAW/HEIC/Special files
                        <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                           <FileImage size={24} className="mb-1" />
                           <span className="text-[9px] uppercase font-bold">{item.mimeType.split('/')[1] || 'RAW'}</span>
                        </div>
                     )}
                     
                     {/* Type Icon Overlay */}
                     {item.type === 'video' && (
                        <div className="absolute top-1 left-1 bg-black/60 p-0.5 rounded backdrop-blur-sm z-10">
                           <Video size={10} className="text-white" />
                        </div>
                     )}

                     {/* Status Overlay */}
                     {item.status === AnalysisState.ANALYZING && (
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                         <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                       </div>
                     )}
                     {item.status === AnalysisState.ERROR && (
                        <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center z-20">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                     )}
                   </div>

                   {/* Content Snippet */}
                   <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-1">
                     <div>
                       <div className="flex justify-between items-start">
                         <span className={`text-xs font-semibold uppercase tracking-wider mb-1 block truncate ${selectedId === item.id ? 'text-indigo-300' : 'text-slate-400'}`}>
                           {item.analysis ? item.analysis.location || 'Unknown Location' : item.filename}
                         </span>
                       </div>
                       <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                         {item.analysis 
                           ? item.analysis.visual_detail.visual_description 
                           : "Analyzing visual structure..."}
                       </p>
                     </div>
                     
                     {item.status === AnalysisState.SUCCESS && (
                       <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 font-mono mt-auto">
                         <Sparkles size={10} />
                         <span>ANALYZED</span>
                       </div>
                     )}
                   </div>

                   {/* Delete Button */}
                   <button 
                     onClick={(e) => removeItem(e, item.id)}
                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 text-slate-600 rounded transition-all z-30"
                   >
                     <X size={14} />
                   </button>
                 </div>
               ))}
             </div>
          </aside>

          {/* Main Workspace */}
          <main className="flex-grow h-full overflow-y-auto custom-scrollbar relative bg-slate-950/30">
            {selectedItem ? (
              <div className="p-6 lg:p-12 pb-32">
                {selectedItem.status === AnalysisState.SUCCESS && selectedItem.analysis ? (
                  <div className="animate-fade-in">
                    <div className="max-w-5xl mx-auto mb-8">
                       <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 mb-8 max-h-[60vh] flex items-center justify-center group min-h-[300px]">
                          {/* Main Media Viewer */}
                          {isPreviewable(selectedItem.mimeType) ? (
                              selectedItem.type === 'video' ? (
                                <video 
                                    src={selectedItem.preview} 
                                    controls 
                                    className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <img 
                                  src={selectedItem.preview} 
                                  alt="Main View" 
                                  className="max-h-full max-w-full object-contain" 
                                />
                              )
                          ) : (
                              // Placeholder for RAW/Unsupported
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <FileQuestion className="w-16 h-16 mb-4 opacity-50" />
                                <h3 className="text-xl font-light">Preview Unavailable</h3>
                                <p className="text-sm text-slate-500 mt-2 font-mono">{selectedItem.filename}</p>
                                <p className="text-xs text-slate-600 mt-1">{selectedItem.mimeType}</p>
                                <div className="mt-4 px-4 py-2 bg-slate-800 rounded text-xs text-indigo-400 border border-slate-700">
                                  Analysis Complete
                                </div>
                              </div>
                          )}
                          
                          {/* Metadata Overlay (Only for images or paused video logic) */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <p className="text-white/80 text-sm font-mono">
                               {selectedItem.analysis.technicalParams.cameraType} • {selectedItem.analysis.technicalParams.focalLength} • {selectedItem.analysis.technicalParams.aperture}
                             </p>
                          </div>
                       </div>
                    </div>
                    <AnalysisDisplay data={selectedItem.analysis} />
                  </div>
                ) : selectedItem.status === AnalysisState.ERROR ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-70">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                       <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-300 mb-2">Analysis Failed</h3>
                    <p className="text-slate-500 max-w-md break-words">{selectedItem.error}</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    {/* OPTICAL LENS ANIMATION */}
                    <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping opacity-20"></div>
                      <div className="absolute inset-2 rounded-full border border-slate-700 border-dashed animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-8 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-[spin_3s_linear_infinite]"></div>
                      <div className="absolute inset-16 rounded-full border-4 border-slate-800 border-l-indigo-400 animate-spin"></div>
                      <div className="absolute w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse"></div>
                    </div>
                    
                    <h2 className="text-3xl font-light text-white mb-3 tracking-tight">Processing Visual Data</h2>
                    <p className="text-indigo-400/80 font-mono text-sm animate-pulse">
                      EXTRACTING_{selectedItem.type === 'video' ? 'TEMPORAL' : 'LIGHT'}_PHYSICS...
                    </p>
                    <p className="text-slate-600 text-xs mt-4 max-w-xs mx-auto">
                      Uploading {selectedItem.filename} to neural engine...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <p>Select an image or video from the gallery</p>
              </div>
            )}
          </main>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
    </div>
  );
};

export default App;
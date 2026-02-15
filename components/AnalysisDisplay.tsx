import React, { useState } from 'react';
import { PhotoAnalysis } from '../types';
import { Aperture, Camera, Compass, Frame, Lightbulb, Ruler, Zap, FileJson, AlignLeft, Copy, Check, Tag, Type, ClipboardCopy } from 'lucide-react';

interface AnalysisDisplayProps {
  data: PhotoAnalysis;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    // Single Shot Format: Title + Description + Keywords
    const text = `${data.title}\n\n${data.visual_detail.visual_description}\n\n${data.keywords.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyReport = () => {
    const report = [
      `TITLE: ${data.title}`,
      `\n-- VISUAL DESCRIPTION --\n${data.visual_detail.visual_description}`,
      `\n-- KEYWORDS --\n${data.keywords.join(', ')}`,
      `\n-- TECHNICAL ESTIMATES --`,
      `Focal Length: ${data.technicalParams.focalLength}`,
      `Aperture:     ${data.technicalParams.aperture}`,
      `ISO:          ${data.technicalParams.iso}`,
      `Shutter:      ${data.technicalParams.shutterSpeed}`,
      `Camera:       ${data.technicalParams.cameraType}`,
      `\n-- DETAILED ANALYSIS --`,
      `LENS & OPTICS:\n${data.lens}`,
      `\nATMOSPHERE & LIGHTING:\n${data.atmosphere}`,
      `\nGEOMETRY & COMPOSITION:\n${data.geometry}`,
      `\nANGLE & PERSPECTIVE:\n${data.angle}`,
      `\nLOCATION:\n${data.location || 'N/A'}`
    ].join('\n');
    
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* View Mode Toggle & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-light text-slate-300">Analysis Result</h2>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-sm font-medium shadow-sm group"
          >
            {copiedReport ? <Check size={16} className="text-emerald-400" /> : <ClipboardCopy size={16} className="group-hover:text-indigo-400 transition-colors" />}
            <span>{copiedReport ? 'Copied Full Report' : 'Copy Full Report'}</span>
          </button>

          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/50 backdrop-blur-md">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'visual' 
                  ? 'bg-indigo-500/20 text-indigo-200 shadow-sm border border-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <AlignLeft size={16} />
              <span>Report</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'json' 
                  ? 'bg-indigo-500/20 text-indigo-200 shadow-sm border border-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileJson size={16} />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="animate-fade-in space-y-6">
          
          {/* Main Metadata Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 border-t-4 border-indigo-500 shadow-2xl shadow-indigo-900/20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest">
                        <Type size={14} />
                        <span>Single Shot Title</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight">
                        {data.title}
                    </h1>
                </div>
                <button 
                  onClick={handleCopyAll}
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 group"
                >
                  {copiedAll ? <Check size={18} /> : <Copy size={18} />}
                  <span className="text-sm font-semibold">{copiedAll ? 'Copied!' : 'Copy Single Shot'}</span>
                </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlignLeft size={14} />
                    Detailed Description
                </h3>
                <div className="prose prose-invert prose-slate max-w-none">
                  <p className="text-slate-300 leading-relaxed text-base md:text-lg font-light whitespace-pre-wrap">
                      {data.visual_detail.visual_description}
                  </p>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag size={14} />
                    Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                    {data.keywords.map((keyword, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-indigo-200 transition-colors cursor-default select-all">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <TechItem label="Focal Length" value={data.technicalParams.focalLength} icon={<Ruler size={16} />} />
              <TechItem label="Aperture" value={data.technicalParams.aperture} icon={<Aperture size={16} />} />
              <TechItem label="ISO" value={data.technicalParams.iso} icon={<Zap size={16} />} />
              <TechItem label="Shutter" value={data.technicalParams.shutterSpeed} icon={<Compass size={16} />} />
              <TechItem label="System" value={data.technicalParams.cameraType} icon={<Camera size={16} />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detailed Breakdown */}
            <div className="space-y-6">
              <SectionCard 
                title="Lens & Optics" 
                icon={<Aperture className="text-rose-400" />}
                content={data.lens}
                borderColor="border-rose-500/50"
              />
              <SectionCard 
                title="Geometry & Composition" 
                icon={<Frame className="text-emerald-400" />}
                content={data.geometry}
                borderColor="border-emerald-500/50"
              />
            </div>

            <div className="space-y-6">
              <SectionCard 
                title="Atmosphere & Lighting" 
                icon={<Lightbulb className="text-amber-400" />}
                content={data.atmosphere}
                borderColor="border-amber-500/50"
              />
              <SectionCard 
                title="Angle & Perspective" 
                icon={<Compass className="text-sky-400" />}
                content={data.angle}
                borderColor="border-sky-500/50"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Full JSON View */
        <div className="glass-panel rounded-2xl p-0 relative overflow-hidden animate-fade-in border-t-4 border-emerald-500/50 shadow-2xl">
             <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2 text-emerald-400">
                   <FileJson size={18} />
                   <span className="font-mono text-sm font-semibold">single_shot_data.json</span>
                </div>
                <button 
                  onClick={handleCopyJson}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
             </div>
             <div className="p-6 bg-slate-950/80 overflow-x-auto">
               <pre className="font-mono text-xs md:text-sm text-emerald-400/90 leading-relaxed">
                 <code>{JSON.stringify(data, null, 2)}</code>
               </pre>
             </div>
        </div>
      )}
    </div>
  );
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; content: string; borderColor: string }> = ({ title, icon, content, borderColor }) => (
  <div className={`glass-panel p-6 rounded-2xl border-l-2 ${borderColor} transition-all duration-300 hover:bg-slate-800/40`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
    </div>
    <p className="text-slate-400 leading-relaxed text-sm md:text-base">
      {content}
    </p>
  </div>
);

const TechItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
    <div className="text-indigo-400 mb-1 opacity-70">{icon}</div>
    <span className="text-slate-100 font-bold text-sm md:text-base truncate w-full">{value}</span>
    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{label}</span>
  </div>
);

export default AnalysisDisplay;
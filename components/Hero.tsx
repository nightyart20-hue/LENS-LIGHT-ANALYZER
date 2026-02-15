import React from 'react';
import { Aperture } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="text-center mb-12 animate-fade-in-down">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6 backdrop-blur-sm">
        <Aperture size={16} />
        <span className="text-xs font-semibold tracking-wide uppercase">AI-Powered Optics Engine</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 tracking-tight">
        Decide the Light.
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
        Uncover the hidden geometry, lens characteristics, and atmospheric depth of your photography with professional-grade analysis.
      </p>
    </div>
  );
};

export default Hero;
'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, Stethoscope, Sparkles, ArrowUpRight } from 'lucide-react';

interface DepartmentProps {
  departments: any[];
  depIcons: Record<string, any>;
}

export default function DepartmentsSection({ departments, depIcons }: DepartmentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

  // Scroll Handler (Left / Right)
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section ref={sectionRef} className="relative py-20 px-6 overflow-hidden bg-slate-50">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100/80 border border-blue-200 mb-4 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Dynamic Care
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Specialized <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Medical Wings</span>
            </h2>
          </motion.div>

          {/* SLIDER CONTROLS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => handleScroll('left')}
              aria-label="Scroll Left"
              className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-md active:scale-95 group"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Scroll Right"
              className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-md active:scale-95 group"
            >
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* WHITE CARDS SLIDER WITH ANIMATED DARK EDGES */}
        <div
          ref={scrollContainerRef}
          className="flex gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-10 pt-4 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {departments.map((dep, idx) => {
            const Icon = depIcons[dep.icon] || depIcons[dep.icon?.toLowerCase()] || Stethoscope;
            const accentColor = dep.color || '#2563EB';

            return (
              <motion.div
                key={dep.documentId || dep.id || idx}
                initial={{ opacity: 0, y: 40, rotate: -1 }}
                animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative min-w-[300px] max-w-[300px] snap-start rounded-tl-[2.5rem] rounded-tr-xl rounded-bl-xl rounded-br-[3.5rem] bg-white p-[2px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                {/* 🌟 ANIMATED DARK BORDER EDGE TRAIL */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 rounded-tl-[2.5rem] rounded-tr-xl rounded-bl-xl rounded-br-[3.5rem] opacity-30 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                
                {/* INNER CARD CONTAINER WITH PURE WHITE BACKGROUND */}
                <div className="relative h-full w-full bg-white rounded-tl-[2.4rem] rounded-tr-[0.7rem] rounded-bl-[0.7rem] rounded-br-[3.4rem] p-7 flex flex-col justify-between overflow-hidden">
                  
                  {/* ACCENT LIGHT GLOW */}
                  <div 
                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div>
                    {/* TOP ICON CAPSULE & ARROW */}
                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 border"
                        style={{ 
                          backgroundColor: `${accentColor}12`,
                          borderColor: `${accentColor}30`
                        }}
                      >
                        <Icon className="w-8 h-8" style={{ color: accentColor }} />
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 group-hover:rotate-45 shadow-sm">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* TITLE & DESCRIPTION */}
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-3 transition-colors duration-300 group-hover:text-blue-600 relative z-10">
                      {dep.name}
                    </h3>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed line-clamp-3 relative z-10">
                      {dep.description || 'Advanced healthcare services backed by top medical professionals and diagnostic equipment.'}
                    </p>
                  </div>

                  {/* BOTTOM ACCENT BADGE */}
                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <span 
                      className="text-xs font-extrabold px-3.5 py-1.5 rounded-full border transition-all duration-300 shadow-sm"
                      style={{ 
                        color: accentColor,
                        backgroundColor: `${accentColor}10`,
                        borderColor: `${accentColor}20`
                      }}
                    >
                      {dep.count || 0} Specialists
                    </span>
                    
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-slate-900 transition-colors flex items-center gap-1">
                      Details <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
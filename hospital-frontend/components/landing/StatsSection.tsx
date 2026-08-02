'use client';
import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Stethoscope, Activity } from 'lucide-react';

/**
 * "Vitals monitor" design on a white panel — same clinical-readout concept,
 * re-tuned for a light background: soft color-blob glow behind each number
 * instead of neon text-shadow, tinted dividers, and a shadow-lifted bezel
 * so the panel still reads with depth against white.
 *
 * Requires: npm install framer-motion lucide-react
 * Drop-in replacement — same export shape (`export default function StatsSection()`).
 */

interface Stat {
  label: string;
  targetValue: number;
  suffix?: string;
  accentColor: string;
  wave: string;
}

const STATS: Stat[] = [
  {
    label: 'Expert Doctors',
    targetValue: 50,
    suffix: '+',
    accentColor: '#0D9488',
    wave: 'M0 20 H30 L36 6 L42 34 L48 20 H78 L84 12 L90 28 L96 20 H140',
  },
  {
    label: 'Patients Served',
    targetValue: 1000,
    suffix: '+',
    accentColor: '#DB2777',
    wave: 'M0 20 H20 L26 10 L32 30 L38 20 H60 L66 4 L72 36 L78 20 H100 L106 14 L112 26 L118 20 H140',
  },
  {
    label: 'Departments',
    targetValue: 8,
    suffix: '',
    accentColor: '#7C3AED',
    wave: 'M0 20 H40 L46 8 L52 32 L58 20 H140',
  },
  {
    label: 'Years of Service',
    targetValue: 15,
    suffix: '+',
    accentColor: '#16A34A',
    wave: 'M0 20 H24 L30 16 L36 24 L42 20 H70 L76 2 L82 38 L88 20 H140',
  },
];

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const channelVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Channel({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const countRef = useRef<HTMLSpanElement>(null);

  const startCounting = () => {
    const el = countRef.current;
    if (!el) return;
    const digits = stat.targetValue.toLocaleString().length;
    const flickerDuration = 420;
    const countDuration = 1700;
    const startDelay = 150 + index * 130;
    let raf = 0;

    const runFlicker = (flickerStart: number) => {
      const step = (t: number) => {
        const elapsed = t - flickerStart;
        if (elapsed < flickerDuration) {
          el.textContent = Array.from({ length: digits }, () =>
            Math.floor(Math.random() * 10)
          ).join('');
          raf = requestAnimationFrame(step);
        } else {
          runCount(t);
        }
      };
      raf = requestAnimationFrame(step);
    };

    const runCount = (countStart: number) => {
      const step = (t: number) => {
        const progress = Math.min((t - countStart) / countDuration, 1);
        el.textContent = Math.floor(easeOutExpo(progress) * stat.targetValue).toLocaleString();
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const timer = setTimeout(() => {
      raf = requestAnimationFrame(runFlicker);
    }, startDelay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  };

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={channelVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      onViewportEnter={startCounting}
      className="channel"
      style={{ ['--accent' as any]: stat.accentColor }}
    >
      <div className="channel-glow" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.15rem' }}>
        <span className="status-dot" />
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#64748B',
          }}
        >
          {stat.label}
        </span>
      </div>

      <div className="readout-wrap">
        <div className="readout-blob" />
        <div className="readout">
          <span ref={countRef}>0</span>
          <span style={{ color: stat.accentColor, marginLeft: 2 }}>{stat.suffix}</span>
        </div>
      </div>

      <svg
        viewBox="0 0 140 40"
        width="100%"
        height="34"
        preserveAspectRatio="none"
        style={{ marginTop: '1rem', overflow: 'visible' }}
        aria-hidden="true"
      >
        <motion.path
          d={stat.wave}
          fill="none"
          stroke={stat.accentColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="wave"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 0.8 } : {}}
          transition={{ duration: 1.1, delay: 0.35 + index * 0.1, ease: 'easeInOut' }}
        />
      </svg>

      <style jsx>{`
        .channel {
          position: relative;
          padding: 2.25rem 2rem;
          isolation: isolate;
          transition: background 0.35s ease;
        }
        .channel:hover {
          background: radial-gradient(120% 140% at 50% 0%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%);
        }
        .channel-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.35s ease;
          box-shadow: inset 0 1px 0 color-mix(in srgb, var(--accent) 35%, transparent);
        }
        .channel:hover .channel-glow {
          opacity: 1;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 60%, transparent);
          display: inline-block;
          animation: blink 1.8s ease-in-out infinite;
          animation-delay: ${index * 0.2}s;
        }
        .readout-wrap {
          position: relative;
        }
        .readout-blob {
          position: absolute;
          left: -10px;
          top: -18px;
          width: 100px;
          height: 70px;
          background: var(--accent);
          opacity: 0.1;
          filter: blur(28px);
          border-radius: 50%;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .channel:hover .readout-blob {
          opacity: 0.2;
        }
        .readout {
          position: relative;
          font-family: ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace;
          font-size: clamp(2.4rem, 4.5vw, 3.2rem);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1;
          transition: transform 0.3s ease;
        }
        .channel:hover .readout {
          transform: scale(1.035);
        }
        .channel:hover :global(.wave) {
          stroke-width: 2.2;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <section className="vitals-section">
      <div className="grid-overlay" />
      <div className="sweep" />

      {/* Ambient drifting color blobs for depth, tuned faint for white */}
      {[
        { top: '10%', left: '6%', size: 90, color: '#0D9488', dur: 11 },
        { top: '68%', left: '14%', size: 70, color: '#DB2777', dur: 14 },
        { top: '18%', left: '88%', size: 100, color: '#7C3AED', dur: 12 },
        { top: '78%', left: '90%', size: 80, color: '#16A34A', dur: 9 },
      ].map((p, i) => (
        <motion.span
          key={i}
          className="particle"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -16, 0], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}

      <div className="inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', color: '#0D9488' }}
            >
              <Stethoscope size={18} />
            </motion.span>
            <h2 className="heading">Trusted Healthcare, Measured Live</h2>
          </div>
          <div className="status-pill">
            <Activity size={13} />
            <span>STATUS · NOMINAL</span>
          </div>
        </motion.div>

        {/* Bezel: thin rotating gradient ring, panel lifted with shadow to read against white */}
        <div className="bezel">
          <div className="bezel-spin" />
          <div className="panel">
            {STATS.map((stat, i) => (
              <Channel key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .vitals-section {
          position: relative;
          background: #ffffff;
          padding: 4.5rem 1.5rem 5rem;
          overflow: hidden;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .sweep {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 18%;
          background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.05), transparent);
          pointer-events: none;
          animation: sweep 7s linear infinite;
        }
        @keyframes sweep {
          0% { left: -20%; }
          100% { left: 110%; }
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(20px);
          pointer-events: none;
        }
        .inner {
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2.75rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }
        .heading {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0;
          background: linear-gradient(90deg, #0f172a, #0d9488, #0f172a);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 5s linear infinite;
        }
        @keyframes shimmer {
          to { background-position: -200% center; }
        }
        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #64748b;
          font-size: 0.78rem;
          font-family: ui-monospace, monospace;
          letter-spacing: 0.03em;
        }
        .bezel {
          position: relative;
          border-radius: 22px;
          padding: 1px;
          overflow: hidden;
          box-shadow: 0 20px 60px -24px rgba(15, 23, 42, 0.22);
        }
        .bezel-spin {
          position: absolute;
          inset: -60%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            #0d9488 8%,
            transparent 18%,
            transparent 45%,
            #db2777 53%,
            transparent 63%,
            transparent 100%
          );
          animation: spin 8s linear infinite;
          opacity: 0.7;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .panel {
          position: relative;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border-radius: 21px;
          background: #ffffff;
        }
        .panel > :global(.channel:nth-child(odd)) {
          border-right: 1px solid rgba(15, 23, 42, 0.08);
        }
        .panel > :global(.channel:nth-child(-n+2)) {
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }
        @media (min-width: 768px) {
          .panel {
            grid-template-columns: repeat(4, 1fr);
          }
          .panel > :global(.channel:nth-child(-n+2)) {
            border-bottom: none;
          }
          .panel > :global(.channel:not(:last-child)) {
            border-right: 1px solid rgba(15, 23, 42, 0.08);
          }
        }
      `}</style>
    </section>
  );
}
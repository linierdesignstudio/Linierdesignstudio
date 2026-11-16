import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

const effectCopy = {
  [Language.ID]: {
    headline: ['Ruang', 'Membentuk', 'Pengalaman'],
    intro: 'Arsitektur, interior, dan konstruksi yang menyatu untuk kehidupan sehari-hari.',
    words: ['Ruang', 'Membentuk', 'Pengalaman', 'Arsitektur', 'Interior', 'Bangun', 'Cahaya', 'Material', 'Detail', 'Presisi', 'Kehidupan', 'Linier'],
    cue: 'Gulir untuk menjelajah',
  },
  [Language.EN]: {
    headline: ['Spaces', 'Shape', 'Experience'],
    intro: 'Architecture, interiors, and construction brought together for everyday life.',
    words: ['Spaces', 'Shape', 'Experience', 'Architecture', 'Interior', 'Build', 'Light', 'Material', 'Detail', 'Precision', 'Living', 'Linier'],
    cue: 'Scroll to explore',
  },
  [Language.CN]: {
    headline: ['空间', '塑造', '体验'],
    intro: '融合建筑、室内与施工，为日常生活创造舒适空间。',
    words: ['空间', '塑造', '体验', '建筑', '室内', '建造', '光线', '材料', '细节', '精准', '生活', 'Linier'],
    cue: '向下滚动探索',
  },
} satisfies Record<Language, {
  headline: string[];
  intro: string;
  words: string[];
  cue: string;
}>;

const wordPlanes = [
  {
    key: 'distant',
    depth: -240,
    rotation: 'rotateY(-20deg) rotateX(6deg)',
    words: [
      { index: 2, left: '-18%', top: '1%', scale: 0.82, opacity: 0.46 },
      { index: 1, left: '46%', top: '0%', scale: 1.18, opacity: 0.72 },
      { index: 3, left: '55%', top: '68%', scale: 0.76, opacity: 0.58 },
    ],
  },
  {
    key: 'middle',
    depth: -70,
    rotation: 'rotateY(9deg) rotateX(-4deg)',
    words: [
      { index: 0, left: '-10%', top: '27%', scale: 0.9, opacity: 0.68 },
      { index: 2, left: '-14%', top: '48%', scale: 1.2, opacity: 0.76 },
      { index: 4, left: '52%', top: '83%', scale: 0.78, opacity: 0.58 },
    ],
  },
  {
    key: 'near',
    depth: 100,
    rotation: 'rotateY(22deg) rotateX(8deg)',
    words: [
      { index: 1, left: '59%', top: '9%', scale: 0.8, opacity: 0.62 },
      { index: 3, left: '-13%', top: '65%', scale: 0.84, opacity: 0.56 },
    ],
  },
];

const AboutBrandEffect: React.FC = () => {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const copy = effectCopy[language];
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, (current) => {
    const section = sectionRef.current;
    if (!section) return 0;

    const sectionTop = section.getBoundingClientRect().top + current;
    const scrollRange = section.offsetHeight - window.innerHeight;
    if (scrollRange <= 0) return 1;

    return Math.max(0, Math.min(1, (current - sectionTop) / scrollRange));
  });

  const backgroundColor = useTransform(scrollYProgress, [0, 0.18, 0.42], ['#f1f1ee', '#f1f1ee', '#080909']);
  const introOpacity = useTransform(scrollYProgress, [0, 0.14, 0.31], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.34], [0, -96]);
  const darkOpacity = useTransform(scrollYProgress, [0.14, 0.4], [0, 1]);
  const gridOpacity = useTransform(scrollYProgress, [0.22, 0.43, 1], [0, 0.72, 0.34]);
  const gridY = useTransform(scrollYProgress, [0.22, 1], [44, -30]);
  const gridScale = useTransform(scrollYProgress, [0.22, 1], [0.92, 1.14]);
  const distantTextOpacity = useTransform(scrollYProgress, [0.42, 0.68, 1], [0, 0.3, 0.22]);
  const distantTextX = useTransform(scrollYProgress, [0.4, 1], ['12%', '-16%']);
  const distantTextY = useTransform(scrollYProgress, [0.4, 1], ['-8%', '10%']);
  const distantTextScale = useTransform(scrollYProgress, [0.4, 1], [0.72, 1.35]);
  const middleTextOpacity = useTransform(scrollYProgress, [0.46, 0.72, 1], [0, 0.34, 0.3]);
  const middleTextX = useTransform(scrollYProgress, [0.4, 1], ['-16%', '15%']);
  const middleTextY = useTransform(scrollYProgress, [0.4, 1], ['12%', '-8%']);
  const middleTextScale = useTransform(scrollYProgress, [0.4, 1], [0.75, 1.4]);
  const nearTextOpacity = useTransform(scrollYProgress, [0.54, 0.82, 1], [0, 0.23, 0.2]);
  const nearTextX = useTransform(scrollYProgress, [0.4, 1], ['18%', '-20%']);
  const nearTextY = useTransform(scrollYProgress, [0.4, 1], ['20%', '-14%']);
  const nearTextScale = useTransform(scrollYProgress, [0.4, 1], [0.8, 1.65]);
  const textPlaneMotion = [
    { opacity: distantTextOpacity, x: distantTextX, y: distantTextY, scale: distantTextScale },
    { opacity: middleTextOpacity, x: middleTextX, y: middleTextY, scale: middleTextScale },
    { opacity: nearTextOpacity, x: nearTextX, y: nearTextY, scale: nearTextScale },
  ];
  const focusLineMotion = [
    {
      x: useTransform(scrollYProgress, [0.32, 0.46, 0.78], ['-18vw', '0vw', '22vw']),
      y: useTransform(scrollYProgress, [0.32, 0.46, 0.78], ['-8vh', '0vh', '-18vh']),
      scale: useTransform(scrollYProgress, [0.32, 0.46, 0.78], [0.72, 1, 1.65]),
      opacity: useTransform(scrollYProgress, [0.32, 0.42, 0.64, 0.78], [0, 1, 0.82, 0]),
    },
    {
      x: useTransform(scrollYProgress, [0.32, 0.48, 0.78], ['18vw', '0vw', '-18vw']),
      y: useTransform(scrollYProgress, [0.32, 0.48, 0.78], ['12vh', '0vh', '-4vh']),
      scale: useTransform(scrollYProgress, [0.32, 0.48, 0.78], [0.72, 1, 1.45]),
      opacity: useTransform(scrollYProgress, [0.32, 0.44, 0.68, 0.78], [0, 1, 0.9, 0]),
    },
    {
      x: useTransform(scrollYProgress, [0.32, 0.5, 0.78], ['-14vw', '0vw', '26vw']),
      y: useTransform(scrollYProgress, [0.32, 0.5, 0.78], ['24vh', '0vh', '14vh']),
      scale: useTransform(scrollYProgress, [0.32, 0.5, 0.78], [0.68, 1, 1.9]),
      opacity: useTransform(scrollYProgress, [0.32, 0.46, 0.68, 0.78], [0, 1, 0.55, 0]),
    },
  ];
  const focusOpacity = useTransform(scrollYProgress, [0.28, 0.42, 0.64, 0.8], [0, 1, 0.9, 0]);
  const focusScale = useTransform(scrollYProgress, [0.28, 0.46, 0.8], [0.88, 1, 1.08]);
  const ruleOpacity = useTransform(scrollYProgress, [0.18, 0.32, 0.52], [0, 0.85, 0]);

  return (
    <section ref={sectionRef} aria-label="Linier Studio" className="relative h-[260vh] bg-[#f1f1ee] text-neutral-950">
      <div className="sticky top-0 h-[100svh] min-h-[540px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ backgroundColor }} />

        <motion.div style={{ opacity: darkOpacity }} className="pointer-events-none absolute inset-0 bg-[#080909]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(35,38,38,0.44)_0%,rgba(8,9,9,0)_72%)]" />
          <motion.div style={{ opacity: gridOpacity, y: gridY, scale: gridScale }} className="absolute inset-[-18%]">
            <div
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.075) 1px, transparent 1px)',
                backgroundSize: '8vw 8vh',
              }}
              className="absolute inset-x-[8%] top-[5%] h-[70%] border-x border-white/[0.08]"
            />
            <div
              style={{
                transform: 'perspective(1000px) rotateX(61deg) scale(1.65)',
                transformOrigin: 'center top',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '8vw 8vh',
              }}
              className="absolute inset-x-[-6%] bottom-[-4%] h-[62%]"
            />
            <div className="absolute inset-x-[17%] top-[14%] bottom-[16%] border-x border-white/[0.045]" />
            <div className="absolute inset-x-[29%] top-[21%] bottom-[23%] border-x border-white/[0.04]" />
          </motion.div>
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(8,9,9,0)_18%,rgba(8,9,9,0.8)_100%)]" />
          <div className="absolute inset-0 [perspective:1100px] [transform-style:preserve-3d]">
            {wordPlanes.map((plane, planeIndex) => (
              <motion.div
                key={plane.key}
                style={textPlaneMotion[planeIndex]}
                className="absolute inset-0 [transform-style:preserve-3d]"
              >
                <div
                  style={{ transform: `translateZ(${plane.depth}px) ${plane.rotation}` }}
                  className="absolute inset-0 [transform-style:preserve-3d]"
                >
                  {plane.words.map((placement, wordIndex) => (
                    <span
                      key={`${plane.key}-${wordIndex}`}
                      style={{
                        left: placement.left,
                        top: placement.top,
                        opacity: placement.opacity,
                        transform: `scale(${placement.scale})`,
                        transformOrigin: 'center',
                      }}
                      className="absolute whitespace-nowrap font-display text-[clamp(3rem,10vw,10rem)] font-light leading-none tracking-[-0.075em] text-white"
                    >
                      {copy.words[placement.index]}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div style={{ opacity: ruleOpacity }} className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-white/80" />

        <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 pb-10 text-center sm:px-8">
          <p className="absolute left-5 top-24 font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-500 sm:left-10 sm:top-28 sm:text-[10px]">
            LINIER STUDIO <span className="mx-2 text-neutral-300">/</span> DESIGN · BUILD
          </p>
          <h1 className="max-w-[96vw] font-display text-[clamp(3.4rem,14vw,12rem)] font-normal leading-[0.78] tracking-[-0.085em]">
            {copy.headline.map((word) => <span key={word} className="block">{word}</span>)}
          </h1>
          <p className="mt-8 max-w-xl text-xs leading-6 text-neutral-600 sm:mt-10 sm:text-sm sm:leading-7">{copy.intro}</p>
          <span className="absolute bottom-8 font-mono text-[8px] uppercase tracking-[0.24em] text-neutral-500 sm:bottom-10 sm:text-[9px]">{copy.cue}</span>
        </motion.div>

        <motion.div style={{ opacity: focusOpacity, scale: focusScale }} className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center text-white">
          <h2 className="font-display text-[clamp(2.8rem,8.5vw,9rem)] font-light leading-[0.78] tracking-[-0.075em]">
            {copy.headline.map((word, index) => (
              <motion.span
                key={word}
                style={focusLineMotion[index]}
                className={`block ${index === copy.headline.length - 1 ? 'text-white/55' : 'text-white'}`}
              >
                {word}
              </motion.span>
            ))}
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutBrandEffect;

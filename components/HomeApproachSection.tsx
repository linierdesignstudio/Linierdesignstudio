import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const HomeApproachSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const trackY = useTransform(scrollYProgress, [0, 0.84], ['40%', '-40%']);
  const wordOpacity = [
    useTransform(scrollYProgress, [0, 0.08, 0.19, 0.25], [1, 1, 0.28, 0.16]),
    useTransform(scrollYProgress, [0.1, 0.205, 0.29, 0.37], [0.16, 1, 1, 0.16]),
    useTransform(scrollYProgress, [0.31, 0.41, 0.49, 0.57], [0.16, 1, 1, 0.16]),
    useTransform(scrollYProgress, [0.51, 0.615, 0.7, 0.78], [0.16, 1, 1, 0.16]),
    useTransform(scrollYProgress, [0.71, 0.82, 0.91, 1], [0.16, 1, 1, 1]),
  ];
  const statementOpacity = useTransform(scrollYProgress, [0.56, 0.68, 0.84], [0, 1, 1]);
  const descriptionOpacity = useTransform(scrollYProgress, [0.64, 0.75, 0.88], [0, 1, 1]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-approach-title"
      className="relative h-[440svh] bg-[#dededc] text-neutral-950 dark:bg-[#181818] dark:text-white"
    >
      <div className="sticky top-0 h-[100svh] min-h-[600px] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/[0.08] dark:bg-white/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[48%] h-px bg-black/[0.05] dark:bg-white/[0.05]" />

        <h2
          id="home-approach-title"
          className="absolute left-1/2 top-[16%] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[11px] font-medium tracking-tight sm:text-sm"
        >
          {t.home.approach_label}
        </h2>

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden">
          <motion.div style={{ y: trackY }} className="flex flex-col items-center">
            {t.home.approach_words.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                style={{ opacity: wordOpacity[index] }}
                className="whitespace-nowrap font-display text-[clamp(3.5rem,19vw,8rem)] font-normal uppercase leading-[0.86] tracking-[-0.075em] sm:text-[clamp(6rem,13vw,10rem)] lg:text-[clamp(7rem,10vw,11rem)]"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-[9%] mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center sm:bottom-[10%] sm:px-10">
          <motion.p
            style={{ opacity: statementOpacity }}
            className="text-xl font-normal leading-tight tracking-[-0.04em] sm:text-2xl md:text-3xl"
          >
            {t.home.approach_statement}
          </motion.p>
          <motion.p
            style={{ opacity: descriptionOpacity }}
            className="mt-4 max-w-md text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 sm:text-base"
          >
            {t.home.approach_description}
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default HomeApproachSection;

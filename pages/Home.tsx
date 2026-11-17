
import React, { useRef, useState, useEffect } from 'react';
import heroImage from '../1.jpeg';
import textureMaterialBoard from '../Modern Tropical Material Board.png';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Plus, ArrowRight, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import TextReveal from '../components/TextReveal';
import SplitTextReveal from '../components/SplitTextReveal';
import CyclingSlideText from '../components/CyclingSlideText';
import PhilosophySection from '../components/PhilosophySection';
import HorizontalScroll from '../components/HorizontalScroll';
import HomeApproachSection from '../components/HomeApproachSection';
import RevealOnScroll from '../components/RevealOnScroll'; // Imported
import ScrollHighlightText from '../components/ScrollHighlightText'; // Imported

import { PROJECTS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { CardHoverReveal, CardHoverRevealMain, CardHoverRevealContent } from '../components/ui/reveal-on-hover';

const getResistedFillProgress = (progress: number, start: number, end: number) => {
  const segmentProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return 1 - Math.pow(1 - segmentProgress, 2);
};

const NEXT_STEP_SLIDE_COUNT = 3;
const NEXT_STEP_CLOSING_STEP = NEXT_STEP_SLIDE_COUNT + 1;
const NEXT_STEP_SECTION_STAGE_COUNT = NEXT_STEP_CLOSING_STEP + 1;
const NEXT_STEP_PAUSE_PROGRESS = 0.14;

const Home: React.FC = () => {
  const containerRef = useRef(null);
  const { t, language } = useLanguage();
  
  // -- Parallax Logic for Hero --
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  const nextStepsRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: nextStepsProgress } = useScroll({
    target: nextStepsRef,
    offset: ["start start", "end end"]
  });
  const nextStepsDampedProgress = useSpring(nextStepsProgress, {
    stiffness: 55,
    damping: 30,
    mass: 1.6,
  });
  const nextStepFills = [
    useTransform(nextStepsDampedProgress, (progress) => getResistedFillProgress(progress, 0.2, 0.4 - NEXT_STEP_PAUSE_PROGRESS)),
    useTransform(nextStepsDampedProgress, (progress) => getResistedFillProgress(progress, 0.4, 0.6 - NEXT_STEP_PAUSE_PROGRESS)),
    useTransform(nextStepsDampedProgress, (progress) => getResistedFillProgress(progress, 0.6, 0.8 - NEXT_STEP_PAUSE_PROGRESS)),
  ];
  const nextStepsIntroTitleY = useTransform(nextStepsProgress, [0, 1 / NEXT_STEP_SECTION_STAGE_COUNT], ['0vh', '-8vh']);
  const nextStepsIntroDescriptionY = useTransform(nextStepsProgress, [0, 1 / NEXT_STEP_SECTION_STAGE_COUNT], ['0vh', '-14vh']);
  const nextStepsIntroCtaY = useTransform(nextStepsProgress, [0, 1 / NEXT_STEP_SECTION_STAGE_COUNT], ['0vh', '-20vh']);
  const [activeNextStep, setActiveNextStep] = useState(0);
  useMotionValueEvent(nextStepsDampedProgress, 'change', (progress) => {
    const nextStep = Math.min(NEXT_STEP_CLOSING_STEP, Math.max(0, Math.floor(progress * NEXT_STEP_SECTION_STAGE_COUNT)));
    setActiveNextStep((current) => current === nextStep ? current : nextStep);
  });
  const activeNextStepsSlide = activeNextStep > 0 && activeNextStep <= NEXT_STEP_SLIDE_COUNT
    ? t.home.next_steps_slides[activeNextStep - 1]
    : null;

  // -- Interactive Project List Logic --
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeEssentialElementId, setActiveEssentialElementId] = useState<number | null>(null);

  // -- Audio Player Visibility Sync --
  const [isAudioVisible, setIsAudioVisible] = useState(() => {
    const saved = localStorage.getItem('linier_audio_player_visible');
    return saved !== 'false';
  });

  useEffect(() => {
    const handleShow = () => setIsAudioVisible(true);
    const handleHide = () => setIsAudioVisible(false);

    window.addEventListener('show-audio-player', handleShow);
    window.addEventListener('hide-audio-player', handleHide);

    return () => {
      window.removeEventListener('show-audio-player', handleShow);
      window.removeEventListener('hide-audio-player', handleHide);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-bronze-500 selection:text-white relative">
      
      {/* 1. HERO - THE BASE (Fixed/Sticky at back) */}
    <section className="sticky top-0 min-h-[100svh] h-[100svh] md:h-[100vh] w-full overflow-hidden flex flex-col justify-center md:justify-end pb-8 sm:pb-12 md:pb-24 px-4 sm:px-6 md:px-12 z-0">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 z-0">
            <img
                src={heroImage}
                alt="Linier Studio architecture hero"
                className="w-full h-full object-cover brightness-110"
            />
        </motion.div>

        <div className="absolute inset-0 z-10 bg-black/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

        <div className="absolute top-24 sm:top-28 md:top-32 left-4 sm:left-6 md:left-12 right-4 sm:right-6 md:right-12 z-20 flex items-start justify-between text-white mix-blend-difference pointer-events-none">
            <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="flex items-center gap-3 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em]"
            >
                <span className="w-7 sm:w-10 h-px bg-current" />
                <span>Linier Studio / 01</span>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em]"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-bronze-500 animate-pulse" />
                <span>Kendari / Indonesia</span>
            </motion.div>
        </div>

        <motion.div style={{ y: textY }} className="relative z-20 text-white pointer-events-none w-full flex flex-col items-center md:items-start pt-12 sm:pt-16 md:pt-0">
            
            {/* DISCIPLINES MOVED ABOVE TITLE */}
            <div className="w-full mb-5 sm:mb-6 text-center md:text-left">
                <motion.div 
                    key={`disc-${language}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-[10px] sm:text-xs md:text-sm font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block"
                >
                     {t.hero.disciplines}
                </motion.div>
            </div>

            {/* Split text into 2 lines/blocks with Text Reveal + Split effect */}
            <h1 className="text-[11vw] sm:text-[12vw] md:text-[8vw] lg:text-[7vw] leading-[0.92] font-display font-semibold uppercase tracking-tight text-center md:text-left w-full flex flex-col items-center md:items-start drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
                <SplitTextReveal 
                    key={`line1-${language}`}
                    text={t.hero.title1 || "Architecture"} 
                    delay={0.15}
                    className="block text-white" 
                />
                <div className="flex justify-center md:justify-start items-baseline">
                    <SplitTextReveal 
                        key={`line2-${language}`}
                        text={t.hero.title2 || "With Purpose"} 
                        delay={0.45}
                        className="block text-white/90"
                    />
                    <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
                        className="text-bronze-500 font-bold ml-1 text-[13vw] md:text-[8vw] lg:text-[7vw]"
                    >
                        .
                    </motion.span>
                </div>
            </h1>
            
            <div className="w-full mt-8 sm:mt-10 md:mt-12">
                
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-6 sm:gap-8 md:gap-0">
                    <div className="text-[10px] sm:text-xs md:text-base lg:text-lg font-mono uppercase tracking-[0.18em] sm:tracking-widest max-w-md overflow-hidden text-neutral-300 text-center md:text-left">
                        <motion.p
                           key={language}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.8, duration: 1 }}
                           className="whitespace-pre-line"
                        >
                          {t.hero.tagline}
                        </motion.p>
                    </div>

                                        <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
                                                <Link
                                                    to="/portfolio"
                                                    className="group flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] text-white hover:text-bronze-500 transition-colors"
                                                >
                                                    <span>{t.home.view_all}</span>
                                                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                </Link>
                        <AnimatePresence>
                          {!isAudioVisible && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.8, x: 20 }}
                              transition={{ duration: 0.4 }}
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('show-audio-player'));
                              }}
                              className="pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-900/90 hover:bg-neutral-800/90 active:bg-black/80 backdrop-blur-md border border-neutral-300 dark:border-white/10 rounded-full text-white text-[10px] sm:text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-xl hover:border-bronze-500/50 group cursor-pointer"
                            >
                              <Music size={12} className="text-bronze-500 group-hover:scale-110 transition-transform" />
                              <span>{t.hero.music_btn}</span>
                            </motion.button>
                          )}
                        </AnimatePresence>

                        <div className="hidden md:block animate-spin-slow opacity-80">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                <text className="text-[10px] font-bold uppercase tracking-widest fill-white">
                                    <textPath href="#curve">
                                        {t.hero.scroll}
                                    </textPath>
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

                <motion.aside
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="hidden md:flex absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-5 text-white mix-blend-difference pointer-events-none"
                    aria-label="Design disciplines"
                >
                    <span className="w-px h-16 bg-current opacity-60" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.35em] [writing-mode:vertical-rl]">
                        Space / Form / Light
                    </span>
                    <span className="w-px h-16 bg-current opacity-60" />
                </motion.aside>
      </section>

      {/* 2. THE LONG CARD (THE MONOLITH) */}
      <div className="relative z-10 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-t-[24px] md:rounded-t-[40px] border-t border-neutral-200 dark:border-white/20 shadow-[0_-50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_-50px_100px_rgba(0,0,0,1)] pb-8 md:pb-12">
        
        {/* A. MANIFESTO SECTION (Inside the card) */}
        <div className="w-full pt-20 md:pt-32 pb-16 md:pb-24 px-4 md:px-8 lg:px-12 flex flex-col justify-center">
            <div className="max-w-[1280px] mx-auto space-y-24 md:space-y-40">
                
                {/* Manifesto Part 1 */}
                <div className="max-w-[1180px] text-[clamp(2.25rem,6vw,5.5rem)] font-sans font-light leading-[1.04] tracking-[-0.025em]">
                    <span className="text-neutral-900 dark:text-white">{t.home.manifesto_1}</span>
                    <span className="block md:inline-block md:mx-4 text-bronze-500 font-display italic font-bold mt-5 md:mt-1">
                        <CyclingSlideText 
                            key={`cst-${language}`} 
                            words={t.home.cycling_words} 
                            interval={2500}
                        />
                    </span>
                    <div className="max-w-[1120px] mt-8 md:mt-6">
                        <span className="text-neutral-900 dark:text-white">{t.home.manifesto_2}</span>
                    </div>
                </div>

                {/* Manifesto Part 2 */}
                <div className="flex flex-col items-start md:items-end w-full">
                     <div className="text-2xl md:text-5xl lg:text-6xl font-sans font-light leading-[1.25] text-left md:text-right max-w-5xl text-neutral-600 dark:text-neutral-400">
                        <ScrollHighlightText 
                            content={`${t.home.manifesto_3} ${t.home.manifesto_highlight} ${t.home.manifesto_4}`} 
                            className="text-neutral-900 dark:text-white"
                        />
                     </div>
                     
                     {/* CENTERED BUTTON */}
                     <div className="mt-16 md:mt-32 w-full flex justify-center">
                        <RevealOnScroll>
                            <Link to="/about" className="group flex flex-col items-center gap-2 cursor-hover">
                                <div className="w-[1px] h-12 md:h-16 bg-neutral-700 group-hover:h-24 transition-all duration-500" />
                                <span className="text-xs uppercase tracking-widest text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                    {t.home.philosophy_btn}
                                </span>
                            </Link>
                        </RevealOnScroll>
                    </div>
                </div>
            </div>
        </div>

        {/* B. PHILOSOPHY SECTION */}
        <div className="relative">
             <PhilosophySection />
        </div>

        {/* C. TRUSTED STATEMENT (Inserted Here) */}
        <div className="w-full pt-6 pb-4 md:pt-10 md:pb-6 px-4 md:px-12 lg:px-24 flex justify-center">
            <div className="max-w-4xl text-center">
                 <div className="text-xl md:text-3xl lg:text-4xl font-display leading-[1.4] text-neutral-800 dark:text-neutral-200">
                     <ScrollHighlightText content={t.home.trusted_statement} />
                 </div>
            </div>
        </div>

      </div>

      <HomeApproachSection />

      {/* 3. INTERACTIVE PROJECT LIST */}
      <section className="relative z-50 pt-12 pb-6 md:pt-20 md:pb-32 bg-white dark:bg-neutral-950 transition-colors duration-500 border-t border-neutral-200 dark:border-neutral-800">
         <div className="container mx-auto px-4 md:px-12">
            
            <RevealOnScroll>
                <div className="flex items-end justify-between mb-12 md:mb-24 pb-4 border-b border-neutral-200 dark:border-white/10">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs md:text-sm font-mono text-bronze-600 dark:text-bronze-500 uppercase tracking-widest">
                            {t.home.selected_works}
                        </h2>
                    </div>
                    <Link to="/portfolio" className="hidden md:inline-flex text-xs font-bold uppercase tracking-widest items-center gap-2 hover:text-bronze-500 transition-colors cursor-hover">
                        {t.home.view_all} <ArrowUpRight size={14} />
                    </Link>
                </div>
            </RevealOnScroll>

            {/* Accordion List */}
            <div className="flex flex-col">
                {PROJECTS.slice(0, 5).map((project, index) => {
                    const isActive = activeProject === project.id;
                    const translatedTitle = t.projects?.[project.id]?.title || project.title;
                    const translatedLocation = t.projects?.[project.id]?.location || project.location;

                    return (
                        <div 
                            key={project.id} 
                            className="border-b border-neutral-200 dark:border-neutral-800 last:border-0 cursor-pointer"
                            onClick={() => setActiveProject(isActive ? null : project.id)}
                        >
                            <RevealOnScroll delay={index * 0.1} yOffset={20}>
                                <motion.div 
                                    className={`group cursor-hover relative overflow-hidden transition-colors duration-500 ${isActive ? 'bg-neutral-50 dark:bg-white/5' : 'hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center justify-between py-6 md:py-10 px-2 md:px-8 relative z-20">
                                        <div className="flex items-center gap-4 md:gap-16">
                                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${isActive ? 'bg-bronze-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                                            
                                            <h3 className={`text-2xl md:text-6xl font-display font-bold uppercase tracking-tight transition-all duration-500 ${isActive ? 'translate-x-2 md:translate-x-4' : 'translate-x-0'}`}>
                                                {translatedTitle}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                                                {t.categories[project.category]}
                                            </span>
                                            <motion.div 
                                                animate={{ rotate: isActive ? 45 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`text-neutral-600 dark:text-neutral-400 ${isActive ? 'text-bronze-500' : ''}`}
                                            >
                                                {isActive ? <ArrowUpRight size={20} className="md:w-6 md:h-6" /> : <Plus size={20} className="md:w-6 md:h-6" />}
                                            </motion.div>
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={false}
                                        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-2 md:px-8 pb-8 md:pb-12">
                                            <div className="relative w-full aspect-[16/9] md:aspect-[2.35/1] overflow-hidden rounded-sm group-image">
                                                <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-transparent transition-colors z-10" />
                                                <motion.img 
                                                    src={project.image} 
                                                    alt={translatedTitle}
                                                    className="w-full h-full object-cover"
                                                    initial={{ scale: 1.1 }}
                                                    animate={{ scale: isActive ? 1 : 1.1 }}
                                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                                />
                                                
                                                <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-20 flex flex-col items-start gap-2">
                                                    <div className="flex gap-2 md:gap-4">
                                                        <span className="bg-white/90 text-neutral-900 px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                                            {translatedLocation}
                                                        </span>
                                                        <span className="bg-white/90 text-neutral-900 px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                                            {project.year}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-20">
                                                    {/* UPDATED LINK */}
                                                    <Link to={`/portfolio/${project.id}`} className="w-12 h-12 md:w-24 md:h-24 bg-bronze-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-xl cursor-hover">
                                                        <ArrowUpRight size={20} className="md:w-8 md:h-8" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </RevealOnScroll>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 md:hidden flex justify-center">
                 <Link to="/portfolio" className="text-xs font-bold uppercase border border-neutral-300 dark:border-white/20 px-6 py-3 rounded-full hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-hover">
                    {t.home.view_all}
                </Link>
            </div>
         </div>
      </section>

      {/* Next Steps */}
      <section
        ref={nextStepsRef}
        className="relative z-50 h-[625svh] overflow-clip border-y border-neutral-200 bg-neutral-950 text-white dark:border-neutral-800"
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#050607]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 75% 72%, rgba(163, 230, 53, 0.16), transparent 38%), radial-gradient(ellipse at 37% 88%, rgba(163, 230, 53, 0.08), transparent 42%), radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.7) 0.7px, transparent 1px), radial-gradient(circle at 78% 30%, rgba(255, 255, 255, 0.55) 0.7px, transparent 1px), radial-gradient(circle at 46% 65%, rgba(255, 255, 255, 0.45) 0.6px, transparent 1px), radial-gradient(circle at 91% 83%, rgba(255, 255, 255, 0.5) 0.7px, transparent 1px)'
            }}
          />
          <div className="container relative z-10 mx-auto flex h-full items-center px-4 md:px-12">
            <AnimatePresence mode="wait" initial={false}>
              {activeNextStep === 0 ? (
                <motion.div
                  key="next-steps-intro"
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -48 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-5xl"
                >
                  <motion.h2
                    style={{ y: nextStepsIntroTitleY }}
                    className="font-display text-[clamp(2.75rem,8vw,7.5rem)] font-medium leading-[0.98] tracking-tight"
                  >
                    <span className="block">{t.home.next_steps_intro_title[0]}</span>
                    <span className="block">{t.home.next_steps_intro_title[1]}</span>
                  </motion.h2>
                  <motion.p
                    style={{ y: nextStepsIntroDescriptionY }}
                    className="mt-8 max-w-3xl text-base leading-relaxed text-white/65 sm:text-lg md:text-xl"
                  >
                    {t.home.next_steps_intro_desc}
                  </motion.p>
                  <motion.div style={{ y: nextStepsIntroCtaY }}>
                    <Link
                      to="/about"
                      className="group mt-10 inline-flex items-center gap-8 border-b border-white/60 pb-3 text-xs font-medium tracking-wide text-white transition-colors hover:border-lime-400 hover:text-lime-300 sm:text-sm"
                    >
                      {t.home.next_steps_intro_cta}
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={`next-steps-stage-${activeNextStep}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    y: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3, ease: 'easeOut' }
                  }}
                  className={`relative mx-auto w-full ${activeNextStep === NEXT_STEP_CLOSING_STEP ? 'max-w-[1368px]' : 'max-w-7xl text-center'}`}
                >
                  {activeNextStep === NEXT_STEP_CLOSING_STEP ? (
                    <div className="relative z-10 grid min-h-[55svh] items-center gap-8 py-8 md:grid-cols-12 md:gap-10">
                      <h2 className="font-display text-[clamp(2.5rem,11vw,10rem)] font-semibold leading-[0.9] tracking-[-0.07em] md:col-span-7">
                        {t.home.next_steps_closing_title}
                        <span className="text-lime-400">.</span>
                      </h2>
                      <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base md:col-start-9 md:col-span-4 md:text-lg">
                        {t.home.next_steps_closing_desc}
                      </p>
                    </div>
                  ) : (
                    <div className="relative z-10 text-center">
                      <div className="mb-8 flex flex-col items-center gap-5 sm:mb-10">
                        <p className="flex items-center gap-3 text-[10px] font-semibold tracking-wide text-white/90 sm:text-xs">
                          <span className="h-1.5 w-1.5 bg-lime-400" />
                          {t.home.next_steps_dna_label}
                        </p>
                        <div className="flex items-center gap-4 font-mono text-[10px] tracking-wider text-white/50 sm:text-xs">
                          <span>{String(activeNextStep).padStart(2, '0')} / {String(NEXT_STEP_SLIDE_COUNT).padStart(2, '0')}</span>
                          <div
                            role="progressbar"
                            aria-label={t.home.next_steps_dna_label}
                            aria-valuemin={1}
                            aria-valuemax={NEXT_STEP_SLIDE_COUNT}
                            aria-valuenow={activeNextStep}
                            className="flex w-28 gap-1 sm:w-40"
                          >
                            {t.home.next_steps_slides.map((step, index) => (
                              <span
                                key={step.title}
                                className="relative h-0.5 flex-1 overflow-hidden bg-white/20"
                              >
                                <motion.span
                                  aria-hidden="true"
                                  style={{ scaleX: nextStepFills[index] }}
                                  className="absolute inset-0 origin-left bg-lime-400"
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <h2 className="font-display text-[clamp(3.5rem,5.4vw,7.5rem)] font-bold leading-[0.95] tracking-[-0.055em]">
                        {activeNextStepsSlide?.title}
                        <span className="text-lime-400">.</span>
                      </h2>
                      <p className="mt-3 text-lg font-medium tracking-tight text-white/90 sm:text-xl md:text-2xl">
                        {activeNextStepsSlide?.subtitle}
                      </p>
                      <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-white/60 sm:text-sm">
                        {activeNextStepsSlide?.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </section>

      {/* Process Section */}
      <HorizontalScroll />

      {/* SEPARATOR */}
      <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800 relative z-50" />

      {/* THE ELEMENTS (Updated to Link) */}
      <section
        className="py-24 md:py-32 flex flex-col justify-center bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 relative z-50"
        onClick={(event) => {
          if (event.target instanceof Element && !event.target.closest('[data-essential-card]')) {
            setActiveEssentialElementId(null);
          }
        }}
      >
        <div className="container mx-auto px-6 md:px-12">
           <RevealOnScroll>
               <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-neutral-300 dark:border-neutral-800 pb-8 gap-6 md:gap-0">
                   <div>
                      <h2 className="text-sm font-mono text-bronze-600 dark:text-bronze-500 uppercase tracking-widest mb-2">
                          {t.home.journal_title}
                      </h2>
                      <h3 className="text-4xl md:text-5xl font-display font-bold uppercase text-neutral-900 dark:text-white">
                          {t.home.elements_title}<span className="text-bronze-500">.</span>
                      </h3>
                   </div>
                   <div className="max-w-md text-right">
                        <p className="text-lg md:text-xl text-neutral-500 font-light leading-relaxed">
                            {t.home.elements_desc}
                        </p>
                   </div>
               </div>
           </RevealOnScroll>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(t.elements || []).map((item: { id: number; title: string; subtitle: string; desc: string; image: string }, i: number) => (
                 <RevealOnScroll key={i} delay={i * 0.1}>
                     <Link to={`/journal/${item.id}`}>
                        <CardHoverReveal
                          data-essential-card
                          isTouchActive={activeEssentialElementId === item.id}
                          onTouchReveal={() => setActiveEssentialElementId(item.id)}
                          className="w-full h-[500px] md:h-[600px] rounded-sm cursor-pointer bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group"
                        >
                        <CardHoverRevealMain>
                            <img
                            src={item.id === 2 ? textureMaterialBoard : item.image}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-100 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/20 to-neutral-950/90" />
                            
                            <div className="absolute bottom-8 left-8 z-10 transition-opacity duration-300 group-hover:opacity-0">
                                <span className="text-[10px] font-mono text-bronze-500 uppercase tracking-widest mb-2 block">0{i+1}</span>
                                <h3 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter">{item.title}</h3>
                            </div>
                        </CardHoverRevealMain>

                        <CardHoverRevealContent className="max-sm:!inset-4 max-sm:!p-5 max-sm:!bg-white/95 max-sm:!text-neutral-900 max-sm:!justify-center rounded-none bg-white dark:bg-white/40 dark:bg-neutral-950/40 backdrop-blur-md border-t border-neutral-200 dark:border-white/20 text-neutral-900 dark:text-white flex flex-col justify-end h-full">
                            <div className="space-y-6 max-sm:space-y-4">
                                <div className="w-12 h-12 max-sm:w-10 max-sm:h-10 border border-neutral-300 dark:border-white/20 rounded-full flex items-center justify-center text-sm font-mono text-bronze-500">
                                    0{i+1}
                                </div>

                                <div>
                                    <h3 className="text-3xl max-sm:text-2xl md:text-5xl font-display font-bold leading-none tracking-tighter uppercase mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                                        {item.subtitle}
                                    </p>
                                </div>

                                <p className="text-lg max-sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-l border-bronze-500 pl-4">
                                    "{item.desc}"
                                </p>

                                <div className="pt-6 max-sm:pt-4 border-t border-neutral-300 dark:border-white/10 flex items-center justify-between w-full">
                                <span className="text-[10px] uppercase tracking-[0.2em]">{t.home.read_article}</span>
                                <ArrowUpRight size={18} className="text-bronze-500" />
                                </div>
                            </div>
                        </CardHoverRevealContent>
                        </CardHoverReveal>
                     </Link>
                 </RevealOnScroll>
              ))}
           </div>
        </div>
      </section>

      

      {/* CTA Section Removed (Consolidated into Footer) */}
    </div>
  );
};

export default Home;

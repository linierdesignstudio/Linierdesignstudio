import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import dialogueImage from '../Thoughtful Conversation in a Modern Studio.png';
import constructImage from '../Blueprint Meeting at the Construction Site.png';
import schematicImage from '../Architect’s Warm Desk Workspace.png';

const ProcessSection: React.FC = () => {
  const { t } = useLanguage();
  const images = [
    dialogueImage,
    schematicImage,
    constructImage,
    'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600&auto=format&fit=crop',
  ];

  return (
    <section className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-32">
        <header className="mb-14 grid gap-6 border-t border-neutral-200 pt-5 dark:border-white/10 md:mb-20 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-7">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400">
              {t.process.title}
            </p>
            <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl md:text-8xl">
              {t.process.method_title_1}<br />
              {t.process.method_title_2}<br />
              <span className="text-neutral-500 dark:text-neutral-400">{t.process.method_title_3}</span>
            </h2>
          </div>
          <p className="max-w-xl text-base font-light leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg md:col-span-5 md:pb-2">
            {t.process.method_desc}
          </p>
        </header>

        <ol className="space-y-12 md:space-y-20">
          {t.process.steps.map((step, index) => {
            const reversed = index % 2 === 1;
            return (
              <li key={step.title} className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
                <div className={`md:col-span-7 ${reversed ? 'md:order-2' : ''}`}>
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={images[index % images.length]} alt={step.title} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className={`md:col-span-5 ${reversed ? 'md:order-1 md:pr-8' : 'md:pl-8'}`}>
                  <p className="mb-5 font-mono text-[10px] tracking-[0.18em] text-bronze-600 dark:text-bronze-400">
                    {String(index + 1).padStart(2, '0')} / {String(t.process.steps.length).padStart(2, '0')}
                  </p>
                  <h3 className="font-display text-3xl font-semibold uppercase leading-tight tracking-tight sm:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default ProcessSection;

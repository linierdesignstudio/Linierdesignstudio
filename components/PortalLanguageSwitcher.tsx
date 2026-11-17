import type { FC } from 'react';
import { Languages } from 'lucide-react';
import { Language } from '../types';

type PortalLanguageSwitcherProps = {
  language: Language;
  onChange: (language: Language) => void;
};

const languageOptions = [
  { value: Language.ID, label: 'Bahasa Indonesia' },
  { value: Language.EN, label: 'English' },
  { value: Language.CN, label: '中文' },
];

const PortalLanguageSwitcher: FC<PortalLanguageSwitcherProps> = ({ language, onChange }) => {
  const ariaLabel = language === Language.ID ? 'Bahasa' : language === Language.CN ? '语言' : 'Language';

  return (
    <label className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-neutral-600 shadow-sm transition-colors hover:border-neutral-400 focus-within:ring-2 focus-within:ring-bronze-500/30 dark:border-white/15 dark:bg-[#181916] dark:text-neutral-200 dark:hover:border-white/30">
      <Languages size={15} aria-hidden="true" />
      <span className="font-mono text-[10px] uppercase tracking-wide">{language}</span>
      <select
        value={language}
        onChange={(event) => {
          const selected = languageOptions.find((option) => option.value === event.currentTarget.value);
          if (selected) onChange(selected.value);
        }}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
};

export default PortalLanguageSwitcher;

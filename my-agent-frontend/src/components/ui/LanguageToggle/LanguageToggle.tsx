import { useTranslation } from 'react-i18next';
import { GlobeIcon } from '@/features/auth/components/icons';

interface Props {
  fixed?: boolean;
}

export function LanguageToggle({ fixed = false }: Props) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const toggle = (lang: 'vi' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <div
      className="inline-flex items-center gap-1 p-0.5 rounded-full border backdrop-blur-sm"
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in oklch, white 80%, transparent)',
        ...(fixed ? { position: 'fixed', top: '1rem', right: '1rem', zIndex: 40 } : {}),
      }}
    >
      <GlobeIcon style={{ color: 'var(--fg-3)', marginLeft: '4px' }} />
      {(['vi', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => toggle(lang)}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: current === lang ? 'var(--fg)' : 'transparent',
            color: current === lang ? 'var(--bg)' : 'var(--fg-2)',
            opacity: current === lang ? 1 : 0.6,
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

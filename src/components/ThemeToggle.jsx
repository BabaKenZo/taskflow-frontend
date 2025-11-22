import { useEffect, useState } from 'react';

const Sun = props => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}><path d="M6.76 4.84..."/></svg>
);
const Moon = props => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}><path d="M9.37 5.51..."/></svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      title="Toggle theme"
      data-pressed={theme === 'dark'}
    >
      <span className="icon" aria-hidden>
        {theme === 'dark' ? <Moon /> : <Sun />}
      </span>
    </button>
  );
}

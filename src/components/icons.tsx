/** Petites icônes en trait, dessinées pour l'app. */
type P = { size?: number };
const base = (size = 22) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});
export const IconCheck = ({ size }: P) => <svg {...base(size)} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const IconPlus = ({ size }: P) => <svg {...base(size)} strokeWidth={2.5}><path d="M12 5v14M5 12h14" /></svg>;
export const IconSun = ({ size }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
export const IconPath = ({ size }: P) => <svg {...base(size)}><path d="M4 20c4 0 4-6 8-6s4-8 8-8" /><circle cx="4" cy="20" r="1.5" /><circle cx="20" cy="6" r="1.5" /></svg>;
export const IconFlame = ({ size }: P) => <svg {...base(size)}><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.6.2 1.6 1 2.6 2 2.6 0-3 .2-5.6.8-8z" /></svg>;
export const IconClose = ({ size }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const IconLogout = ({ size }: P) => <svg {...base(size)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></svg>;

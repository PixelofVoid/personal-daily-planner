import { createContext, useContext } from 'react';

export const ThemeContext = createContext(null);

export function useColors() {
  const colors = useContext(ThemeContext);
  if (!colors) throw new Error('useColors must be used inside ThemeContext');
  return colors;
}

export const palettes = {
  light: {
    name: 'light',
    bg: '#F4F1EA',
    surface: '#FFFFFF',
    surface2: '#EFEBE3',
    text: '#1C1917',
    muted: '#78716C',
    accent: '#0F766E',
    accentSoft: '#CCFBF1',
    accentText: '#115E59',
    danger: '#B42318',
    dangerSoft: '#FEE4E2',
    warning: '#B54708',
    warningSoft: '#FEF0C7',
    border: '#E7E5E4',
    fab: '#0F766E',
    fabText: '#FFFFFF',
    tab: '#FFFFFF',
    overlay: 'rgba(28, 25, 23, 0.45)',
    status: 'dark',
  },
  dark: {
    name: 'dark',
    bg: '#121212',
    surface: '#1C1C1E',
    surface2: '#252528',
    text: '#F5F5F4',
    muted: '#A8A29E',
    accent: '#2DD4BF',
    accentSoft: '#134E4A',
    accentText: '#99F6E4',
    danger: '#F97066',
    dangerSoft: '#3F1D1B',
    warning: '#FDB022',
    warningSoft: '#3D2A10',
    border: '#2A2A2D',
    fab: '#2DD4BF',
    fabText: '#042F2E',
    tab: '#1C1C1E',
    overlay: 'rgba(0, 0, 0, 0.55)',
    status: 'light',
  },
};

export function resolveTheme(preference, systemScheme) {
  if (preference === 'light' || preference === 'dark') {
    return palettes[preference];
  }
  return palettes[systemScheme === 'dark' ? 'dark' : 'light'];
}

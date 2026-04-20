import { useTheme as useThemeContext, ThemeName } from '@/contexts/ThemeContext';

export interface ThemeColors {
  panelBg: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  labelColor: string;
  titleColor: string;
  subtitleColor: string;
  textPrimary: string;
  textSecondary: string;
  footerColor: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarItemHover: string;
  sidebarItemActive: string;
  sidebarText: string;
  sidebarTextActive: string;
  headerBg: string;
  headerBorder: string;
  tableBg: string;
  tableHeaderBg: string;
  tableRowHover: string;
  logoFilter: string;
}

const darkTheme: ThemeColors = {
  panelBg: 'hsl(220, 45%, 11%)',
  pageBg: 'linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)',
  cardBg: 'hsla(220, 40%, 15%, 0.7)',
  cardBorder: 'hsla(200, 60%, 40%, 0.12)',
  inputBg: 'hsla(220, 40%, 18%, 0.8)',
  inputBorder: 'hsla(200, 80%, 50%, 0.15)',
  labelColor: 'hsl(220, 20%, 55%)',
  titleColor: 'hsl(0, 0%, 100%)',
  subtitleColor: 'hsl(200, 30%, 55%)',
  textPrimary: 'hsl(0, 0%, 100%)',
  textSecondary: 'hsl(220, 20%, 60%)',
  footerColor: 'hsl(220, 20%, 35%)',
  sidebarBg: 'hsl(220, 50%, 10%)',
  sidebarBorder: 'hsla(200, 60%, 40%, 0.12)',
  sidebarItemHover: 'hsla(200, 60%, 40%, 0.08)',
  sidebarItemActive: 'hsla(200, 60%, 40%, 0.15)',
  sidebarText: 'hsl(220, 20%, 55%)',
  sidebarTextActive: 'hsl(0, 0%, 100%)',
  headerBg: 'hsla(220, 65%, 8%, 0.9)',
  headerBorder: 'hsla(200, 80%, 50%, 0.1)',
  tableBg: 'hsla(220, 40%, 14%, 0.5)',
  tableHeaderBg: 'hsla(220, 40%, 12%, 0.8)',
  tableRowHover: 'hsla(200, 60%, 40%, 0.06)',
  logoFilter: 'none',
};

const lightTheme: ThemeColors = {
  panelBg: 'hsl(216, 10%, 90%)',
  pageBg: 'linear-gradient(165deg, hsl(228, 8%, 76%) 0%, hsl(213, 18%, 90%) 40%, hsl(222, 10%, 75%) 100%)',
  cardBg: 'hsla(0, 11%, 93%, 0.95)',
  cardBorder: 'hsla(220, 20%, 85%, 0.6)',
  inputBg: 'rgba(237, 239, 242, 0.21)',
  inputBorder: 'hsla(220, 20%, 82%, 0.8)',
  labelColor: 'hsl(220, 15%, 45%)',
  titleColor: 'hsl(220, 50%, 15%)',
  subtitleColor: 'hsl(220, 24%, 51%)',
  textPrimary: 'hsl(220, 40%, 15%)',
  textSecondary: 'hsl(220, 15%, 45%)',
  footerColor: 'hsl(220, 15%, 65%)',
  sidebarBg: 'hsl(278, 10%, 79%)',
  sidebarBorder: 'hsla(220, 20%, 88%, 0.8)',
  sidebarItemHover: 'hsla(220, 30%, 93%, 0.8)',
  sidebarItemActive: 'hsla(220, 40%, 90%, 0.9)',
  sidebarText: 'hsl(220, 15%, 50%)',
  sidebarTextActive: 'hsl(220, 50%, 30%)',
  headerBg: 'hsla(0, 50%, 99%, 0.95)',
  headerBorder: 'hsla(220, 20%, 88%, 0.8)',
  tableBg: 'hsla(0, 37%, 58%, 0.80)',
  tableHeaderBg: 'hsla(220, 20%, 96%, 0.9)',
  tableRowHover: 'hsla(220, 20%, 95%, 0.6)',
  logoFilter: 'invert(1) brightness(0.2)',
};

const themeMap: Record<ThemeName, ThemeColors> = {
  dark: darkTheme,
  light: lightTheme,
};

export const useAppTheme = () => {
  const { theme } = useThemeContext();
  return { theme, colors: themeMap[theme] };
};

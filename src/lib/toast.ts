import { toast } from 'sonner';

const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

const baseStyle = () => isDark()
  ? { background: 'hsl(220, 45%, 14%)', color: 'hsl(0,0%,95%)', border: '1px solid hsla(200, 60%, 40%, 0.3)' }
  : { background: 'hsl(220, 20%, 97%)', color: 'hsl(220, 25%, 15%)', border: '1px solid hsla(220, 20%, 75%, 0.8)' };

export const toastSuccess = (msg: string) =>
  toast.success(msg, { style: baseStyle() });

export const toastError = (msg: string) =>
  toast.error(msg, {
    style: {
      ...baseStyle(),
      border: isDark() ? '1px solid hsla(0,70%,50%,0.4)' : '1px solid hsla(0,70%,50%,0.5)',
    },
  });

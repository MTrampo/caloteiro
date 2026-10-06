import { Syne, Plus_Jakarta_Sans } from 'next/font/google';

export const fontTitle = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-title',
});

export const fontBody = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});
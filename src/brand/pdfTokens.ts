import { colors } from './tokens';

export const pdfColors = colors;

export const pdfFont = {
  body: 'Helvetica',
  bold: 'Helvetica-Bold',
} as const;

export const pdfFontSize = {
  title: 26,
  heading: 18,
  subheading: 14,
  body: 12,
  small: 10,
} as const;

export const pdfSpacing = {
  page: 48, // page margin
  section: 24, // gap between sections
  paragraph: 8, // gap between paragraphs
  item: 4, // gap between list items
} as const;

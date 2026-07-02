import { StyleSheet } from '@react-pdf/renderer';
import {
  pdfColors,
  pdfFont,
  pdfFontSize,
  pdfSpacing,
} from '../../brand/pdfTokens';

export const pageStyles = StyleSheet.create({
  page: {
    paddingHorizontal: pdfSpacing.page,
    paddingVertical: pdfSpacing.page,
    fontFamily: pdfFont.body,
    fontSize: pdfFontSize.body,
    color: pdfColors.foreground,
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: pdfColors.primary,
    paddingBottom: 12,
    marginBottom: pdfSpacing.section,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: pdfSpacing.paragraph,
  },
  logo: {
    width: 120,
    flexShrink: 0,
  },
  title: {
    fontFamily: pdfFont.bold,
    fontSize: pdfFontSize.title,
    color: pdfColors.primary,
    flex: 1,
    marginRight: 16,
  },
  meta: {
    fontSize: pdfFontSize.small,
    color: pdfColors.primary,
    marginTop: pdfSpacing.paragraph,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: pdfSpacing.page,
    right: pdfSpacing.page,
    fontSize: pdfFontSize.small,
    color: pdfColors.primary,
    textAlign: 'center',
  },
});

export const textStyles = StyleSheet.create({
  sectionHeading: {
    fontFamily: pdfFont.bold,
    fontSize: pdfFontSize.heading,
    color: pdfColors.primary,
    marginBottom: pdfSpacing.paragraph,
  },
  subheading: {
    fontFamily: pdfFont.bold,
    fontSize: pdfFontSize.subheading,
    marginTop: pdfSpacing.paragraph,
    marginBottom: pdfSpacing.item,
  },
  body: { marginBottom: pdfSpacing.paragraph },
});

export const blockStyles = StyleSheet.create({
  section: { marginBottom: pdfSpacing.section },
  card: {
    borderLeftWidth: 2,
    borderLeftColor: pdfColors.accent,
    paddingLeft: 10,
    marginBottom: pdfSpacing.paragraph,
  },
  cardTitle: { fontFamily: pdfFont.bold },
  cardMeta: { fontSize: pdfFontSize.small, color: pdfColors.primary },
});

export const listStyles = StyleSheet.create({
  item: { flexDirection: 'row', marginBottom: pdfSpacing.item },
  bullet: { width: 10, color: pdfColors.darkorange },
  text: { flex: 1 },
});

export const tableStyles = StyleSheet.create({
  table: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: pdfColors.border,
    marginBottom: pdfSpacing.paragraph,
  },
  row: { flexDirection: 'row' },
  headerRow: { backgroundColor: '#e3ebf3' },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: pdfColors.border,
    padding: 6,
    fontSize: pdfFontSize.small,
  },
  cellText: { fontSize: pdfFontSize.small },
  headerCellText: {
    fontFamily: pdfFont.bold,
    color: pdfColors.primary,
    fontSize: pdfFontSize.small,
  },
  selectedRow: { backgroundColor: '#fdeee9' },
});

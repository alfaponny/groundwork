import { ReactNode } from 'react';
import { View, Text } from '@react-pdf/renderer';
import {
  pageStyles,
  textStyles,
  blockStyles,
  listStyles,
  tableStyles,
} from './styles';
import { Image } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={blockStyles.section}>
      <Text style={textStyles.sectionHeading}>{title}</Text>
      {children}
    </View>
  );
}

export function Subheading({ children }: { children: string }) {
  return <Text style={textStyles.subheading}>{children}</Text>;
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={textStyles.body}>{children}</Text>;
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={listStyles.item}>
          <Text style={listStyles.bullet}>•</Text>
          <Text style={listStyles.text}>{item}</Text>
        </View>
      ))}
    </>
  );
}

export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={blockStyles.card}>
      <Text style={blockStyles.cardTitle}>{title}</Text>
      {subtitle && <Text style={blockStyles.cardMeta}>{subtitle}</Text>}
      {children}
    </View>
  );
}

export function DocHeader({
  title,
  logoSrc,
}: {
  title: string;
  logoSrc?: string;
}) {
  return (
    <View style={pageStyles.header}>
      <View style={pageStyles.headerRow}>
        <Text style={pageStyles.title}>{title}</Text>
        {logoSrc && <Image src={logoSrc} style={pageStyles.logo} />}
      </View>
    </View>
  );
}

export function PageFooter() {
  return (
    <Text
      style={pageStyles.footer}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  );
}

export function Table({
  children,
  style,
}: {
  children: ReactNode;
  style?: Style;
}) {
  return (
    <View style={style ? [tableStyles.table, style] : tableStyles.table}>
      {children}
    </View>
  );
}

export function TableRow({
  children,
  header = false,
  highlight = false,
}: {
  children: ReactNode;
  header?: boolean;
  highlight?: boolean;
}) {
  return (
    <View
      style={
        header
          ? [tableStyles.row, tableStyles.headerRow]
          : highlight
            ? [tableStyles.row, tableStyles.selectedRow]
            : tableStyles.row
      }
      wrap={false}
    >
      {children}
    </View>
  );
}

export function TableCell({
  children,
  flex = 1,
  header = false,
}: {
  children: ReactNode;
  flex?: number;
  header?: boolean;
}) {
  return (
    <View style={[tableStyles.cell, { flexGrow: flex, flexBasis: 0 }]}>
      {typeof children === 'string' ? (
        <Text
          style={header ? tableStyles.headerCellText : tableStyles.cellText}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

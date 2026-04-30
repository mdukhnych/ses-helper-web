import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';
import { PromoItem } from '@/types/information'; 

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 15, fontFamily: 'Roboto', backgroundColor: '#ffffff' },
  mainTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 20 },
  itemContainer: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eeeeee', borderBottomStyle: 'solid' },
  subtitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 8, paddingLeft: 20 },
  description: { fontSize: 8, color: '#333333', marginBottom: 12, lineHeight: 1.4 },
  image: { width: '100%', height: 'auto', objectFit: 'contain', marginTop: 10 },
  link: { fontSize: 12, color: '#0066cc', textDecoration: 'underline', marginTop: 5 },

  table: {
    display: 'flex', flexDirection: 'column', width: '100%',
    borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf',
    borderBottomWidth: 0, borderRightWidth: 0, marginTop: 10,
  },
  tableRow: { display: 'flex', flexDirection: 'row' },
  tableCol: {
    borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf',
    borderTopWidth: 0, borderLeftWidth: 0, padding: 4,
  },
  tableColHeader: { backgroundColor: '#f3f4f6' },
  tableCell: { fontSize: 8 },
  tableCellHeader: { fontSize: 9, fontWeight: 'bold' }
});

export type CellValue = string | number | boolean | null | undefined;

export interface MergeCell {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

export interface PdfPromoItem extends PromoItem {
  parsedExcelData?: CellValue[][]; 
  excelMerges?: MergeCell[];
  excelRowOffset?: number;
}

export interface PromosPdfProps {
  items: PdfPromoItem[];
}

const isImageUrl = (url: string | undefined | null) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0]; 
  return cleanUrl.endsWith('.png') || cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.webp');
};

const getPdfCellProps = (localRowIndex: number, localColIndex: number, merges: MergeCell[], rowOffset: number, colWeights: number[]) => {
  const excelRow = localRowIndex + rowOffset;
  const excelCol = localColIndex;

  const props = {
    render: true,
    flex: colWeights[localColIndex] || 1, 
    hideBottomBorder: false,
    isMaster: true, 
    isHeaderMerge: false,
  };

  for (let i = 0; i < merges.length; i++) {
    const m = merges[i];
    if (excelRow >= m.s.r && excelRow <= m.e.r && excelCol >= m.s.c && excelCol <= m.e.c) {
      if (excelRow === m.s.r && excelCol === m.s.c) {
        props.isMaster = true;
        let spanFlex = 0;
        for(let c = m.s.c; c <= m.e.c; c++) spanFlex += colWeights[c] || 1;
        props.flex = spanFlex;

        if (excelRow < m.e.r) props.hideBottomBorder = true;
        if (m.s.r === rowOffset) props.isHeaderMerge = true;
      } else if (excelRow === m.s.r && excelCol > m.s.c) {
        props.render = false;
      } else if (excelRow > m.s.r) {
        if (excelCol === m.s.c) {
          props.render = true;
          props.isMaster = false;
          let spanFlex = 0;
          for(let c = m.s.c; c <= m.e.c; c++) spanFlex += colWeights[c] || 1;
          props.flex = spanFlex;

          if (excelRow < m.e.r) props.hideBottomBorder = true;
          if (m.s.r === rowOffset) props.isHeaderMerge = true;
        } else {
          props.render = false;
        }
      }
      break;
    }
  }
  return props;
};

interface PdfTableProps {
  data: CellValue[][];
  merges?: MergeCell[];
  rowOffset?: number;
}

const PdfTable = ({ data, merges = [], rowOffset = 0 }: PdfTableProps) => {
  if (!data || data.length === 0) return null;

  const maxColsCount = Math.max(...data.map(row => row?.length || 0));
  const columnsArray = Array.from({ length: maxColsCount });

  const colWeights = columnsArray.map((_, colIndex) => {
    let maxLength = 5; 
    
    data.forEach((row) => {
      const cellVal = row[colIndex];
      if (cellVal !== undefined && cellVal !== null) {
        maxLength = Math.max(maxLength, String(cellVal).length);
      }
    });
    return Math.min(maxLength, 40); 
  });

  return (
    <View style={styles.table}>
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tableRow} wrap={false}>
          {columnsArray.map((_, colIndex) => {
            const cellProps = getPdfCellProps(rowIndex, colIndex, merges, rowOffset, colWeights);
            
            if (!cellProps.render) return null;

            const isHeader = rowIndex === 0 || cellProps.isHeaderMerge;
            const cellValue = cellProps.isMaster ? row[colIndex] : ''; 

            return (
              <View 
                key={colIndex} 
                style={[
                  styles.tableCol, 
                  isHeader ? styles.tableColHeader : {},
                  { flex: cellProps.flex }, 
                  cellProps.hideBottomBorder ? { borderBottomWidth: 0 } : {} 
                ]}
              >
                <Text style={isHeader ? styles.tableCellHeader : styles.tableCell}>
                  {cellValue !== undefined && cellValue !== null ? String(cellValue) : ''}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export const PromosPdfTemplate: React.FC<PromosPdfProps> = ({ items }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>Промо акції</Text>

        {items.map((item, index) => {
          const hasImage = isImageUrl(item.sku);
          const hasTableData = item.parsedExcelData && item.parsedExcelData.length > 0;
          
          return (
            <View key={item.id} style={styles.itemContainer} wrap={false}>
              <Text style={styles.subtitle}>{index + 1}. {item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>

              {item.sku && hasImage && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={item.sku} style={styles.image} />
              )}

              {hasTableData && (
                <PdfTable 
                  data={item.parsedExcelData!} 
                  merges={item.excelMerges} 
                  rowOffset={item.excelRowOffset} 
                />
              )}

              {item.sku && !hasImage && !hasTableData && (
                <Link src={item.sku} style={styles.link}>
                  Прикріплений файл (натисніть, щоб відкрити)
                </Link>
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
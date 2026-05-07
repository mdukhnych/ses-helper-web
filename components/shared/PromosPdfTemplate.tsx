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
  page: { padding: 20, paddingBottom: 40, fontFamily: 'Roboto', backgroundColor: '#ffffff', flexDirection: 'column' },
  mainTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 5 },
  itemContainer: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eeeeee', borderBottomStyle: 'solid', flexDirection: 'column' },
  subtitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#000' },
  description: { fontSize: 9, color: '#333333', marginBottom: 10, lineHeight: 1.4, textAlign: 'justify' },
  image: { width: '100%', maxHeight: 250, objectFit: 'contain', marginTop: 8, marginBottom: 8 },
  link: { fontSize: 9, color: '#0066cc', textDecoration: 'underline', marginTop: 5 },

  table: {
    display: 'flex', flexDirection: 'column', width: '100%',
    borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf',
    borderBottomWidth: 0, borderRightWidth: 0, marginTop: 5,
  },
  tableRow: { display: 'flex', flexDirection: 'row' },
  tableCol: {
    borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf',
    borderTopWidth: 0, borderLeftWidth: 0, padding: 4,
  },
  tableColHeader: { backgroundColor: '#f3f4f6' },
  tableCell: { fontSize: 7, textAlign: 'center' },
  tableCellHeader: { fontSize: 7, fontWeight: 'bold', textAlign: 'center' },
  
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#888888',
  }
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

const PAGE_MAX_HEIGHT = 740; 

const estimateItemHeight = (item: PdfPromoItem): number => {
  let height = 50;
  if (item.description) {
    const paragraphs = item.description.split('\n');
    paragraphs.forEach(p => {
      height += Math.max(1, Math.ceil(p.length / 100)) * 14; 
    });
    height += 10;
  }

  if (isImageUrl(item.sku)) {
    height += 270; 
  }

  if (item.parsedExcelData && item.parsedExcelData.length > 0) {
    const validRows = item.parsedExcelData.filter(row => 
      !row.every(cell => cell === null || cell === undefined || cell === '')
    );
    height += validRows.length * 22 + 15; 
  }

  return height;
};

const optimizeLayout = (items: PdfPromoItem[]) => {
  const sizedItems = items.map(item => ({
    item,
    h: estimateItemHeight(item)
  }));

  sizedItems.sort((a, b) => b.h - a.h);

  const virtualPages: { remaining: number; items: PdfPromoItem[] }[] = [];

  for (const { item, h } of sizedItems) {
    let placed = false;
    
    for (let i = 0; i < virtualPages.length; i++) {
      if (virtualPages[i].remaining >= h) {
        virtualPages[i].items.push(item);
        virtualPages[i].remaining -= h;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const pagesNeeded = Math.ceil(h / PAGE_MAX_HEIGHT);
      const remainingOnLastPage = (pagesNeeded * PAGE_MAX_HEIGHT) - h;

      virtualPages.push({
        remaining: remainingOnLastPage,
        items: [item]
      });
    }
  }

  return virtualPages.flatMap(p => p.items);
};

const getPdfCellProps = (localRowIndex: number, localColIndex: number, merges: MergeCell[], rowOffset: number, colWeights: number[]) => {
  const excelRow = localRowIndex + rowOffset;
  const excelCol = localColIndex;
  const props = { render: true, flex: colWeights[localColIndex] || 1, hideBottomBorder: false, isMaster: true, isHeaderMerge: false };

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
          props.render = true; props.isMaster = false;
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

const PdfTable = ({ data, merges = [], rowOffset = 0 }: { data: CellValue[][], merges?: MergeCell[], rowOffset?: number }) => {
  if (!data || data.length === 0) return null;
  const maxColsCount = Math.max(...data.map(row => row?.length || 0));
  const columnsArray = Array.from({ length: maxColsCount });

  const colWeights = columnsArray.map((_, colIndex) => {
    let maxLength = 5; 
    data.forEach((row) => {
      const cellVal = row[colIndex];
      if (cellVal !== undefined && cellVal !== null) maxLength = Math.max(maxLength, String(cellVal).length);
    });
    return Math.min(maxLength, 40); 
  });

  return (
    <View style={styles.table}>
      {data.map((row, rowIndex) => {
        const isEmptyRow = row.every(cell => cell === null || cell === undefined || cell === '');
        if (isEmptyRow) return null;

        return (
          <View key={rowIndex} style={styles.tableRow} wrap={false}>
            {columnsArray.map((_, colIndex) => {
              const cellProps = getPdfCellProps(rowIndex, colIndex, merges, rowOffset, colWeights);
              if (!cellProps.render) return null;
              const isHeader = rowIndex === 0 || cellProps.isHeaderMerge;
              const cellValue = cellProps.isMaster ? row[colIndex] : ''; 

              return (
                <View key={colIndex} style={[styles.tableCol, isHeader ? styles.tableColHeader : {}, { flex: cellProps.flex }, cellProps.hideBottomBorder ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={isHeader ? styles.tableCellHeader : styles.tableCell}>
                    {cellValue !== undefined && cellValue !== null ? String(cellValue) : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export const PromosPdfTemplate: React.FC<PromosPdfProps> = ({ items }) => {
  const packedItems = optimizeLayout(items);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <Text style={styles.mainTitle} fixed>Промо акції</Text>

        {packedItems.map((item, index) => {
          const hasImage = isImageUrl(item.sku);
          const hasTableData = item.parsedExcelData && item.parsedExcelData.length > 0;

          return (
            <View key={item.id} style={styles.itemContainer}>
              <View wrap={false}>
                <Text style={styles.subtitle}>{index + 1}. {item.title}</Text>
                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}
              </View>

              {item.sku && hasImage && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={item.sku} style={styles.image} />
              )}

              {hasTableData && (
                <PdfTable data={item.parsedExcelData!} merges={item.excelMerges} rowOffset={item.excelRowOffset} />
              )}

              {item.sku && !hasImage && !hasTableData && (
                <Link src={item.sku} style={styles.link}>
                  Прикріплений файл (натисніть, щоб відкрити)
                </Link>
              )}
            </View>
          );
        })}

        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `Сторінка ${pageNumber} з ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
};
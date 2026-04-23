import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { WarrantyDataItem } from '@/types/services';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: { 
    padding: 20, 
    fontFamily: 'Roboto', 
    backgroundColor: '#ffffff' 
  },
  header: { 
    marginBottom: 20, 
    paddingBottom: 10, 
    borderBottom: '1px solid #e5e7eb' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#6b7280', 
    marginTop: 4 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginHorizontal: -5 
  },
  cardWrapper: { 
    padding: 5, 
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#eef8f9', 
    borderRadius: 8,
    padding: 16,
    position: 'relative',
    flexGrow: 1, 
    flexDirection: 'column',
  },
  cardHeader: { 
    marginBottom: 16, 
    marginTop: 12,     
    width: '100%',    
  },
  cardTitle: { 
    fontSize: 9, 
    fontWeight: 'bold', 
    color: '#000000', 
    textTransform: 'uppercase' 
  },
  badge: {
    backgroundColor: '#1e3a8a', 
    color: '#ffffff',
    padding: "6 10",
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
    top: 0,
    right: 0,
    alignItems: 'center',
  },
  badgeTextMain: { 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  descriptionBlock: { 
    flexGrow: 1,
    marginBottom: 10 
  },
  paragraph: {
    fontSize: 8,
    lineHeight: 1.2,
    color: '#1f2937',
    marginBottom: 6,
  },
});

interface PdfTemplateProps {
  data: WarrantyDataItem[];
  devicePrice: string;
  itemsPerRow?: number;
}

export const WarrantyPdfTemplate = ({ data, itemsPerRow = 3 }: PdfTemplateProps) => {
  const columnWidth = `${100 / itemsPerRow}%`;

  const parseDescription = (text: string) => {
    if (!text) return [];
    return text
      .replace('ОСОБЛИВОСТІ:\n\n', '') 
      .replace('ОСОБОИВОСТІ:\n\n', '')
      .split('\n\n') 
      .filter(item => item.trim() !== '');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Гарантійні послуги та захист</Text>
        </View>

        <View style={styles.grid}>
          {data.map((item) => {
            const paragraphs = parseDescription(item.description);
            const percentValue = (item.price * 100).toFixed(0);
            
            return (
              <View 
                key={item.id} 
                style={[styles.cardWrapper, { width: columnWidth }]} 
                wrap={false} 
              >
                <View style={styles.card}>
                  
                  <View style={styles.badge}>
                    <Text style={styles.badgeTextMain}>{percentValue}%</Text>
                  </View>

                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>

                  <View style={styles.descriptionBlock}>
                    {paragraphs.map((text, idx) => (
                      <Text key={idx} style={styles.paragraph}>
                        {text}
                      </Text>
                    ))}
                  </View>                  
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};
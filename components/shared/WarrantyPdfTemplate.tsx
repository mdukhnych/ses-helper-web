import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
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
    backgroundColor: '#000000', 
    marginHorizontal: -20, 
    marginTop: -20,
    paddingTop: 30, 
    paddingBottom: 20,
    paddingHorizontal: 25, 
    marginBottom: 30,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1,
  },
  headerMainTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 10,
    lineHeight: 1.2
  },
  headerHotline: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    alignItems: 'center',
    marginLeft: 20,
  },
  headerRightTextTop: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center'
  },
  qrCodeImage: {
    width: 65,
    height: 65,
    backgroundColor: '#ffffff', 
    padding: 2, 
    borderRadius: 4,
  },
  headerRightTextBottom: {
    fontSize: 10,
    color: '#ffffff',
    marginTop: 6,
  },

  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    width: '32%', 
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 1.3,
  },
  featureSubtitle: {
    fontSize: 8,
    color: '#4b5563',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cardWrapper: { padding: 5, marginBottom: 10, display: 'flex', flexDirection: 'column' },
  card: {
    backgroundColor: '#eef8f9', 
    borderRadius: 8,
    padding: 16,
    position: 'relative',
    flexGrow: 1, 
    flexDirection: 'column',
    border: '1px solid #e5e7eb' 
  },
  cardHeader: { marginBottom: 12, marginTop: 12, width: '100%' },
  cardTitle: { fontSize: 10, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' },
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
  badgeTextMain: { fontSize: 10, fontWeight: 'bold' },
  descriptionBlock: { flexGrow: 1, marginBottom: 5 },
  paragraph: { fontSize: 8, lineHeight: 1.3, color: '#1f2937', marginBottom: 6 },
});

interface PdfTemplateProps {
  data: WarrantyDataItem[];
  devicePrice?: string;
  itemsPerRow?: number;
  qrLink?: string;
}

export const WarrantyPdfTemplate = ({ data, itemsPerRow = 3, qrLink = "https://samsungshop.com.ua/services/" }: PdfTemplateProps) => {
  const columnWidth = `${100 / itemsPerRow}%`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrLink)}`;

  const parseDescription = (text: string) => {
    if (!text) return [];
    return text.replace('ОСОБЛИВОСТІ:\n\n', '').replace('ОСОБОИВОСТІ:\n\n', '').split('\n\n').filter(item => item.trim() !== '');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerMainTitle}>
              Гарантійний захист у{'\n'}Samsung Experience Store
            </Text>
            <Text style={styles.headerHotline}>
              Гаряча лінія: 0 800 303 707, 044 495 37 07
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.headerRightTextTop}>Детальна{'\n'}інформація:</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrImageUrl} style={styles.qrCodeImage} />
            <Text style={styles.headerRightTextBottom}>samsungshop.com.ua</Text>
          </View>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>+1 рік гарантії{'\n'}безкоштовно</Text>
            <Text style={styles.featureSubtitle}>Ексклюзивно в Samsung Experience Store</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Безкоштовна{'\n'}доставка</Text>
            <Text style={styles.featureSubtitle}>Швидко та зручно</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Унікальні{'\n'}сервіси SES</Text>
            <Text style={styles.featureSubtitle}>Сервіси для власників Samsung</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {data.map((item) => {
            const paragraphs = parseDescription(item.description);
            const percentValue = (item.price * 100).toFixed(0);
            
            return (
              <View key={item.id} style={[styles.cardWrapper, { width: columnWidth }]} wrap={false}>
                <View style={styles.card}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeTextMain}>{percentValue}%</Text>
                  </View>

                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>

                  <View style={styles.descriptionBlock}>
                    {paragraphs.map((text, idx) => (
                      <Text key={idx} style={styles.paragraph}>{text}</Text>
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
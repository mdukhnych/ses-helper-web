import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { PhoneServicesData } from '@/types/services';

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
    backgroundColor: '#ffffff', 
    color: '#111827' 
  },
  
  header: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #000'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000000',
  },

  table: {
    width: '100%',
    flexDirection: 'column',
    border: '1px solid #e5e7eb', 
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    minHeight: 28, 
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6', 
  },
  tableFooter: {
    backgroundColor: '#f3f4f6',
    borderBottom: 'none',
  },
  
  colName: {
    flex: 5.5, 
    padding: '6 10',
    justifyContent: 'center',
  },
  colValue: {
    flex: 1.2, 
    padding: '6 4',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '1px solid #e5e7eb',
  },
  
  textColHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textTitle: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  textRowTitle: {
    fontSize: 8, 
    fontWeight: 'medium',
    lineHeight: 1.3,
  },
  textPrice: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  dash: {
    color: '#9ca3af', 
    fontSize: 10,
    fontWeight: 'bold',
  }
});

const CheckIcon = () => (
  <Svg viewBox="0 0 24 24" width={12} height={12}>
    <Path fill="none" stroke="#16a34a" strokeWidth={2.5} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <Path fill="none" stroke="#16a34a" strokeWidth={2.5} d="M8 12l3 3 5-6" />
  </Svg>
);

export const PhoneServicesPdfTemplate = ({ data }: {data: PhoneServicesData}) => {
  const sortedServices = [...data.goodsAndServices].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  const sortedPackages = [...data.servicesItems].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

  const formatPrice = (price: number) => {
    return price === 0 ? "0,00 грн" : `${price.toLocaleString('uk-UA')},00 грн`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Перелік та зміст робіт для послуг налаштувань смартфонів</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colName}>
              <Text style={styles.textTitle}>Перелік товарів та робіт</Text>
            </View>
            {sortedPackages.map(pkg => (
              <View style={styles.colValue} key={pkg.id}>
                <Text style={styles.textColHeader}>{pkg.title}</Text>
              </View>
            ))}
          </View>

          {sortedServices.map(service => (
            <View style={styles.tableRow} key={service.id}>
              <View style={styles.colName}>
                <Text style={styles.textRowTitle}>{service.title}</Text>
              </View>

              {sortedPackages.map(pkg => {
                const isIncluded = pkg.items.some(item => item.id === service.id);
                return (
                  <View style={styles.colValue} key={`${pkg.id}-${service.id}`}>
                    {isIncluded ? <CheckIcon /> : <Text style={styles.dash}>—</Text>}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={[styles.tableRow, styles.tableFooter]}>
            <View style={styles.colName}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: '#6b7280' }}>ВАРТІСТЬ ПОСЛУГ</Text>
            </View>
            {sortedPackages.map(pkg => (
              <View style={styles.colValue} key={`price-${pkg.id}`}>
                <Text style={styles.textPrice}>{formatPrice(pkg.price)}</Text>
              </View>
            ))}
          </View>

        </View>
      </Page>
    </Document>
  );
};
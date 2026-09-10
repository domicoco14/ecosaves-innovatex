import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CURRENCIES, useCurrencyStore } from '../store/currencyStore';

export const CurrencySelectorModal = ({ visible, onClose }) => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>🌍 Pan-African Currency</Text>
              <Text style={styles.subtitle}>Select display currency for live conversions</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
            {CURRENCIES.map((c) => {
              const isSelected = selectedCurrency.code === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.currencyRow, isSelected && styles.selectedRow]}
                  onPress={() => {
                    setCurrency(c.code);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.leftGroup}>
                    <Text style={styles.flagText}>{c.flag}</Text>
                    <View style={styles.textGroup}>
                      <Text style={styles.currencyName}>{c.name}</Text>
                      <Text style={styles.currencyCode}>{c.code} • {c.symbol}</Text>
                    </View>
                  </View>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 30, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
  },
  subtitle: {
    fontSize: 13,
    color: '#737980',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#737980',
    fontWeight: '700',
  },
  currencyList: {
    marginTop: 4,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E8EB',
  },
  selectedRow: {
    backgroundColor: '#E6F3F7',
    borderColor: '#005B7F',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 28,
    marginRight: 14,
  },
  textGroup: {},
  currencyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#161C20',
  },
  currencyCode: {
    fontSize: 12,
    color: '#737980',
    fontWeight: '600',
    marginTop: 2,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#005B7F',
  },
});

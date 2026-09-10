import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1.0 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: 0.010 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 0.085 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', rate: 0.012 },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc', flag: '🇨🇩', rate: 1.85 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rate: 0.00063 },
];

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      selectedCurrency: CURRENCIES[0], // Default NGN 🇳🇬 ₦

      setCurrency: (currencyCode) => {
        const found = CURRENCIES.find((c) => c.code === currencyCode);
        if (found) {
          set({ selectedCurrency: found });
        }
      },

      /**
       * Convert NGN amount to selected currency value
       */
      convertAmount: (amountInNgn) => {
        const { selectedCurrency } = get();
        return (amountInNgn || 0) * selectedCurrency.rate;
      },

      /**
       * Format NGN base amount into current active display currency
       */
      formatAmount: (amountInNgn, showDecimals = false) => {
        const { selectedCurrency } = get();
        const converted = (amountInNgn || 0) * selectedCurrency.rate;

        const formattedNumber = converted.toLocaleString('en-US', {
          minimumFractionDigits: showDecimals || selectedCurrency.code === 'USD' || selectedCurrency.code === 'GHS' ? 2 : 0,
          maximumFractionDigits: 2,
        });

        return `${selectedCurrency.symbol}${formattedNumber}`;
      },
    }),
    {
      name: 'ecosaves_currency_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

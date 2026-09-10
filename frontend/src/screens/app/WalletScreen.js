import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { CurrencySelectorModal } from '../../components/CurrencySelectorModal';

export const WalletScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const formatAmount = useCurrencyStore((state) => state.formatAmount);

  const blazeAccountNo = user?.blaze_account_number || '1441002006858';
  const lastFour = blazeAccountNo.slice(-4);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [amountInput, setAmountInput] = useState('10000');
  const [processing, setProcessing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const quickAmounts = ['5000', '10000', '25000', '50000', '100000'];

  const handleDeposit = () => {
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to deposit.');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowAddModal(false);
      setBalance((prev) => prev + num);

      const newTx = {
        id: Date.now().toString(),
        title: 'Ecobank Blaze Wallet Topup',
        meta: 'Today • Deposit',
        amount: `+${formatAmount(num, true)}`,
        type: 'credit',
        icon: '⬇️',
      };

      setTransactions((prev) => [newTx, ...prev]);

      Alert.alert(
        'Deposit Successful! 🎉',
        `${formatAmount(num, true)} has been added to your EcoSaves Wallet via Ecobank Blaze account ${blazeAccountNo}.`
      );
    }, 1200);
  };

  const handleWithdraw = () => {
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (num > balance) {
      Alert.alert('Insufficient Funds', 'Withdrawal amount exceeds available wallet balance.');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowWithdrawModal(false);
      setBalance((prev) => prev - num);

      const newTx = {
        id: Date.now().toString(),
        title: 'Withdrawal to Ecobank Blaze',
        meta: 'Today • Transfer',
        amount: `-${formatAmount(num, true)}`,
        type: 'debit',
        icon: '⬆️',
      };

      setTransactions((prev) => [newTx, ...prev]);

      Alert.alert(
        'Withdrawal Initiated! 🏦',
        `${formatAmount(num, true)} has been queued for transfer to your verified Ecobank Blaze account.`
      );
    }, 1200);
  };

  const handleCopyAccount = () => {
    Alert.alert('Account Number Copied! 📋', `Ecobank Blaze account ${blazeAccountNo} copied to clipboard.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CurrencySelectorModal visible={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Sleek Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Blaze Wallet</Text>
            <Text style={styles.pageSubtitle}>Ecobank Blaze Account Integration</Text>
          </View>

          {/* Pan-African Currency Switcher Pill */}
          <TouchableOpacity
            style={styles.currencyPillHeader}
            onPress={() => setShowCurrencyModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.currencyPillText}>
              {selectedCurrency.flag} {selectedCurrency.code} ({selectedCurrency.symbol}) ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Wallet Card */}
        <Card style={styles.walletHeroCard}>
          <Text style={styles.walletSub}>Total Wallet Balance</Text>
          <Text style={styles.walletBalance}>
            {formatAmount(balance, true)}
          </Text>

          <View style={styles.heroBtnRow}>
            <TouchableOpacity
              style={styles.addFundsBtn}
              onPress={() => {
                setAmountInput('10000');
                setShowAddModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.addFundsText}>+ Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => {
                setAmountInput('5000');
                setShowWithdrawModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.withdrawText}>↑ Withdraw</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Linked Account Section */}
        <Text style={styles.sectionLabel}>Linked Account</Text>
        <TouchableOpacity activeOpacity={0.88} onPress={handleCopyAccount}>
          <Card style={styles.linkedAccountCard}>
            <View style={styles.bankIconBox}>
              <Text style={styles.bankIconText}>🏦</Text>
            </View>

            <View style={styles.bankDetails}>
              <Text style={styles.bankName}>Ecobank Blaze Account</Text>
              <View style={styles.accBadgeRow}>
                <Text style={styles.accMaskText}>•••••• {lastFour}</Text>
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              </View>
            </View>

            <View style={styles.copyPill}>
              <Text style={styles.copyPillText}>Copy 📋</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Transaction History */}
        <View style={styles.historyHeaderRow}>
          <Text style={styles.sectionLabel}>Transaction History</Text>
          {transactions.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('ContributionHistory')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No transaction history yet</Text>
            <Text style={styles.emptySub}>Top up your wallet using your Ecobank Blaze account to start your Pan-African savings journey.</Text>
          </Card>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} style={styles.txCard}>
              <View style={[styles.txIconBox, tx.type === 'debit' ? styles.txIconDebit : styles.txIconCredit]}>
                <Text style={styles.txIconText}>{tx.icon}</Text>
              </View>

              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txMeta}>{tx.meta}</Text>
              </View>

              <Text style={tx.type === 'debit' ? styles.txAmountDebit : styles.txAmountCredit}>
                {tx.amount}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>

      {/* 1. ADD FUNDS MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Add Funds to Wallet</Text>
            <Text style={styles.modalSub}>Deposit funds instantly using your linked Ecobank Blaze Account.</Text>

            <Text style={styles.inputLabel}>Select or Enter Amount (₦)</Text>
            <View style={styles.quickAmountRow}>
              {quickAmounts.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickAmountPill, amountInput === val && styles.quickAmountPillActive]}
                  onPress={() => setAmountInput(val)}
                >
                  <Text style={[styles.quickAmountText, amountInput === val && styles.quickAmountTextActive]}>
                    ₦{parseInt(val).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.amountTextInput}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="number-pad"
              placeholder="Enter custom amount"
              placeholderTextColor="#999"
            />

            <View style={styles.accountSourceBox}>
              <Text style={styles.accountSourceText}>
                Source: Ecobank Blaze Account ({blazeAccountNo})
              </Text>
            </View>

            <Button
              title="Deposit via Ecobank Blaze"
              variant="accent"
              loading={processing}
              onPress={handleDeposit}
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. WITHDRAW MODAL */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Withdraw Funds</Text>
            <Text style={styles.modalSub}>Transfer savings to your verified Ecobank account.</Text>

            <Text style={styles.inputLabel}>Withdrawal Amount (₦)</Text>
            <TextInput
              style={styles.amountTextInput}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="number-pad"
              placeholder="Enter amount"
              placeholderTextColor="#999"
            />

            <View style={styles.accountSourceBox}>
              <Text style={styles.accountSourceText}>
                Destination: Ecobank Account ({blazeAccountNo})
              </Text>
            </View>

            <Button
              title="Confirm Withdrawal"
              loading={processing}
              onPress={handleWithdraw}
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowWithdrawModal(false)}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F9F9',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#161C20',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#737980',
    marginTop: 2,
    fontWeight: '500',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#161C20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bellText: {
    fontSize: 16,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E98591',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  walletHeroCard: {
    backgroundColor: '#005B7F',
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
  },
  walletSub: {
    fontSize: 13,
    color: '#BAE6FD',
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 12,
  },
  heroBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addFundsBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  addFundsText: {
    color: '#005B7F',
    fontWeight: '800',
    fontSize: 13,
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  withdrawText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 10,
  },
  linkedAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F3F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bankIconText: {
    fontSize: 20,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#161C20',
  },
  accBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  accMaskText: {
    fontSize: 13,
    color: '#737980',
    marginRight: 6,
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#29875A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  copyPill: {
    backgroundColor: '#E6F3F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyPillText: {
    color: '#005B7F',
    fontSize: 11,
    fontWeight: '800',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#005B7F',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconDebit: {
    backgroundColor: '#FFF0F2',
  },
  txIconCredit: {
    backgroundColor: '#E6F5EB',
  },
  txIconText: {
    fontSize: 14,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161C20',
  },
  txMeta: {
    fontSize: 11,
    color: '#737980',
    marginTop: 2,
  },
  txAmountDebit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D32F2F',
  },
  txAmountCredit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#29875A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 30, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#737980',
    marginBottom: 16,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#161C20',
    marginBottom: 8,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  quickAmountPill: {
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  quickAmountPillActive: {
    backgroundColor: '#005B7F',
    borderColor: '#005B7F',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#161C20',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  amountTextInput: {
    backgroundColor: '#F6F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#161C20',
    borderWidth: 1,
    borderColor: '#E0E6E8',
    marginBottom: 12,
  },
  accountSourceBox: {
    backgroundColor: '#E6F3F7',
    borderRadius: 10,
    padding: 10,
  },
  accountSourceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005B7F',
  },
  currencyPillHeader: {
    backgroundColor: '#E6F3F7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#005B7F',
  },
  currencyPillText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#737980',
    textAlign: 'center',
    lineHeight: 18,
  },
  cancelModalBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#737980',
  },
});

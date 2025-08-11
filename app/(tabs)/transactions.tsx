import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { PaymentRequest } from '@/types/database';
import {
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<PaymentRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  const { colors } = useTheme();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.bill_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer_mobile.includes(searchQuery) ||
      transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'paid': return <TrendingUp size={16} color={colors.success} />;
      case 'failed': return <TrendingDown size={16} color={colors.error} />;
      default: return <Minus size={16} color={colors.warning} />;
    }
  };

  const FilterChip = ({ value, label, count }: any) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: filterStatus === value ? colors.primary : colors.card,
        },
      ]}
      onPress={() => setFilterStatus(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          {
            color: filterStatus === value ? '#FFFFFF' : colors.text,
          },
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const TransactionCard = ({ item }: { item: PaymentRequest }) => (
    <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.billInfo}>
            <Text style={[styles.billNumber, { color: colors.text }]}>
              #{item.bill_no}
            </Text>
            {getTrendIcon(item.status)}
          </View>
          <Text style={[styles.customerName, { color: colors.textSecondary }]}>
            {item.customer_name || 'Customer'}
          </Text>
          <Text style={[styles.customerMobile, { color: colors.textSecondary }]}>
            {item.customer_mobile}
          </Text>
        </View>
        
        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color: colors.text }]}>
            ₹{item.amount.toLocaleString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionFooter}>
        <Text style={[styles.dateTime, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        {item.status === 'paid' && (
          <Text style={[styles.paidTime, { color: colors.success }]}>
            Paid: {new Date(item.updated_at).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  const paidCount = transactions.filter(t => t.status === 'paid').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transaction History</Text>
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]}>
          <Download size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchText, { color: colors.text }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FilterChip value="all" label="All" count={transactions.length} />
        <FilterChip value="paid" label="Paid" count={paidCount} />
        <FilterChip value="pending" label="Pending" count={pendingCount} />
        <FilterChip value="failed" label="Failed" count={failedCount} />
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={TransactionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No transactions found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    padding: 24,
    gap: 12,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  billNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  customerMobile: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  amountSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  transactionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  paidTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TrendingUp, DollarSign, Clock, TriangleAlert as AlertTriangle, Plus, UserCheck, FileText } from 'lucide-react-native';

interface DashboardStats {
  totalRequests: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmount: number;
  todayRevenue: number;
}

interface RecentTransaction {
  id: string;
  bill_no: string;
  amount: number;
  customer_mobile: string;
  status: string;
  created_at: string;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    totalAmount: 0,
    todayRevenue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const { admin } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load payment requests stats
      const { data: paymentRequests } = await supabase
        .from('payment_requests')
        .select('*');

      if (paymentRequests) {
        const totalRequests = paymentRequests.length;
        const successfulPayments = paymentRequests.filter(p => p.status === 'paid').length;
        const pendingPayments = paymentRequests.filter(p => p.status === 'pending').length;
        const failedPayments = paymentRequests.filter(p => p.status === 'failed').length;
        const totalAmount = paymentRequests
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);

        // Today's revenue
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = paymentRequests
          .filter(p => p.status === 'paid' && p.updated_at?.startsWith(today))
          .reduce((sum, p) => sum + p.amount, 0);

        setStats({
          totalRequests,
          successfulPayments,
          pendingPayments,
          failedPayments,
          totalAmount,
          todayRevenue,
        });
      }

      // Load recent transactions
      const { data: transactions } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactions) {
        setRecentTransactions(transactions);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={24} color={color} />
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const QuickAction = ({ title, icon: Icon, onPress, color }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.quickActionText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Welcome back, {admin?.full_name?.split(' ')[0]}
        </Text>
        <Text style={[styles.companyName, { color: colors.textSecondary }]}>
          {admin?.company_name}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          icon={FileText}
          color={colors.primary}
        />
        <StatCard
          title="Successful"
          value={stats.successfulPayments.toLocaleString()}
          icon={TrendingUp}
          color={colors.success}
        />
        <StatCard
          title="Pending"
          value={stats.pendingPayments.toLocaleString()}
          icon={Clock}
          color={colors.warning}
        />
        <StatCard
          title="Failed"
          value={stats.failedPayments.toLocaleString()}
          icon={AlertTriangle}
          color={colors.error}
        />
      </View>

      <View style={styles.revenueCards}>
        <View style={[styles.revenueCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>
            Total Revenue
          </Text>
          <Text style={[styles.revenueValue, { color: colors.success }]}>
            ₹{stats.totalAmount.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.revenueCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>
            Today's Revenue
          </Text>
          <Text style={[styles.revenueValue, { color: colors.primary }]}>
            ₹{stats.todayRevenue.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="New Payment"
            icon={Plus}
            color={colors.primary}
            onPress={() => {}}
          />
          <QuickAction
            title="Approve Employee"
            icon={UserCheck}
            color={colors.success}
            onPress={() => {}}
          />
          <QuickAction
            title="View Reports"
            icon={FileText}
            color={colors.warning}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Transactions
        </Text>
        <View style={[styles.transactionsList, { backgroundColor: colors.card }]}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.billNo, { color: colors.text }]}>
                    #{transaction.bill_no}
                  </Text>
                  <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
                    {transaction.customer_mobile}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[styles.amount, { color: colors.text }]}>
                    ₹{transaction.amount.toLocaleString()}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          transaction.status === 'paid'
                            ? `${colors.success}20`
                            : transaction.status === 'pending'
                            ? `${colors.warning}20`
                            : `${colors.error}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            transaction.status === 'paid'
                              ? colors.success
                              : transaction.status === 'pending'
                              ? colors.warning
                              : colors.error,
                        },
                      ]}
                    >
                      {transaction.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent transactions
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  revenueCards: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 12,
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  transactionsList: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionInfo: {
    flex: 1,
  },
  billNo: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
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
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
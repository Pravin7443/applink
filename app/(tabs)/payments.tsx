import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { PaymentRequest, Employee } from '@/types/database';
import { Plus, Filter, Search, ExternalLink, DollarSign, Clock, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';

export default function PaymentsScreen() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    billNo: '',
    amount: '',
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    employeeId: '',
  });

  const { colors } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsResponse, employeesResponse] = await Promise.all([
        supabase
          .from('payment_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('employees')
          .select('*')
          .eq('status', 'active'),
      ]);

      if (paymentsResponse.data) setPaymentRequests(paymentsResponse.data);
      if (employeesResponse.data) setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const createPaymentRequest = async () => {
    if (!formData.billNo || !formData.amount || !formData.customerMobile) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const paymentLink = `https://pay.example.com/${Date.now()}`;
      
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          bill_no: formData.billNo,
          amount: parseFloat(formData.amount),
          customer_name: formData.customerName,
          customer_mobile: formData.customerMobile,
          customer_email: formData.customerEmail,
          employee_id: formData.employeeId || null,
          payment_link: paymentLink,
          status: 'pending',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Payment request created successfully');
      setShowCreateModal(false);
      setFormData({
        billNo: '',
        amount: '',
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        employeeId: '',
      });
      await loadData();
    } catch (error) {
      console.error('Error creating payment request:', error);
      Alert.alert('Error', 'Failed to create payment request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={20} color={colors.success} />;
      case 'pending': return <Clock size={20} color={colors.warning} />;
      case 'failed': return <XCircle size={20} color={colors.error} />;
      default: return <Clock size={20} color={colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const filteredPayments = paymentRequests.filter(payment =>
    payment.bill_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.customer_mobile.includes(searchQuery) ||
    payment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PaymentCard = ({ item }: { item: PaymentRequest }) => (
    <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.billNumber, { color: colors.text }]}>
            #{item.bill_no}
          </Text>
          <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
            {item.customer_name || item.customer_mobile}
          </Text>
        </View>
        <View style={styles.paymentStatus}>
          {getStatusIcon(item.status)}
          <Text style={[styles.amount, { color: colors.text }]}>
            ₹{item.amount.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
          Mobile: {item.customer_mobile}
        </Text>
        {item.customer_email && (
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Email: {item.customer_email}
          </Text>
        )}
        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.paymentFooter}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text
            style={[
              styles.statusLabel,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.linkButton}>
          <ExternalLink size={16} color={colors.primary} />
          <Text style={[styles.linkButtonText, { color: colors.primary }]}>
            View Link
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Payment Requests</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchText, { color: colors.text }]}
            placeholder="Search by bill number, mobile, or name"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={PaymentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No payment requests found
          </Text>
        }
      />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Payment Request
            </Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Bill Number *
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.billNo}
                onChangeText={(value) => setFormData(prev => ({ ...prev, billNo: value }))}
                placeholder="Enter bill number"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Amount *
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.amount}
                onChangeText={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Customer Mobile *
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.customerMobile}
                onChangeText={(value) => setFormData(prev => ({ ...prev, customerMobile: value }))}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Customer Name
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.customerName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, customerName: value }))}
                placeholder="Enter customer name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={createPaymentRequest}
            >
              <Text style={styles.createButtonText}>Create Payment Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
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
  listContainer: {
    padding: 24,
    gap: 12,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  billNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  paymentStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  paymentDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  formInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
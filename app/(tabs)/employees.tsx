import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/types/database';
import { Users, UserCheck, UserX, CreditCard as Edit, MoveVertical as MoreVertical, Plus } from 'lucide-react-native';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'blocked'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      Alert.alert('Error', 'Failed to load employees');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const updateEmployeeStatus = async (employeeId: string, status: 'active' | 'blocked') => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', employeeId);

      if (error) throw error;
      
      await loadEmployees();
      Alert.alert('Success', `Employee ${status === 'active' ? 'approved' : 'blocked'} successfully`);
    } catch (error) {
      console.error('Error updating employee:', error);
      Alert.alert('Error', 'Failed to update employee status');
    }
  };

  const handleEmployeeAction = (employee: Employee, action: 'approve' | 'block' | 'edit') => {
    switch (action) {
      case 'approve':
        Alert.alert(
          'Approve Employee',
          `Approve ${employee.full_name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Approve', onPress: () => updateEmployeeStatus(employee.id, 'active') },
          ]
        );
        break;
      case 'block':
        Alert.alert(
          'Block Employee',
          `Block ${employee.full_name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', onPress: () => updateEmployeeStatus(employee.id, 'blocked') },
          ]
        );
        break;
      case 'edit':
        // Navigate to edit screen
        break;
    }
  };

  const filteredEmployees = employees.filter(emp => 
    filter === 'all' || emp.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'blocked': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const FilterButton = ({ filterValue, title, count }: any) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === filterValue ? colors.primary : colors.card,
        },
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text
        style={[
          styles.filterText,
          {
            color: filter === filterValue ? '#FFFFFF' : colors.text,
          },
        ]}
      >
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  const EmployeeCard = ({ item }: { item: Employee }) => (
    <View style={[styles.employeeCard, { backgroundColor: colors.card }]}>
      <View style={styles.employeeHeader}>
        <View style={styles.employeeInfo}>
          <Text style={[styles.employeeName, { color: colors.text }]}>
            {item.full_name}
          </Text>
          <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>
            {item.email}
          </Text>
          <Text style={[styles.employeePhone, { color: colors.textSecondary }]}>
            {item.mobile_number}
          </Text>
        </View>
        <View style={styles.employeeActions}>
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

      <View style={styles.employeeDetails}>
        <Text style={[styles.upiLabel, { color: colors.textSecondary }]}>
          UPI ID: {item.upi_id}
        </Text>
        <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
          Role: {item.role}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => handleEmployeeAction(item, 'approve')}
          >
            <UserCheck size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleEmployeeAction(item, 'block')}
          >
            <UserX size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Block</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEmployeeAction(item, 'edit')}
        >
          <Edit size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const pendingCount = employees.filter(e => e.status === 'pending').length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const blockedCount = employees.filter(e => e.status === 'blocked').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Employees</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterButton filterValue="all" title="All" count={employees.length} />
        <FilterButton filterValue="pending" title="Pending" count={pendingCount} />
        <FilterButton filterValue="active" title="Active" count={activeCount} />
        <FilterButton filterValue="blocked" title="Blocked" count={blockedCount} />
      </ScrollView>

      <FlatList
        data={filteredEmployees}
        renderItem={EmployeeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No employees found
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    padding: 24,
    gap: 12,
  },
  employeeCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  employeePhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  employeeActions: {
    alignItems: 'flex-end',
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
  employeeDetails: {
    marginBottom: 16,
  },
  upiLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  roleLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
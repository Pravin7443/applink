import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Building,
  Shield,
  Bell,
  Moon,
  Sun,
  Download,
  LogOut,
  ChevronRight,
  CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { admin, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const SettingsSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ icon: Icon, title, subtitle, onPress, rightElement }: any) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIcon, { backgroundColor: `${colors.primary}20` }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View style={styles.settingsText}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={[styles.profileCardContent, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {admin?.full_name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {admin?.full_name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {admin?.email}
            </Text>
            <Text style={[styles.profileRole, { color: colors.primary }]}>
              {admin?.role?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <SettingsSection title="Account">
        <SettingsItem
          icon={User}
          title="Profile Settings"
          subtitle="Update your personal information"
          onPress={() => {}}
        />
        <SettingsItem
          icon={Building}
          title="Company Settings"
          subtitle={admin?.company_name}
          onPress={() => {}}
        />
        <SettingsItem
          icon={CreditCard}
          title="Payment Settings"
          subtitle="Manage UPI IDs and payment gateways"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsItem
          icon={Shield}
          title="Security Settings"
          subtitle="Two-factor authentication, biometric login"
          onPress={() => {}}
        />
        <SettingsItem
          icon={Download}
          title="Data Backup"
          subtitle="Download complete database snapshot"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsItem
          icon={isDark ? Moon : Sun}
          title="Dark Mode"
          subtitle="Toggle between light and dark theme"
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingsItem
          icon={Bell}
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsItem
          icon={SettingsIcon}
          title="App Settings"
          subtitle="Version 1.0.0"
          onPress={() => {}}
        />
      </SettingsSection>

      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  profileCard: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  profileCardContent: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  sectionContent: {
    marginHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
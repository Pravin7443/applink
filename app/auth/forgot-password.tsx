import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Mail } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { sendOTP } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    const { error } = await sendOTP(email);
    setIsLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert(
        'OTP Sent',
        'Please check your email for the verification code',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/auth/verify-otp',
              params: { email }
            }),
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Reset Password
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your email to receive a verification code
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.inputContainer}>
          <Mail size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Email address"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text style={[styles.backLink, { color: colors.primary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  backLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
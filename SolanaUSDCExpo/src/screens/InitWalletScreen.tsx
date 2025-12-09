import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { initWallet } from '../crypto/wallet';

type InitWalletProps = StackNavigationProp<RootStackParamList, 'InitWallet'>;

const InitWalletScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<InitWalletProps>();

  const handleInit = async () => {
    if (password.length < 8) {
      Alert.alert('错误', '密码长度需≥8位');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('错误', '两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      await initWallet(password);
      Alert.alert('成功', '钱包创建成功！');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('错误', (error as Error).message);
    } finally {
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>创建Solana USDC钱包</Text>
      <Text style={styles.subtitle}>密码仅存储在本地，请勿泄露</Text>

      <TextInput
        style={styles.input}
        placeholder="设置密码（≥8位）"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="确认密码"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title={loading ? '创建中...' : '创建钱包'}
        onPress={handleInit}
        disabled={loading}
        color="#007AFF"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default InitWalletScreen;


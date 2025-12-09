import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { getPublicKey } from '../crypto/wallet';
import { buildUsdcTx } from '../solana/transaction';

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleCreateTx = async () => {
    if (!toAddress || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('错误', '请输入有效地址和金额');
      return;
    }

    try {
      const fromPk = await getPublicKey();
      if (!fromPk) {
        Alert.alert('错误', '钱包未初始化');
        navigation.navigate('InitWallet');
        return;
      }

      const { unsignedTx, feeUsdc } = await buildUsdcTx(
        fromPk,
        toAddress,
        parseFloat(amount)
      );
      navigation.navigate('SignTx', { unsignedTxBase64: unsignedTx, feeUsdc });
    } catch (error) {
      Alert.alert('错误', (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>USDC 转账</Text>
      
      <TextInput
        style={styles.input}
        placeholder="接收方Solana地址（测试网）"
        value={toAddress}
        onChangeText={setToAddress}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="转账金额（USDC）"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Button
        title="下一步：签名交易"
        onPress={handleCreateTx}
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

export default HomeScreen;


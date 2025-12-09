import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenCapture from 'expo-screen-capture';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp, StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { getPrivateKey } from '../crypto/wallet';
import { signTx, submitTx } from '../solana/transaction';

type SignTxRouteProp = RouteProp<RootStackParamList, 'SignTx'>;
type SignTxNavProp = StackNavigationProp<RootStackParamList, 'SignTx'>;

const SignTxScreen = () => {
  const route = useRoute<SignTxRouteProp>();
  const navigation = useNavigation<SignTxNavProp>();
  const { unsignedTxBase64, feeUsdc } = route.params;
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Expo防截屏（跨平台）
  useEffect(() => {
    // 禁用截屏
    const disableCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    disableCapture();

    // 监听截屏事件
    const subscription = ScreenCapture.captureEvent.addListener(() => {
      Alert.alert('警告', '禁止截屏，敏感信息已保护');
    });

    // 页面卸载恢复
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      subscription.remove();
    };
  }, []);

  const handleSignAndSubmit = async () => {
    if (!password) {
      Alert.alert('错误', '请输入钱包密码');
      return;
    }

    setLoading(true);
    try {
      // 解密私钥
      const privateKey = await getPrivateKey(password);
      // 本地签名交易
      const signedTx = await signTx(unsignedTxBase64, privateKey);
      // 提交交易（测试网）
      const txId = await submitTx(signedTx);

      Alert.alert('成功', `交易提交成功！\nTxID: ${txId.slice(0, 10)}...`);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('错误', (error as Error).message);
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>确认USDC转账</Text>
      <Text style={styles.fee}>手续费：{feeUsdc.toFixed(4)} USDC（平台支付Gas）</Text>
      <Text style={styles.hint}>输入钱包密码完成签名</Text>

      <TextInput
        style={styles.input}
        placeholder="钱包密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title={loading ? '签名中...' : '确认签名并提交'}
        onPress={handleSignAndSubmit}
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
  fee: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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

export default SignTxScreen;


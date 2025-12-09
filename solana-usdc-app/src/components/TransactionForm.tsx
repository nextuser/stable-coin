import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Divider, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { usePrivateKey } from '../hooks/usePrivateKey';
import { getUsdcBalance } from '../utils/solana';
import { useFeeRule } from '../hooks/useFeeRule';
import { useTransaction } from '../hooks/useTransaction';

// 表单校验规则
const transactionSchema = Yup.object().shape({
  toAddress: Yup.string()
    .required('请输入收款地址')
    .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, '无效的Solana地址'),
  amount: Yup.number()
    .required('请输入转账金额')
    .min(0.01, '最小转账金额0.01 USDC'),
  password: Yup.string().required('请输入密码'),
});

export const TransactionForm = () => {
  const [balance, setBalance] = useState(0);
  const { encryptedKey, walletAddress, decryptAndGetAddress, decryptLoading } = usePrivateKey();
  const { feeRule, loading: feeLoading } = useFeeRule();
  const { submitTransaction, loading: txLoading } = useTransaction();

  // 初始化：查询余额
  useEffect(() => {
    const fetchBalance = async () => {
      if (walletAddress) {
        const bal = await getUsdcBalance(walletAddress);
        setBalance(bal);
      }
    };
    fetchBalance();
  }, [walletAddress]);

  // 计算手续费
  const calculateFee = (amount: number) => {
    if (!feeRule || amount <= 0) return 0;
    if (feeRule.type === 'fixed') {
      return feeRule.value;
    }
    const fee = amount * feeRule.value;
    return feeRule.min ? Math.max(fee, feeRule.min) : fee;
  };

  const handleSubmit = async (values: any) => {
    if (!encryptedKey) {
      return Alert.alert('提示', '请先导入私钥');
    }

    let address = walletAddress;
    if (!address) {
      // 验证密码并获取地址
      address = await decryptAndGetAddress(values.password);
      if (!address) return;
    }

    const amount = values.amount;
    const fee = calculateFee(amount);
    const total = amount + fee;

    if (total > balance) {
      return Alert.alert('提示', `余额不足（需 ${total} USDC，当前 ${balance} USDC）`);
    }

    await submitTransaction(
      address,
      values.toAddress,
      amount,
      feeRule!,
      encryptedKey,
      values.password
    );
  };

  if (feeLoading) {
    return <Text style={styles.loading}>加载手续费规则中...</Text>;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>USDC 转账</Title>

      <View style={styles.walletInfo}>
        <Text style={styles.label}>当前钱包地址：</Text>
        <Text style={styles.address}>{walletAddress || '未验证'}</Text>
        <Text style={styles.balance}>余额：{balance} USDC</Text>
      </View>

      <Formik
        initialValues={{ toAddress: '', amount: '', password: '', fee: 0 }}
        validationSchema={transactionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => {
          // 监听金额变化，计算手续费
          const handleAmountChange = (text: string) => {
            const amount = parseFloat(text) || 0;
            const fee = calculateFee(amount);
            setFieldValue('amount', amount);
            setFieldValue('fee', fee);
          };

          return (
            <View style={styles.form}>
              <TextInput
                label="收款地址"
                value={values.toAddress}
                onChangeText={handleChange('toAddress')}
                onBlur={handleBlur('toAddress')}
                style={styles.input}
                error={touched.toAddress && !!errors.toAddress}
              />

              <TextInput
                label="转账金额（USDC）"
                value={values.amount.toString()}
                onChangeText={handleAmountChange}
                onBlur={handleBlur('amount')}
                keyboardType="numeric"
                style={styles.input}
                error={touched.amount && !!errors.amount}
              />

              <TextInput
                label="平台手续费（USDC）"
                value={values.fee.toString()}
                editable={false}
                style={styles.input}
              />

              <TextInput
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                style={styles.input}
                error={touched.password && !!errors.password}
              />

              <Divider style={styles.divider} />

              <Button
                mode="contained"
                onPress={handleSubmit as () => void}
                loading={txLoading || decryptLoading}
                style={styles.button}
              >
                提交转账
              </Button>

              <Text style={styles.hint}>
                提示：交易Gas费由平台代付，您仅需支付USDC手续费
              </Text>
            </View>
          );
        }}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  walletInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  balance: {
    fontSize: 14,
    color: '#2ecc71',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
  },
  form: {
  },
  input: {
    backgroundColor: '#fff',
  },
  divider: {
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    padding: 5,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

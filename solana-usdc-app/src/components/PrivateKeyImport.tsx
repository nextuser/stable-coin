import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Divider } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { usePrivateKey } from '../hooks/usePrivateKey';

// 表单校验规则
const importKeySchema = Yup.object().shape({
  privateKey: Yup.string()
    .required('请输入私钥')
    .length(44, '私钥长度必须为44位'),
  password: Yup.string()
    .required('请设置加密密码')
    .min(8, '密码长度不少于8位')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/, '密码需包含字母、数字、特殊符号'),
  confirmPassword: Yup.string()
    .required('请确认密码')
    .oneOf([Yup.ref('password')], '两次输入的密码不一致'),
});

export const PrivateKeyImport = () => {
  const [loading, setLoading] = useState(false);
  const { importPrivateKey } = usePrivateKey();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const success = await importPrivateKey(values.privateKey, values.password);
      if (success) {
        // 清空表单（Formik 自动处理）
      }
    } catch (err) {
      Alert.alert('失败', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>导入 Solana 私钥</Title>
      <Formik
        initialValues={{ privateKey: '', password: '', confirmPassword: '' }}
        validationSchema={importKeySchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Solana 私钥（Base58）"
              value={values.privateKey}
              onChangeText={handleChange('privateKey')}
              onBlur={handleBlur('privateKey')}
              secureTextEntry
              style={styles.input}
              error={touched.privateKey && !!errors.privateKey}
            />

            <TextInput
              label="加密密码"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              style={styles.input}
              error={touched.password && !!errors.password}
            />

            <TextInput
              label="确认密码"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              secureTextEntry
              style={styles.input}
              error={touched.confirmPassword && !!errors.confirmPassword}
            />

            <Divider style={styles.divider} />

            <Button
              mode="contained"
              onPress={handleSubmit as () => void}
              loading={loading}
              style={styles.button}
            >
              导入并加密私钥
            </Button>

            <Text style={styles.hint}>
              提示：私钥将在本地AES加密存储，平台不会存储您的私钥或密码
            </Text>
          </View>
        )}
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
  form: {
    //todo gap: 15,
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

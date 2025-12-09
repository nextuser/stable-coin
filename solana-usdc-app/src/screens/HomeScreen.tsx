import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Title, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { usePrivateKey } from '../hooks/usePrivateKey';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { encryptedKey, walletAddress, logoutPrivateKey } = usePrivateKey();

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Solana USDC 稳定币交易平台</Title>

      <Card style={styles.card}>
        <Card.Content>
          {!encryptedKey ? (
            <View style={styles.noKeyContainer}>
              <Text style={styles.warning}>您尚未导入私钥，请先导入并加密存储</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ImportKey')}
                style={styles.button}
              >
                导入私钥
              </Button>
            </View>
          ) : (
            <View style={styles.hasKeyContainer}>
              <Text style={styles.label}>钱包地址：</Text>
              <Text style={styles.address}>{walletAddress || '未验证'}</Text>

              <Button
                mode="contained"
                onPress={() => navigation.navigate('Transaction')}
                style={styles.button}
              >
                发起 USDC 转账
              </Button>

              <Button
                mode="outlined"
                onPress={logoutPrivateKey}
                style={styles.logoutButton}
              >
                注销私钥
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    padding: 10,
  },
  noKeyContainer: {
    gap: 20,
  },
  hasKeyContainer: {
    gap: 15,
  },
  warning: {
    color: '#e67e22',
    textAlign: 'center',
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
  button: {
    marginTop: 10,
    padding: 5,
  },
  logoutButton: {
    marginTop: 10,
    padding: 5,
  },
});

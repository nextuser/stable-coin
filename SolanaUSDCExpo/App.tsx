import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import InitWalletScreen from './src/screens/InitWalletScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignTxScreen from './src/screens/SignTxScreen';
import { getPublicKey } from './src/crypto/wallet';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [walletInited, setWalletInited] = useState<boolean | null>(null);

  // 检查钱包状态
  useEffect(() => {
    const checkWallet = async () => {
      const pk = await getPublicKey();
      setWalletInited(!!pk);
    };
    checkWallet();
  }, []);

  if (walletInited === null) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={walletInited ? 'Home' : 'InitWallet'}>
        <Stack.Screen 
          name="InitWallet" 
          component={InitWalletScreen} 
          options={{ title: '创建钱包' }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'USDC 钱包' }} 
        />
        <Stack.Screen 
          name="SignTx" 
          component={SignTxScreen} 
          options={{ title: '交易签名' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;

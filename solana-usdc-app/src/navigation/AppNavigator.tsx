import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ImportKeyScreen } from '../screens/ImportKeyScreen';
import { TransactionScreen } from '../screens/TransactionScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Stack.Screen
          name="ImportKey"
          component={ImportKeyScreen}
          options={{ title: '导入私钥' }}
        />
        <Stack.Screen
          name="Transaction"
          component={TransactionScreen}
          options={{ title: 'USDC 转账' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

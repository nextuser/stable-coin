import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';

import { Buffer } from 'buffer';
import { registerRootComponent } from 'expo';

// 全局注册 Buffer
global.Buffer = global.Buffer || Buffer;

// 其他导入...

export default function App() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <AppNavigator />
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import { View, StyleSheet } from 'react-native';
import { PrivateKeyImport } from '../components/PrivateKeyImport';

export const ImportKeyScreen = () => {
  return (
    <View style={styles.container}>
      <PrivateKeyImport />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

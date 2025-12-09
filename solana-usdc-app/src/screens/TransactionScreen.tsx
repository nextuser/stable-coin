import { View, StyleSheet, ScrollView } from 'react-native';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionHistory } from '../components/TransactionHistory';

export const TransactionScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <TransactionForm />
      <TransactionHistory />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

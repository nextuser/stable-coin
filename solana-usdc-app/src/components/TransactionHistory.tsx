import { useEffect } from 'react';
import { View, StyleSheet, FlatList, Linking } from 'react-native';
import { Text, Title, Divider, ActivityIndicator, Card, Chip } from 'react-native-paper';
import { useTransaction } from '../hooks/useTransaction';
import { TransactionRecord } from '../types';

const renderItem = ({ item }: { item: TransactionRecord }) => (
  <Card style={styles.card} mode="outlined">
    <Card.Content>
      <View style={styles.row}>
        <Text style={styles.label}>交易ID：</Text>
        <Text 
          style={styles.link}
          onPress={() => Linking.openURL(`https://explorer.solana.com/tx/${item.txId}?cluster=devnet`)}
        >
          {item.txId.substring(0, 10)}...
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>转出地址：</Text>
        <Text style={styles.text}>{item.fromAddress.substring(0, 10)}...</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>转入地址：</Text>
        <Text style={styles.text}>{item.toAddress.substring(0, 10)}...</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>本金：</Text>
        <Text style={styles.text}>{item.amount} USDC</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>手续费：</Text>
        <Text style={styles.text}>{item.platformFee} USDC</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Gas费：</Text>
        <Text style={styles.text}>{item.gasFeeSol.toFixed(9)} SOL</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>状态：</Text>
        <Chip 
          style={{ backgroundColor: item.status === 'success' ? 'green' : 'red' }}
          textStyle={{ color: 'white' }}
        >
          {item.status === 'success' ? '成功' : '失败'}
        </Chip>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>时间：</Text>
        <Text style={styles.text}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </Card.Content>
  </Card>
);

export const TransactionHistory = () => {
  const { txRecords, loading, fetchTransactionRecords } = useTransaction();

  useEffect(() => {
    fetchTransactionRecords();
  }, [fetchTransactionRecords]);

  if (loading && txRecords.length === 0) {
    return <ActivityIndicator style={styles.loading} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>交易记录</Title>
      <Divider style={styles.divider} />

      {txRecords.length === 0 ? (
        <Text style={styles.empty}>暂无交易记录</Text>
      ) : (
        <FlatList
          data={txRecords}
          renderItem={renderItem}
          keyExtractor={(item) => item.txId}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <Divider style={styles.separator} />}
        />
      )}
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
    marginBottom: 10,
  },
  divider: {
    marginBottom: 20,
  },
  loading: {
    marginTop: 20,
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  list: {
  },
  card: {
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 80,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  link: {
    fontSize: 14,
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  separator: {
    marginVertical: 5,
  },
});

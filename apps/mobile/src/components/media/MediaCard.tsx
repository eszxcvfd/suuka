import { StyleSheet, Text, View } from 'react-native';

interface MediaCardProps {
  name: string;
  secureUrl: string;
}

export function MediaCard({ name, secureUrl }: MediaCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.url}>{secureUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: '#e2e8f0',
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  url: {
    color: '#64748b',
    fontSize: 12,
  },
});

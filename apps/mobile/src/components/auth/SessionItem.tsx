import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SessionInfo } from '../../services/auth.service';

interface SessionItemProps {
  onRevoke: (sessionId: string) => void;
  session: SessionInfo;
}

export function SessionItem({ session, onRevoke }: SessionItemProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{session.deviceLabel}</Text>
        <Text style={styles.subtitle}>Last activity: {new Date(session.lastActivityAt).toLocaleString()}</Text>
      </View>
      {session.isCurrent ? (
        <Text style={styles.currentLabel}>Current</Text>
      ) : (
        <Pressable
          style={styles.revokeButton}
          onPress={() => {
            onRevoke(session.id);
          }}
        >
          <Text style={styles.revokeText}>Revoke</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: '#e2e8f0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  currentLabel: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  revokeButton: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  revokeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    color: '#475569',
    fontSize: 11,
  },
  title: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
});

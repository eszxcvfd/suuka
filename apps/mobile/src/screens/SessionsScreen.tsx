import { useEffect, useMemo, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { SessionItem } from '../components/auth/SessionItem';
import { ApiClient } from '../services/api-client';
import { AuthService, SessionInfo } from '../services/auth.service';

const authService = new AuthService(new ApiClient());

export function SessionsScreen() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    void authService.listSessions().then(setSessions).catch(() => setSessions([]));
  }, []);

  const currentSession = useMemo(() => sessions.find((session) => session.isCurrent), [sessions]);

  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Active sessions</Text>
      <Button
        title="Revoke other sessions"
        onPress={() => {
          void authService
            .revokeOtherSessions(currentSession?.id)
            .then(() => authService.listSessions())
            .then(setSessions)
            .catch(() => setSessions([]));
        }}
      />
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionItem
            session={item}
            onRevoke={(sessionId) => {
              void authService
                .revokeSession(sessionId)
                .then(() => authService.listSessions())
                .then(setSessions)
                .catch(() => setSessions([]));
            }}
          />
        )}
      />
    </View>
  );
}

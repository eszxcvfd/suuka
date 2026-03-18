import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { ApiClient } from '../services/api-client';
import { AuthService } from '../services/auth.service';

const authService = new AuthService(new ApiClient());

export function ResetPasswordScreen() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Reset password</Text>
      <TextInput
        onChangeText={setToken}
        placeholder="Reset token"
        style={{ borderColor: '#cbd5e1', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 }}
        value={token}
      />
      <TextInput
        onChangeText={setNewPassword}
        placeholder="New password"
        secureTextEntry
        style={{ borderColor: '#cbd5e1', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 }}
        value={newPassword}
      />
      <Button
        title="Reset password"
        onPress={() => {
          void authService.passwordResetConfirm({ token, newPassword });
        }}
      />
    </View>
  );
}

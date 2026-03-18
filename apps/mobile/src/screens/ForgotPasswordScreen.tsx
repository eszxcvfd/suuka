import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { ApiClient } from '../services/api-client';
import { AuthService } from '../services/auth.service';

const authService = new AuthService(new ApiClient());

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Forgot password</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={{ borderColor: '#cbd5e1', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 }}
        value={email}
      />
      <Button
        title="Send reset link"
        onPress={() => {
          void authService.passwordResetRequest({ email });
        }}
      />
    </View>
  );
}

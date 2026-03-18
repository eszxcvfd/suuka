import { Text, View } from 'react-native';
import { SignUpForm } from '../components/auth/SignUpForm';
import { ApiClient } from '../services/api-client';
import { AuthService } from '../services/auth.service';

const authService = new AuthService(new ApiClient());

export function SignUpScreen() {
  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Create account</Text>
      <SignUpForm
        onSubmit={async (displayName, email, password) => {
          await authService.signUp({ displayName, email, password });
        }}
      />
    </View>
  );
}

import { Text, View } from 'react-native';
import { SignInForm } from '../components/auth/SignInForm';
import { ApiClient } from '../services/api-client';
import { AuthService } from '../services/auth.service';

const authService = new AuthService(new ApiClient());

export function SignInScreen() {
  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Sign in</Text>
      <SignInForm
        onSubmit={async (email, password) => {
          await authService.signIn({ email, password });
        }}
      />
    </View>
  );
}

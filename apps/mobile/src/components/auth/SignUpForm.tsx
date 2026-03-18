import { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

interface SignUpFormProps {
  onSubmit: (displayName: string, email: string, password: string) => Promise<void>;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={setDisplayName}
        placeholder="Display name"
        style={styles.input}
        value={displayName}
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Button title="Create account" onPress={() => void onSubmit(displayName, email, password)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: '100%',
  },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

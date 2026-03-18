import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SignInScreen } from './src/screens/SignInScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';

export default function App() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  return (
    <View style={styles.container}>
      {mode === 'signIn' ? <SignInScreen /> : <SignUpScreen />}
      <Pressable style={styles.switchButton} onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
        <Text style={styles.switchText}>
          {mode === 'signIn' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  switchButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  switchText: {
    color: '#334155',
    textDecorationLine: 'underline',
  },
});

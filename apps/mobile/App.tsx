import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SignInScreen } from './src/screens/SignInScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <SignInScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

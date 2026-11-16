import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>Ateş Pokédex</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8f1' },
  title: { color: '#291910', fontSize: 30, fontWeight: '800' },
});

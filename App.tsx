import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

type StackRoutes = { Tabs: undefined; Detail: { name: string } };
type TabRoutes = { List: undefined; Saved: undefined };

const Stack = createNativeStackNavigator<StackRoutes>();
const Tabs = createBottomTabNavigator<TabRoutes>();

function ListScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ateş türü Pokémon’lar</Text>
    </View>
  );
}

function SavedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.body}>Henüz kayıt yok.</Text>
    </View>
  );
}

function DetailScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Pokémon detayı</Text>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: '#a33a18' }}>
      <Tabs.Screen name="List" component={ListScreen} options={{ title: 'Liste', headerTitle: 'Ateş Pokédex' }} />
      <Tabs.Screen name="Saved" component={SavedScreen} options={{ title: 'Kaydedilenler' }} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detay' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: '#fff8f1' },
  title: { color: '#291910', fontSize: 26, fontWeight: '800' },
  body: { color: '#291910', fontSize: 16 },
});

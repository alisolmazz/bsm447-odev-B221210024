import { BottomTabScreenProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigationContainer } from '@react-navigation/native';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type StackRoutes = { Tabs: undefined; Detail: { name: string } };
type TabRoutes = { List: undefined; Saved: undefined };

const Stack = createNativeStackNavigator<StackRoutes>();
const Tabs = createBottomTabNavigator<TabRoutes>();

type Pokemon = { name: string; url: string };
type TypeResponse = { pokemon: { pokemon: Pokemon }[] };

type ListProps = CompositeScreenProps<
  BottomTabScreenProps<TabRoutes, 'List'>,
  NativeStackScreenProps<StackRoutes>
>;

function ListScreen({ navigation }: ListProps) {
  const [items, setItems] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filteredItems = items.filter((item) => item.name.toLowerCase().startsWith(query));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    async function loadPokemon() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/type/fire', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Pokémon listesi alınamadı');
        const data: TypeResponse = await response.json();
        if (!controller.signal.aborted) {
          setItems(data.pokemon.map((entry) => entry.pokemon));
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPokemon();
    return () => controller.abort();
  }, [attempt]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ateş türü Pokémon’lar</Text>
      <TextInput
        accessibilityLabel="Pokémon ara"
        placeholder="Pokémon ara"
        placeholderTextColor="#695249"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.search}
      />
      {loading ? (
        <ActivityIndicator accessibilityLabel="Liste yükleniyor" color="#a33a18" style={styles.status} />
      ) : error ? (
        <View style={styles.status}>
          <Text style={styles.body}>Pokémon listesi yüklenemedi.</Text>
          <Pressable accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={styles.retry}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.name}
          ListEmptyComponent={<Text style={styles.body}>Sonuç bulunamadı.</Text>}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Detail', { name: item.name })} style={styles.row}>
              <Text style={styles.body}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
            </Pressable>
          )}
        />
      )}
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

type PokemonDetail = {
  name: string;
  height: number;
  weight: number;
  sprites: { front_default: string | null };
};

function DetailScreen({ route }: NativeStackScreenProps<StackRoutes, 'Detail'>) {
  const { name } = route.params;
  const [result, setResult] = useState<{ name: string; data?: PokemonDetail; error?: boolean }>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setResult(undefined);

    async function loadDetail() {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('Pokémon detayı alınamadı');
        const data: PokemonDetail = await response.json();
        if (!controller.signal.aborted) setResult({ name, data });
      } catch {
        if (!controller.signal.aborted) setResult({ name, error: true });
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [name, attempt]);

  const current = result?.name === name ? result : undefined;
  const pokemon = current?.data;
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
      {current?.error ? (
        <View style={styles.status}>
          <Text style={styles.body}>Pokémon ayrıntıları yüklenemedi.</Text>
          <Pressable accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={styles.retry}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : pokemon ? (
        <>
          <View style={styles.portrait}>
            {pokemon.sprites.front_default ? (
              <Image
                accessibilityLabel={name}
                source={{ uri: pokemon.sprites.front_default }}
                style={styles.sprite}
              />
            ) : <Text style={styles.body}>Görsel bulunamadı.</Text>}
          </View>
          <View style={styles.measurements}>
            <Text style={styles.body}>Boy {(pokemon.height / 10).toLocaleString('tr-TR')} m</Text>
            <Text style={styles.body}>Ağırlık {(pokemon.weight / 10).toLocaleString('tr-TR')} kg</Text>
          </View>
        </>
      ) : <ActivityIndicator accessibilityLabel="Ayrıntılar yükleniyor" color="#a33a18" style={styles.status} />}
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
  title: { color: '#291910', fontSize: 26, fontWeight: '800', marginBottom: 16 },
  search: { minHeight: 48, borderWidth: 1, borderColor: '#e2cfc2', borderRadius: 12, paddingHorizontal: 14, marginBottom: 12, color: '#291910', fontSize: 16 },
  status: { marginTop: 24, alignItems: 'center' },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  retryText: { color: '#a33a18', fontWeight: '700' },
  row: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#e2cfc2', paddingVertical: 12 },
  portrait: { minHeight: 176, borderWidth: 1, borderColor: '#e2cfc2', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sprite: { width: 156, height: 156, resizeMode: 'contain' },
  measurements: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  body: { color: '#291910', fontSize: 16 },
});

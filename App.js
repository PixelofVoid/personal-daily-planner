import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, useColorScheme } from 'react-native';
import { enableScreens } from 'react-native-screens';

if (Platform.OS === 'web') {
  enableScreens(false);
}
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlannerProvider, usePlanner } from './src/store';
import { ThemeContext, resolveTheme } from './src/theme';
import { ConfirmProvider, Loading } from './src/ui';
import TodayScreen from './src/screens/TodayScreen';
import TasksScreen from './src/screens/TasksScreen';
import NotesScreen from './src/screens/NotesScreen';
import { PlansScreen, PlanDetailScreen } from './src/screens/PlansScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import { ShoppingScreen, ShoppingDetailScreen } from './src/screens/ShoppingScreen';
import SearchScreen from './src/screens/SearchScreen';
import MoreScreen from './src/screens/MoreScreen';

const Tab = createBottomTabNavigator();
const ShopStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false }}>
      <ShopStack.Screen name="ShoppingHome" component={ShoppingScreen} />
      <ShopStack.Screen name="ShoppingDetail" component={ShoppingDetailScreen} />
    </ShopStack.Navigator>
  );
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <MoreStack.Screen name="MoreHome" component={MoreScreen} />
      <MoreStack.Screen name="Plans" component={PlansScreen} />
      <MoreStack.Screen name="PlanDetail" component={PlanDetailScreen} />
      <MoreStack.Screen name="Goals" component={GoalsScreen} />
      <MoreStack.Screen name="Search" component={SearchScreen} />
    </MoreStack.Navigator>
  );
}

function Icon({ label, color }) {
  return <Text style={{ color, fontSize: 16, fontWeight: '700' }}>{label}</Text>;
}

function Root() {
  const system = useColorScheme();
  const insets = useSafeAreaInsets();
  const { ready, settings } = usePlanner();
  const colors = resolveTheme(settings.theme, system);
  const tabBottom = Math.max(insets.bottom, 12);

  if (!ready) return <Loading colors={colors} />;

  const navTheme = {
    ...(colors.name === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colors.name === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.tab,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <ThemeContext.Provider value={colors}>
      <ConfirmProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={colors.status} />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.muted,
            tabBarStyle: {
              backgroundColor: colors.tab,
              borderTopColor: colors.border,
              height: 56 + tabBottom,
              paddingTop: 6,
              paddingBottom: tabBottom,
            },
            tabBarSafeAreaInsets: { bottom: 0 },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="Today"
            component={TodayScreen}
            options={{ tabBarIcon: ({ color }) => <Icon label="◉" color={color} /> }}
          />
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ tabBarIcon: ({ color }) => <Icon label="✓" color={color} /> }}
          />
          <Tab.Screen
            name="Notes"
            component={NotesScreen}
            options={{ tabBarIcon: ({ color }) => <Icon label="✎" color={color} /> }}
          />
          <Tab.Screen
            name="Shop"
            component={ShopNavigator}
            options={{ tabBarIcon: ({ color }) => <Icon label="☰" color={color} /> }}
          />
          <Tab.Screen
            name="More"
            component={MoreNavigator}
            options={{ tabBarIcon: ({ color }) => <Icon label="···" color={color} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      </ConfirmProvider>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PlannerProvider>
        <Root />
      </PlannerProvider>
    </SafeAreaProvider>
  );
}

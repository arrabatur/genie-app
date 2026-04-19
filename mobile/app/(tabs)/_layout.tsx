import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import GenieFAB from '../../src/components/Genie/GenieFAB';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'play-circle' : 'play-circle-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 46, height: 46, borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: colors.primary, shadowOpacity: 0.5,
              shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
            }}>
              <Ionicons name="add" size={30} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="enfant"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 28 : 24 }}>🧒</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
    <GenieFAB />
    </View>
  );
}

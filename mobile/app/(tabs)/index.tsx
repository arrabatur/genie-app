import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { mockPosts } from '../../src/data/mockData';
import StoriesBar from '../../src/components/Feed/StoriesBar';
import PostCard from '../../src/components/Feed/PostCard';

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>👨‍👩‍👧‍👦 génie</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/enfant')}>
            <Text style={styles.enfantBtn}>🧒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={26} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/messages')}>
            <Ionicons name="paper-plane-outline" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={mockPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<StoriesBar />}
        renderItem={({ item }) => <PostCard post={item} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  logo: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 6 },
  headerBtn: { padding: 6 },
  separator: { height: 0.5, backgroundColor: colors.border },
  enfantBtn: { fontSize: 24 },
});

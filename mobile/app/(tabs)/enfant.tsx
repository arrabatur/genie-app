import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../../src/config/api';

const { width } = Dimensions.get('window');

const C = {
  bg:          '#FFF8F0',
  surface:     '#FFFFFF',
  border:      '#FFD8A8',
  primary:     '#FF8C42',
  primarySoft: '#FFF0E0',
  bubble:      '#E8F4FD',
  text:        '#2D2D2D',
  textMuted:   '#9E9E9E',
  send:        '#FF8C42',
};

const SUGGESTED = [
  'Pourquoi le ciel est bleu ? 🌤️',
  'Comment vivent les dinosaures ? 🦕',
  'Combien font 7 × 8 ? 🔢',
  'Pourquoi les étoiles brillent ? ⭐',
];

interface Msg { id: string; role: 'user' | 'assistant'; content: string; }

export default function EnfantScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const bounceAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { id: `u_${Date.now()}`, role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      const res = await fetch(API.enfant, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      const content = res.ok ? data.content : (data.error ?? 'Oups, erreur !');
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, role: 'assistant', content: "Oups, je suis un peu fatigué 😴 Réessaie !" },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.Text style={[styles.avatar, { transform: [{ scale: bounceAnim }] }]}>🌟</Animated.Text>
        <View>
          <Text style={styles.headerTitle}>Lumy</Text>
          <Text style={styles.headerSub}>Pose-moi n'importe quelle question !</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.welcome}>
            <Text style={styles.welcomeText}>Bonjour ! 👋 Je suis Lumy !</Text>
            <Text style={styles.welcomeSub}>Je connais plein de choses. Qu'est-ce que tu veux savoir ?</Text>
            <View style={styles.suggestGrid}>
              {SUGGESTED.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestBtn} onPress={() => send(s)} activeOpacity={0.7}>
                  <Text style={styles.suggestText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.row, item.role === 'user' ? styles.rowUser : styles.rowBot]}>
                {item.role === 'assistant' && <Text style={styles.botAvatar}>🌟</Text>}
                <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              isLoading ? (
                <View style={[styles.row, styles.rowBot]}>
                  <Text style={styles.botAvatar}>🌟</Text>
                  <View style={styles.bubbleBot}>
                    <Text style={styles.bubbleText}>Je réfléchis... ✨</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pose ta question ici... 🙋"
            placeholderTextColor={C.textMuted}
            multiline
            maxLength={300}
            onSubmitEditing={() => send(input)}
          />
          <TouchableOpacity
            onPress={() => send(input)}
            disabled={!input.trim() || isLoading}
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  avatar: { fontSize: 36 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 1 },

  welcome: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  welcomeText: { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  welcomeSub: { fontSize: 14, color: C.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  suggestGrid: { width: '100%', gap: 10 },
  suggestBtn: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1.5,
    borderColor: C.border, padding: 14,
  },
  suggestText: { fontSize: 14, color: C.text, fontWeight: '600' },

  list: { padding: 14, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5, gap: 8 },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  botAvatar: { fontSize: 24, marginBottom: 2 },
  bubble: { maxWidth: width * 0.72, borderRadius: 18, padding: 12, paddingHorizontal: 14 },
  bubbleUser: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: C.bubble, borderBottomLeftRadius: 4 },
  bubbleText: { color: C.text, fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: 'white' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  input: {
    flex: 1, backgroundColor: C.primarySoft, borderRadius: 22,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 10,
    color: C.text, fontSize: 15, maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.send, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});

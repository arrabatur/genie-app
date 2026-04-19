import { Platform } from 'react-native';

const BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:3001'
  : 'http://localhost:3001';

export const API = {
  base: BASE,
  posts: `${BASE}/api/posts`,
  users: `${BASE}/api/users`,
  stories: `${BASE}/api/stories`,
  conversations: (userId: string) => `${BASE}/api/conversations/${userId}`,
  messages: (convId: string) => `${BASE}/api/messages/${convId}`,
  genie: `${BASE}/api/genie/chat`,
  enfant: `${BASE}/api/enfant/chat`,
};

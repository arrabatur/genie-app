const users = [
  { id: 'me',  username: 'tom_g',        avatar: 'https://i.pravatar.cc/150?img=11', isOnline: true },
  { id: 'u1',  username: 'sarah_lm',     avatar: 'https://i.pravatar.cc/150?img=5',  isOnline: true },
  { id: 'u2',  username: 'alex_dev',     avatar: 'https://i.pravatar.cc/150?img=12', isOnline: false },
  { id: 'u3',  username: 'marie_photo',  avatar: 'https://i.pravatar.cc/150?img=9',  isOnline: true },
  { id: 'u4',  username: 'lucas_fit',    avatar: 'https://i.pravatar.cc/150?img=15', isOnline: false },
  { id: 'u5',  username: 'nina_art',     avatar: 'https://i.pravatar.cc/150?img=20', isOnline: true },
  { id: 'u6',  username: 'maxime_lr',    avatar: 'https://i.pravatar.cc/150?img=33', isOnline: false },
  { id: 'u7',  username: 'chloe_travel', avatar: 'https://i.pravatar.cc/150?img=25', isOnline: true },
];

const posts = Array.from({ length: 8 }, (_, i) => ({
  id: `p${i + 1}`,
  userId: users[(i % 7) + 1].id,
  imageUrl: `https://picsum.photos/seed/p${i + 1}/600/600`,
  caption: `Post ${i + 1} caption #genie`,
  likes: Math.floor(Math.random() * 10000),
  comments: Math.floor(Math.random() * 500),
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

const conversations = [
  { id: 'c1', participants: ['me', 'u1'], isGroup: false },
  { id: 'c2', participants: ['me', 'u2'], isGroup: false },
  { id: 'c3', participants: ['me', 'u3'], isGroup: false },
  { id: 'c4', participants: ['me', 'u1', 'u2', 'u5'], isGroup: true, name: 'Crew 🔥' },
  { id: 'c5', participants: ['me', 'u4'], isGroup: false },
  { id: 'c6', participants: ['me', 'u6'], isGroup: false },
];

const messages = {
  c1: [
    { id: 'm1_1', conversationId: 'c1', senderId: 'me',  content: 'Salut Sarah !', type: 'text', createdAt: new Date().toISOString(), read: true },
    { id: 'm1_2', conversationId: 'c1', senderId: 'u1',  content: 'Super bien merci !', type: 'text', createdAt: new Date().toISOString(), read: true },
    { id: 'm1_3', conversationId: 'c1', senderId: 'u1',  content: "T'as vu mon dernier post ? 😍", type: 'text', createdAt: new Date().toISOString(), read: false },
  ],
  c2: [
    { id: 'm2_1', conversationId: 'c2', senderId: 'u2', content: 'Yo, dispo pour se call ?', type: 'text', createdAt: new Date().toISOString(), read: true },
    { id: 'm2_2', conversationId: 'c2', senderId: 'me', content: 'Ouais, demain matin 👍', type: 'text', createdAt: new Date().toISOString(), read: true },
  ],
  c3: [],
  c4: [
    { id: 'm4_1', conversationId: 'c4', senderId: 'u1', content: 'Les gars on fait quoi ce soir ?', type: 'text', createdAt: new Date().toISOString(), read: false },
    { id: 'm4_2', conversationId: 'c4', senderId: 'u2', content: 'On se retrouve où ?', type: 'text', createdAt: new Date().toISOString(), read: false },
  ],
  c5: [],
  c6: [
    { id: 'm6_1', conversationId: 'c6', senderId: 'u6', content: 'Écoute ça 🎵🔥', type: 'text', createdAt: new Date().toISOString(), read: true },
  ],
};

module.exports = { users, posts, conversations, messages };

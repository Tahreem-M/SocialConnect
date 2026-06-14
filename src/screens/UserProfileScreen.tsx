import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface Post {
  id: string;
  text: string;
  likes: string[];
  commentsCount: number;
  createdAt: number;
}

const UserProfileScreen = ({ route, navigation }: any) => {
  const { userId, userEmail } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: userEmail,
    });
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(fetchedPosts);
    } catch (error) {
      console.log('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postText}>{item.text}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.footerText}>❤️ {item.likes?.length || 0}</Text>
        <Text style={styles.footerText}>💬 {item.commentsCount || 0}</Text>
        <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userEmail?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userEmail}>{userEmail}</Text>
        <Text style={styles.postCount}>{posts.length} Posts</Text>
      </View>

      {/* User Posts */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No posts yet 📭</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  profileHeader: { backgroundColor: '#fff', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  userEmail: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  postCount: { fontSize: 14, color: '#666' },
  postCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16, elevation: 2 },
  postText: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
  postFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, gap: 16, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 },
  timestamp: { color: '#999', fontSize: 12, marginLeft: 'auto' },
  emptyText: { color: '#999', fontSize: 15, textAlign: 'center' },
});

export default UserProfileScreen;
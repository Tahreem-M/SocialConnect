import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setPosts, toggleLike } from '../store/slices/postsSlice';

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .get();

      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      dispatch(setPosts(fetchedPosts));
    } catch (error) {
      console.log('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string, likes: string[]) => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const alreadyLiked = likes.includes(userId);
    const updatedLikes = alreadyLiked
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    dispatch(toggleLike({ postId, userId }));

    await firestore()
      .collection('posts')
      .doc(postId)
      .update({ likes: updatedLikes });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      {/* User info */}
      <TouchableOpacity
        onPress={() => navigation.navigate('UserProfile', { userId: item.userId, userEmail: item.userEmail })}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userEmail?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userEmail}>{item.userEmail}</Text>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Post text */}
      <Text style={styles.postText}>{item.text}</Text>

      {/* Post image if exists */}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}

      {/* Like and Comment buttons */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id, item.likes || [])}>
          <Text style={styles.actionText}>
            {item.likes?.includes(currentUser?.uid) ? '❤️' : '🤍'}{' '}
            {item.likes?.length || 0} Likes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Comments', { postId: item.id })}>
          <Text style={styles.actionText}>
            💬 {item.commentsCount || 0} Comments
          </Text>
        </TouchableOpacity>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Connect</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost', { onPostCreated: fetchPosts })}>
          <Text style={styles.createButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Feed */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchPosts();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No posts yet. Be the first to post! 🚀</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  createButton: { backgroundColor: '#6C63FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userEmail: { fontWeight: 'bold', color: '#1a1a2e', fontSize: 14 },
  timestamp: { color: '#999', fontSize: 12 },
  postText: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
  postImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, gap: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: '#666', fontSize: 14 },
  emptyText: { color: '#999', fontSize: 16, textAlign: 'center' },
});

export default HomeScreen;
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
import AnimatedLikeButton from '../components/AnimatedLikeButton';
import { useResponsive } from '../hooks/useResponsive';

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { wp, hp, moderateScale } = useResponsive();

  useEffect(() => {
    // Real-time listener for posts
    const unsubscribe = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const fetchedPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as any[];
          dispatch(setPosts(fetchedPosts));
          setLoading(false);
          setRefreshing(false);
        },
        error => {
          console.log('Error fetching posts:', error);
          setLoading(false);
        },
      );

    // Cleanup listener when screen unmounts
    return () => unsubscribe();
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
    <View style={[styles.postCard, { marginHorizontal: wp(3) }]}>
      {/* User info */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('UserProfile', {
            userId: item.userId,
            userEmail: item.userEmail,
          })
        }>
        <View style={styles.postHeader}>
          <View style={[styles.avatar, { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20) }]}>
            <Text style={[styles.avatarText, { fontSize: moderateScale(16) }]}>
              {item.userEmail?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.userEmail, { fontSize: moderateScale(14) }]}>
              {item.userEmail}
            </Text>
            <Text style={[styles.timestamp, { fontSize: moderateScale(11) }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Post text */}
      <Text style={[styles.postText, { fontSize: moderateScale(15) }]}>
        {item.text}
      </Text>

      {/* Post image */}
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.postImage, { height: hp(25) }]}
        />
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <AnimatedLikeButton
          liked={item.likes?.includes(currentUser?.uid)}
          likesCount={item.likes?.length || 0}
          onPress={() => handleLike(item.id, item.likes || [])}
        />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Comments', { postId: item.id })
          }>
          <Text style={[styles.actionText, { fontSize: moderateScale(14) }]}>
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
        <Text style={[styles.headerTitle, { fontSize: moderateScale(20) }]}>
          Social Connect
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            navigation.navigate('CreatePost')
          }>
          <Text style={[styles.createButtonText, { fontSize: moderateScale(14) }]}>
            + Post
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Feed */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No posts yet. Be the first to post! 🚀
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
  headerTitle: { fontWeight: 'bold', color: '#1a1a2e' },
  createButton: { backgroundColor: '#6C63FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', marginTop: 12, borderRadius: 12, padding: 16, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  userEmail: { fontWeight: 'bold', color: '#1a1a2e' },
  timestamp: { color: '#999' },
  postText: { color: '#333', lineHeight: 22, marginBottom: 12 },
  postImage: { width: '100%', borderRadius: 8, marginBottom: 12 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, gap: 16, alignItems: 'center' },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: '#666' },
  emptyText: { color: '#999', fontSize: 16, textAlign: 'center' },
});

export default HomeScreen;
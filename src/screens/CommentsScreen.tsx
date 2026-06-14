import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  text: string;
  createdAt: number;
}

const CommentsScreen = ({ route, navigation }: any) => {
  const { postId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const fetchComments = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .orderBy('createdAt', 'asc')
        .get();

      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      setComments(fetchedComments);
    } catch (error) {
      console.log('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: true, title: 'Comments' });
    fetchComments();
  }, []);

  const handleAddComment = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please write a comment!');
      return;
    }

    if (!currentUser) return;

    setPosting(true);

    try {
      // Add comment to subcollection
      await firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .add({
          userId: currentUser.uid,
          userEmail: currentUser.email,
          text: text.trim(),
          createdAt: Date.now(),
        });

      // Update comments count on post
      await firestore()
        .collection('posts')
        .doc(postId)
        .update({
          commentsCount: firestore.FieldValue.increment(1),
        });

      setText('');
      fetchComments();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.userEmail?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.userEmail}>{item.userEmail}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>

      {/* Comments List */}
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderComment}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No comments yet. Be the first! 💬</Text>
          </View>
        }
      />

      {/* Comment Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, posting && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={posting}>
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  commentCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, marginHorizontal: 12, marginTop: 8, borderRadius: 12, elevation: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  commentContent: { flex: 1 },
  userEmail: { fontWeight: 'bold', color: '#1a1a2e', fontSize: 13 },
  commentText: { color: '#333', fontSize: 14, marginTop: 2, lineHeight: 20 },
  timestamp: { color: '#999', fontSize: 11, marginTop: 4 },
  emptyText: { color: '#999', fontSize: 15, textAlign: 'center' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, backgroundColor: '#f9f9f9', maxHeight: 100 },
  sendButton: { backgroundColor: '#6C63FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendButtonDisabled: { backgroundColor: '#aaa' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default CommentsScreen;
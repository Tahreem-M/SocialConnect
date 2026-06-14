import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { launchImageLibrary } from 'react-native-image-picker';

const CreatePostScreen = ({ navigation, route }: any) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setImage(response.assets[0].uri);
      }
    });
  };

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please write something to post!');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to post!');
      return;
    }

    setLoading(true);

    try {
      await firestore().collection('posts').add({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        text: text.trim(),
        imageUrl: image || null,
        likes: [],
        commentsCount: 0,
        createdAt: Date.now(),
      });

      Alert.alert('Success', 'Post created successfully!');
      navigation.goBack();

      // Refresh posts on home screen
      if (route.params?.onPostCreated) {
        route.params.onPostCreated();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* User info */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userEmail}>{currentUser?.email}</Text>
      </View>

      {/* Text input */}
      <TextInput
        style={styles.textInput}
        placeholder="What's on your mind?"
        placeholderTextColor="#999"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        autoFocus
      />

      {/* Selected image preview */}
      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImage(null)}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add image button */}
      <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
        <Text style={styles.addImageText}>📷 Add Photo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cancelText: { color: '#6C63FF', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  postButton: { backgroundColor: '#6C63FF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postButtonDisabled: { backgroundColor: '#aaa' },
  postButtonText: { color: '#fff', fontWeight: 'bold' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  userEmail: { fontWeight: 'bold', color: '#1a1a2e', fontSize: 15 },
  textInput: { fontSize: 16, color: '#333', padding: 16, minHeight: 150, lineHeight: 24 },
  imagePreviewContainer: { margin: 16, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12 },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  removeImageText: { color: '#fff', fontSize: 14 },
  addImageButton: { margin: 16, padding: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, borderStyle: 'dashed', alignItems: 'center' },
  addImageText: { color: '#6C63FF', fontSize: 15 },
});

export default CreatePostScreen;
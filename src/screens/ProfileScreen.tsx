import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearUser } from '../store/slices/authSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      const doc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      if (doc.exists) {
        const data = doc.data();
        setName(data?.name || '');
        setBio(data?.bio || '');
        setPhoto(data?.photoUrl || null);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    } finally {
      setFetching(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setPhoto(response.assets[0].uri);
      }
    });
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .set({
          name,
          bio,
          photoUrl: photo || null,
          email: currentUser.email,
          updatedAt: Date.now(),
        });
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await auth().signOut();
          dispatch(clearUser());
        },
      },
    ]);
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile 👤</Text>

      <TouchableOpacity onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.emailText}>{currentUser?.email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Write a short bio..."
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={saveProfile}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 24, alignSelf: 'flex-start' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarInitial: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  changePhotoText: { color: '#6C63FF', textAlign: 'center', marginBottom: 8 },
  emailText: { color: '#999', fontSize: 14, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16, backgroundColor: '#f9f9f9', width: '100%' },
  bioInput: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 10, alignItems: 'center', width: '100%', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  signOutButton: { marginTop: 16, padding: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#ff4444', borderRadius: 10 },
  signOutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
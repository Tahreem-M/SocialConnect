import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setPhoto(response.assets[0].uri);
      }
    });
  };

  const saveProfile = () => {
    alert('Profile saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile 👤</Text>

      <TouchableOpacity onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>Tap to add{'\n'}photo</Text>
          </View>
        )}
      </TouchableOpacity>

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

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 24, alignSelf: 'flex-start' },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 24 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  avatarText: { color: '#999', fontSize: 13, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16, backgroundColor: '#f9f9f9', width: '100%' },
  bioInput: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 10, alignItems: 'center', width: '100%', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import { useResponsive } from '../hooks/useResponsive';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const { moderateScale } = useResponsive();

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

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: moderateScale(24) }]}>
        Settings ⚙️
      </Text>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.settingValue}>{currentUser?.email}</Text>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ddd', true: '#6C63FF' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Developer</Text>
          <Text style={styles.settingValue}>DevelopersHub</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontWeight: 'bold', color: '#1a1a2e', marginBottom: 24 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#6C63FF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingLabel: { fontSize: 15, color: '#333' },
  settingValue: { fontSize: 14, color: '#999' },
  signOutButton: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444', elevation: 2 },
  signOutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 16 },
});

export default SettingsScreen;
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

// Request permission for notifications
export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted');
    await saveFCMToken();
  }
};

// Save FCM token to Firestore
export const saveFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

// Save token linked to user
export const saveUserFCMToken = async (userId: string) => {
  try {
    const token = await messaging().getToken();
    await firestore().collection('users').doc(userId).update({
      fcmToken: token,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.log('Error saving FCM token:', error);
  }
};

// Listen for foreground notifications
export const setupForegroundNotifications = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);
  });
  return unsubscribe;
};
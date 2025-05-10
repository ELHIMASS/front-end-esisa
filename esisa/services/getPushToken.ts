import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function getPushToken(userId?: string): Promise<string | undefined> {
  if (!Device.isDevice) {
    alert('Doit être utilisé sur un vrai appareil.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permissions de notification refusées.');
    return;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
        projectId: "esisa-f4de8",
        applicationId: "1:610607814395:web:5b7649fd86fbda66c0c25e" // ⚠️ souvent le même que projectId
      })
      
  ).data;
  console.log('📲 Token push Expo:', token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (userId) {
    try {
      await fetch('http://192.168.100.219:5000/api/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });
      console.log('✅ Token envoyé au backend');
    } catch (err) {
      console.error('❌ Erreur d’envoi du token :', err);
    }
  }

  return token;
}

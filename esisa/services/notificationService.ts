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

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('📲 Token push Expo:', token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  // 👇 Envoie le token au backend si l'utilisateur est connecté
  if (userId) {
    try {
      await fetch('http://192.168.100.219:5000/api/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, token }),
      });
      console.log('✅ Token envoyé au serveur');
    } catch (error) {
      console.error('❌ Erreur envoi token serveur:', error);
    }
  }

  return token;
}

const fetch = require("node-fetch");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function sendPushNotification(tokens, message) {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    console.warn("Aucun token à envoyer");
    return;
  }

  const notifications = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title: '📢 Nouveau message ESISA',
    body: message,
    data: { message },
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications),
    });

    const data = await response.json();
    console.log("✅ Notifications envoyées :", data);
  } catch (err) {
    console.error("❌ Erreur d'envoi notification :", err);
  }
}

module.exports = { sendPushNotification };


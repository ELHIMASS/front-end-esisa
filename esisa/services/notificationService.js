const fetch = require("node-fetch");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function sendPushNotification(tokens, message) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
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

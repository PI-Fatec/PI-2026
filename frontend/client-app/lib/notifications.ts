import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D8DE8',
      });
    }

    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;

    if (status !== 'granted') {
      const request = await Notifications.requestPermissionsAsync();
      status = request.status;
    }

    return status === 'granted';
  } catch (error) {
    console.warn('Falha ao solicitar permissao de notificacao.', error);
    return false;
  }
}

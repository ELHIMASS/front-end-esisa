import { io } from 'socket.io-client';
import config from '../../config';

const socket = io(config.API_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
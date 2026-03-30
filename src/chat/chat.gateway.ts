import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

interface User {
  id: string;
  name: string;
}

@WebSocketGateway(4000, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private users: User[] = [];

  // This gives access to the server for emitting to everyone
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const name = (client.handshake.query.name as string)?.trim();
    if (!name) {
      client.disconnect(true);
      return;
    }

    this.users.push({ id: client.id, name });

    // Notify everyone else
    client.broadcast.emit('user-joined', { name, message: `${name} has joined the chat` });

    // Send updated online count to all
    this.server.emit('online-count', this.users.length);

    console.log('Client connected:', client.id, name);
  }

  handleDisconnect(client: Socket) {
    const index = this.users.findIndex(u => u.id === client.id);
    if (index !== -1) {
      const name = this.users[index].name;
      this.users.splice(index, 1);

      client.broadcast.emit('user-left', `${name} has left the chat`);
      this.server.emit('online-count', this.users.length);
      console.log('Client disconnected:', client.id, name);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
    const user = this.users.find(u => u.id === client.id);
    if (!user) return;

    // Send to everyone except sender
    client.broadcast.emit('conversation', { name: user.name, message });

    // Return to sender so they also see their own name
    return { name: user.name, message };
  }
}
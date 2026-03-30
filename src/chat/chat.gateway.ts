import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(4000, { cors: {} })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }


  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // constructor(private readonly chatService: ChatService) {}

  // You can uncomment later when needed for rooms / global emit
  // @WebSocketServer() server: Server;

  @SubscribeMessage('events')
  handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ) {
    console.log(data);

    // sends to everyone EXCEPT sender
    client.broadcast.emit('events', data);
  }
}
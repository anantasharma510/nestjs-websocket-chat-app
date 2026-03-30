import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket ,Server } from 'socket.io';


@WebSocketGateway(4000,{cors:{}})
export class ChatGateway {
  // constructor(private readonly chatService: ChatService) {}
@WebSocketServer() server:Server;
@SubscribeMessage('events')
handleEvent(@ConnectedSocket() client:Socket,@MessageBody()data:string){
  console.log(data);
this.server.emit('events','This is a reply');

}

}

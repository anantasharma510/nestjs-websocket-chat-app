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


interface User {
  id:string;
  name:string;
}
@WebSocketGateway(4000, { cors: {} })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private users : User[]=[];




  handleConnection(client: Socket) {
    const name = client.handshake.query.name as string || 'Unknown';
    this.users.push({id:client.id,name});
    client.broadcast.emit("user-joined", {id:client.id,name,message: `${name} has joined the chat`});

    console.log('Client connected:', client.id);
  }


  handleDisconnect(client: Socket) {
    const obj =  this.users.find((u)=> u.id === client.id);
    const index = this.users.findIndex((u)=> u.id === client.id);
    client.broadcast.emit("user-left", `{obj?.name} has left the chat`);
    if(index !== -1){
      this.users.splice(index,1);
    }
    client.broadcast.emit("stopped-typing", this.users.length);
    return true;
    console.log('Client disconnected:', client.id);
  }


  @SubscribeMessage('message')
  handleEvent(@ConnectedSocket() client:Socket, @MessageBody() message: string) {
    client.broadcast.emit("conversation",{name:this.users.find((u)=> u.id === client.id)?.name,message});
    return message; 
  }

  // constructor(private readonly chatService: ChatService) {}

  // You can uncomment later when needed for rooms / global emit
  // @WebSocketServer() server: Server;

  // @SubscribeMessage('events')
  // handleEvent(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: string,
  // ) {
  //   console.log(data);

  //   // sends to everyone EXCEPT sender
  //   client.broadcast.emit('events', data);
  // }
}
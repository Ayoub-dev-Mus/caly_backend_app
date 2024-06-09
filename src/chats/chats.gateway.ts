import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: '/chats' })
export class ChatsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.join(roomId); 
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.leave(roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { roomId: string, message: string }, @ConnectedSocket() client: Socket) {
    client.to(data.roomId).emit('newMessage', data.message);
  }
}

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { Types } from 'mongoose';

@WebSocketGateway({ namespace: '/chats' })
export class ChatsGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users = new Map<string, string>();

  constructor(private readonly chatsService: ChatsService) { }

  afterInit() {
    console.log('WebSocket initialized');
  }

  handleDisconnect(client: Socket) {
    this.users.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.users.delete(userId);
      }
    });
  }


  @SubscribeMessage('register')
  async handleRegister(@MessageBody() data: { userId: string | number | Types.ObjectId, storeId: number }, @ConnectedSocket() client: Socket) {
    try {
      let storeId;
      let userId;

      storeId = data.storeId;
      if (typeof data.userId === 'string' || typeof data.userId === 'number') {
        userId = new Types.ObjectId(data.userId);
      } else if (data.userId instanceof Types.ObjectId) {
        userId = data.userId;
      }

      this.users.set(userId.toString(), client.id);
      client.emit('registerSuccess', { message: 'Registration successful', userId });


      const messages = await this.chatsService.findAllByStore(storeId);
      client.emit('messageHistory', messages);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { storeId: number, senderId: string | Types.ObjectId, receiverId: string | Types.ObjectId, message: string }, @ConnectedSocket() client: Socket) {
    try {
      let { storeId, senderId, receiverId } = data;



      if (!(senderId instanceof Types.ObjectId)) {
        senderId = new Types.ObjectId(senderId);
      }

      if (!(receiverId instanceof Types.ObjectId)) {
        receiverId = new Types.ObjectId(receiverId);
      }

      const receiverSocketId = this.users.get(receiverId.toString());
      if (receiverSocketId) {
        const chatDto = {
          store: storeId,
          sender: senderId,
          receiver: receiverId,
          message: data.message,
        };
        await this.chatsService.create(chatDto);

        this.server.to(receiverSocketId).emit('newMessage', { senderId: senderId.toString(), message: data.message });
      } else {
        client.emit('error', { message: 'User not online' });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

}

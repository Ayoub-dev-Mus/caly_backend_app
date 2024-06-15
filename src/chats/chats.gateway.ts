import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { Types } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';

interface ChatRoom {
  roomId: string;
  users: string[]; // User IDs
}

@WebSocketGateway({ namespace: '/chats' })
export class ChatsGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users = new Map<string, string>();
  private rooms = new Map<string, ChatRoom>(); // Map to store chat rooms

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


      userId = data.userId;


      this.users.set(userId.toString(), client.id);
      client.emit('registerSuccess', { message: 'Registration successful', userId });

      const rooms = await this.chatsService.findRoomsByUserId(userId); // Fetch existing chat rooms for the user
      client.emit('rooms', rooms); // Send existing rooms to the client
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() data: { userId: string, otherUserId: string }, @ConnectedSocket() client: Socket) {
    try {
      const { userId, otherUserId } = data;
      const roomId = userId + '-' + otherUserId;

      // Check if the room already exists
      if (!this.rooms.has(roomId)) {
        // Create a new room
        const room: ChatRoom = {
          roomId,
          users: [userId, otherUserId]
        };
        this.rooms.set(roomId, room);
        client.emit('roomCreated', { roomId });
      } else {
        client.emit('error', { message: 'Room already exists' });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: CreateChatDto, @ConnectedSocket() client: Socket) {
    try {
      const { roomId, senderId, message } = data;

      // Check if the room exists
      if (this.rooms.has(roomId)) {
        // Broadcast message to all users in the room
        const room = this.rooms.get(roomId);
        room.users.forEach(userId => {
          const socketId = this.users.get(userId);
          if (socketId) {
            this.server.to(socketId).emit('newMessage', { senderId, message });
          }
        });

        // Save the chat message to the database
        await this.chatsService.create(data); // Assuming create method of ChatsService accepts CreateChatDto directly
      } else {
        client.emit('error', { message: 'Room does not exist' });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}

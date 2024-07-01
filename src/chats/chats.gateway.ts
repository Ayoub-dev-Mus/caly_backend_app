import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './chats.service';
import { User } from 'src/users/entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { GetUser } from '../common/jwtMiddlware';
import { RoomsService } from './room.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private userSocketMap = new Map<string, { socket: Socket, user: User }>(); // Map to store user/socket pairs

  constructor(
    private messagesService: MessagesService,
    private roomsService: RoomsService,
  ) { }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const token = client.handshake.query.token;
    if (typeof token === 'string') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload & User;
        const user: User = decoded as User;
        this.userSocketMap.set(user.id, { socket: client, user });
        console.log(`User connected: ${user.id}, Socket ID: ${client.id}`);
      } catch (error) {
        console.error('Invalid token:', error);
        client.disconnect();
      }
    } else {
      console.log('No token provided, disconnecting client');
      client.disconnect();
    }
  }


  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.removeUserSocketMapping(client.id);
  }

  private removeUserSocketMapping(socketId: string) {
    const userId = this.getUserIdFromSocket(socketId);
    if (userId) {

      this.userSocketMap.delete(userId);
      console.log(`Removed mapping for user: ${userId}, Socket ID: ${socketId}`);
    }
  }

  private getUserIdFromSocket(socketId: string): string | undefined {
    const userId = Array.from(this.userSocketMap.entries())
      .find(([_, { socket }]) => socket.id === socketId)?.[0];
    console.log(`Get user ID from socket: ${socketId}, User ID: ${userId}`);
    return userId;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomParticipants: string[]) {

    console.log(`Client ${client.id} joining room with participants: ${roomParticipants}`);

    const userId = this.getUserIdFromSocket(client.id);
    if (!userId) {
      console.error(`User not authenticated for client ${client.id}`);
      throw new Error('User not authenticated');
    }

    const roomId = await this.roomsService.createRoom(roomParticipants);

    console.log("my room is " + roomId)


    console.log(roomId)
    client.join(roomId);
    const messages = await this.messagesService.findByRoom(roomId);

    client.emit('previousMessages', messages);
    console.log(`Client ${client.id} joined room: ${roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    console.log(`Client ${client.id} leaving room: ${roomId}`);
    client.leave(roomId);
    console.log(`Client ${client.id} left room: ${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: { receiverId: string, content: string }) {
    console.log(`Received sendMessage from client ${client.id} with payload:`, payload);

    const userId = this.getUserIdFromSocket(client.id);
    if (!userId) {
      console.error(`User not authenticated for client ${client.id}`);
      throw new Error('User not authenticated');
    }

    const sender = this.userSocketMap.get(userId).user;

    if (!payload.receiverId || !payload.content) {
      console.error(`Invalid message payload from client ${client.id}`);
      throw new Error('Invalid message payload');
    }

    // Assuming the room for these participants already exists or will be created
    const roomId = await this.roomsService.createRoom([userId, payload.receiverId]);

    // Check if the sender is already joined to the room
    if (!client.rooms.has(roomId)) {
      console.log(`Client ${client.id} is not in room ${roomId}. Joining the room...`);
      client.join(roomId);
    }

    const message = await this.messagesService.create(roomId, sender.id, payload.receiverId, payload.content);
    console.log(`Message created: ${message.id}, Content: ${message.content}`);

    const receiverSocket = this.userSocketMap.get(payload.receiverId);
    if (receiverSocket) {
      receiverSocket.socket.emit('message', { sender: sender.firstName, content: message.content });
      console.log(`Message sent to receiver: ${payload.receiverId}, Content: ${message.content}`);
    } else {
      await this.messagesService.storeMessage(message);
      console.log(`Receiver ${payload.receiverId} not connected. Message stored.`);
    }
  }

}

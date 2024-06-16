import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './chats.service';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from '../common/jwtMiddlware';


@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private userSocketMap = new Map<string, Socket>(); // Map to store user/socket pairs

  constructor(
    private messagesService: MessagesService,
  ) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user/socket mapping when a user disconnects
    this.removeUserSocketMapping(client.id);
  }

  private removeUserSocketMapping(socketId: string) {
    const userId = this.getUserIdFromSocket(socketId);
    if (userId) {
      this.userSocketMap.delete(userId);
    }
  }

  private getUserIdFromSocket(socketId: string): string | undefined {
    return Array.from(this.userSocketMap.entries())
      .find(([_, socket]) => socket.id === socketId)?.[0];
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    const messages = await this.messagesService.findByRoom(roomId);
    client.emit('previousMessages', messages);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@GetUser() sender: User, @ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string, receiverId: string, content: string }) {
    // Check if payload contains the required fields
    if (!payload.roomId || !payload.receiverId || !payload.content) {
      throw "error"
    }

    // Create the message using actual sender and receiver IDs
    const message = await this.messagesService.create(payload.roomId, "1", payload.receiverId, payload.content);

    // Get the receiver's socket based on the receiverId
    const receiverSocket = this.userSocketMap.get(payload.receiverId);
    if (receiverSocket) {
      receiverSocket.emit('message', { sender: "karim", content: message.content });
    } else {
      // If the receiver is not connected, store the message in the database
      await this.messagesService.storeMessage(message);
    }
  }

}

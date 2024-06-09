import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: '/chats' })
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  handleConnection(socket: Socket): void {
    console.log(`Client connected: ${socket.id}`);
  }

  @SubscribeMessage('joinPrivateRoom')
  async handleJoinPrivateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string, salonId: string }
  ): Promise<void> {
    const isSameSalon = await this.checkSameSalonStaff(client.id, data.otherUserId, data.salonId);
    if (isSameSalon) {
      const roomId = this.getRoomId(client.id, data.otherUserId);
      client.join(roomId);
      console.log(`${client.id} joined private room with ${data.otherUserId}. The room is ${roomId}`);
    } else {
      console.log(`Users ${client.id} and ${data.otherUserId} do not belong to the same salon staff.`);
    }
  }

  @SubscribeMessage('newMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string, message: string }
  ): void {
    const roomId = this.getRoomId(client.id, data.otherUserId);
    this.emitToRoom(roomId, 'newMessage', { senderId: client.id, message: data.message });
    console.log(`Message sent from ${client.id} to room ${roomId}: ${data.message}`);
  }

  getRoomId(userId1: string, userId2: string): string {
    return `private_room_${[userId1, userId2].sort().join('_')}`;
  }

  emitToRoom(roomId: string, event: string, payload: any): void {
    this.server.to(roomId).emit(event, payload);
  }

  async checkSameSalonStaff(userId1: string, userId2: string, salonId: string): Promise<boolean> {
    // Replace this with actual logic to check if both users belong to the same salon staff.
    // For example, you might query your database to verify this.
    // Here's a placeholder implementation:
    const usersBelongToSameSalon = true; // Replace this with actual verification logic.

    return usersBelongToSameSalon;
  }
}

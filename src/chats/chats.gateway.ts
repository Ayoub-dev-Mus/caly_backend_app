// src/chats/chats.gateway.ts
import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  handleConnection(socket: Socket): void {
  }

  @SubscribeMessage('joinSalon')
  handleJoinSalon(
    @ConnectedSocket() client: Socket,
    @MessageBody() salonId: string
  ): void {
    client.join(salonId);
  }

  emit(event: string, payload: any): void {
    this.server.emit(event, payload);
  }

  emitToSalon(salonId: string, event: string, payload: any): void {
    this.server.to(salonId).emit(event, payload);
  }
}

// notification.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketGateway } from 'src/socket/socket.gateway';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer() server: Socket;

  constructor(private readonly socketGateway: SocketGateway) {}

  emitToClient(event: string, data: any) {
    this.socketGateway.emit(event, data);

    return data;
  }
}

// notification.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketGateway } from 'src/socket/socket.gateway';
import { NotificationsService } from './notifications.service';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer() server: Socket;

  constructor(
    private readonly socketGateway: SocketGateway,
    private notificationService: NotificationsService,
  ) {}

  emitToClient(event: string, data: any) {
    this.socketGateway.emit(event, data);
    return data;
  }

  async handleConnection() {
    const notifications = await this.notificationService.findAll();
    this.socketGateway.emit('all-notification', notifications);
  }
}

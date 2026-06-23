import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Server, Socket } from 'socket.io';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true },
  namespace: '/ws',
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ConversationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.['token'] as string | undefined) ??
        (client.handshake.headers['authorization'] as string | undefined)?.replace(/^Bearer /, '');
      if (!token) {
        client.emit('error', { message: 'Missing auth token' });
        client.disconnect(true);
        return;
      }
      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret'),
      });
      (client.data as { user?: AuthenticatedUser }).user = payload;
      await client.join(`org:${payload.organizationId}`);
      this.logger.log(`Client ${client.id} connected org=${payload.organizationId}`);
    } catch (err) {
      this.logger.warn(`Socket auth failed: ${(err as Error).message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ): Promise<{ success: boolean }> {
    const user = (client.data as { user?: AuthenticatedUser }).user;
    if (!user || !body?.conversationId) return { success: false };
    await client.join(`conv:${body.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('leave')
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ): Promise<{ success: boolean }> {
    await client.leave(`conv:${body?.conversationId ?? ''}`);
    return { success: true };
  }

  emitNewMessage(organizationId: string, conversationId: string, message: unknown): void {
    this.server.to(`org:${organizationId}`).emit('conversation:message', { conversationId, message });
    this.server.to(`conv:${conversationId}`).emit('conversation:message', message);
  }

  emitConversationUpdate(organizationId: string, conversationId: string, conversation: unknown): void {
    this.server.to(`org:${organizationId}`).emit('conversation:updated', { conversationId, conversation });
  }
}
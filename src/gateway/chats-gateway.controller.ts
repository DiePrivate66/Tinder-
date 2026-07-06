import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { SendChatMessageDto } from '../chat/dto/send-chat-message.dto';
import { StartConversationDto } from '../chat/dto/start-conversation.dto';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';

interface WithUserId<TDto = undefined> {
  userId: number;
  dto?: TDto;
}

interface WithConversationAccess {
  userId: number;
  conversationId: number;
}

@UseGuards(GatewayJwtAuthGuard)
@Controller('chats')
export class ChatsGatewayController {
  constructor(private readonly rpc: CoreRpcService) {}

  @Get()
  listMyConversations(@CurrentUser() user: AuthUser) {
    return this.rpc.send(RpcPatterns.chat.listConversationsByUserId, user.userId);
  }

  @Post()
  createConversation(
    @CurrentUser() user: AuthUser,
    @Body() dto: StartConversationDto,
  ) {
    const payload: WithUserId<StartConversationDto> = {
      userId: user.userId,
      dto,
    };
    return this.rpc.send(RpcPatterns.chat.createConversation, payload);
  }

  @Get(':conversationId/messages')
  listMessagesByConversation(
    @CurrentUser() user: AuthUser,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const payload: WithConversationAccess = {
      userId: user.userId,
      conversationId,
    };
    return this.rpc.send(RpcPatterns.chat.listMessagesByConversation, payload);
  }

  @Post(':conversationId/messages')
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() dto: SendChatMessageDto,
  ) {
    const payload: WithUserId<SendChatMessageDto & { conversationId: number }> = {
      userId: user.userId,
      dto: {
        conversationId,
        body: dto.body,
      },
    };
    return this.rpc.send(RpcPatterns.chat.sendMessage, payload);
  }
}

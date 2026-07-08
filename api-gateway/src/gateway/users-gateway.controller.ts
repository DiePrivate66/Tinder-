import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { Permissions } from '../auth/rbac.constants';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { AddPhotoDto } from '../users/dto/add-photo.dto';
import { SetInterestsDto } from '../users/dto/set-interests.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';
import { GatewayPermissionsGuard } from './gateway-permissions.guard';

interface WithUserId<TDto = undefined> {
  userId: number;
  dto?: TDto;
}

@Controller('users')
export class UsersGatewayController {
  constructor(private readonly rpc: CoreRpcService) {}

  @UseGuards(GatewayJwtAuthGuard, GatewayPermissionsGuard)
  @RequirePermissions(Permissions.usersList)
  @Get()
  findAll() {
    return this.rpc.send(RpcPatterns.users.findAll, {});
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@CurrentUser() user: AuthUser) {
    const payload: WithUserId = { userId: user.userId };
    return this.rpc.send(RpcPatterns.users.getMyProfile, payload);
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    const payload: WithUserId<UpdateProfileDto> = {
      userId: user.userId,
      dto,
    };
    return this.rpc.send(RpcPatterns.users.updateMyProfile, payload);
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Post('me/photos')
  addMyPhoto(@CurrentUser() user: AuthUser, @Body() dto: AddPhotoDto) {
    const payload: WithUserId<AddPhotoDto> = {
      userId: user.userId,
      dto,
    };
    return this.rpc.send(RpcPatterns.users.addMyPhoto, payload);
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Delete('me/photos/:photoId')
  removeMyPhoto(
    @CurrentUser() user: AuthUser,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    const payload: WithUserId<{ photoId: number }> = {
      userId: user.userId,
      dto: { photoId },
    };
    return this.rpc.send(RpcPatterns.users.removeMyPhoto, payload);
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Post('me/interests')
  setMyInterests(@CurrentUser() user: AuthUser, @Body() dto: SetInterestsDto) {
    const payload: WithUserId<SetInterestsDto> = {
      userId: user.userId,
      dto,
    };
    return this.rpc.send(RpcPatterns.users.setMyInterests, payload);
  }
}

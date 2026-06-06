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
import { RpcPatterns } from '../contracts/rpc-patterns';
import { AddPhotoDto } from '../users/dto/add-photo.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SetInterestsDto } from '../users/dto/set-interests.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';
import { GatewayPermissionsGuard } from './gateway-permissions.guard';
import { RequirePermissions } from './require-permissions.decorator';

@Controller('users')
export class UsersGatewayController {
  constructor(private readonly rpc: CoreRpcService) {}

  @UseGuards(GatewayJwtAuthGuard, GatewayPermissionsGuard)
  @RequirePermissions(Permissions.usersList)
  @Get()
  findAll() {
    return this.rpc.send(RpcPatterns.users.findAll, {});
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.rpc.send(RpcPatterns.users.create, dto);
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.rpc.send(RpcPatterns.users.getMyProfile, { userId: user.userId });
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.rpc.send(RpcPatterns.users.updateMyProfile, {
      userId: user.userId,
      dto,
    });
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Post('me/photos')
  addMyPhoto(@CurrentUser() user: AuthUser, @Body() dto: AddPhotoDto) {
    return this.rpc.send(RpcPatterns.users.addMyPhoto, {
      userId: user.userId,
      dto,
    });
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Delete('me/photos/:photoId')
  removeMyPhoto(
    @CurrentUser() user: AuthUser,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.rpc.send(RpcPatterns.users.removeMyPhoto, {
      userId: user.userId,
      dto: { photoId },
    });
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Post('me/interests')
  setMyInterests(@CurrentUser() user: AuthUser, @Body() dto: SetInterestsDto) {
    return this.rpc.send(RpcPatterns.users.setMyInterests, {
      userId: user.userId,
      dto,
    });
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.rpc.send(RpcPatterns.users.getById, id);
  }
}

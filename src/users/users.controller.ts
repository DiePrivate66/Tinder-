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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/rbac.constants';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { AddPhotoDto } from './dto/add-photo.dto';
import { SetInterestsDto } from './dto/set-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permissions.usersList)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfileById(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/photos')
  addMyPhoto(@CurrentUser() user: AuthUser, @Body() dto: AddPhotoDto) {
    return this.usersService.addPhoto(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/photos/:photoId')
  removeMyPhoto(
    @CurrentUser() user: AuthUser,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.usersService.removePhoto(user.userId, photoId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/interests')
  setMyInterests(@CurrentUser() user: AuthUser, @Body() dto: SetInterestsDto) {
    return this.usersService.setInterests(user.userId, dto);
  }
}

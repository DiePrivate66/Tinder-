import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { AddPhotoDto } from './dto/add-photo.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SetInterestsDto } from './dto/set-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

interface WithUserId<TDto = undefined> {
  userId: number;
  dto?: TDto;
}

@Controller()
export class UsersMessageController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(RpcPatterns.users.findAll)
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern(RpcPatterns.users.create)
  create(@Payload() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @MessagePattern(RpcPatterns.users.findByEmailForAuth)
  findByEmailForAuth(@Payload() email: string) {
    return this.usersService.findByEmailForAuth(email);
  }

  @MessagePattern(RpcPatterns.users.getById)
  getById(@Payload() id: number) {
    return this.usersService.findById(id);
  }

  @MessagePattern(RpcPatterns.users.getMyProfile)
  getMyProfile(@Payload() payload: WithUserId) {
    return this.usersService.getProfileById(payload.userId);
  }

  @MessagePattern(RpcPatterns.users.updateMyProfile)
  updateMyProfile(@Payload() payload: WithUserId<UpdateProfileDto>) {
    return this.usersService.updateProfile(payload.userId, payload.dto ?? {});
  }

  @MessagePattern(RpcPatterns.users.addMyPhoto)
  addMyPhoto(@Payload() payload: WithUserId<AddPhotoDto>) {
    if (!payload.dto) {
      throw new Error('Photo payload is required');
    }

    return this.usersService.addPhoto(payload.userId, payload.dto);
  }

  @MessagePattern(RpcPatterns.users.removeMyPhoto)
  removeMyPhoto(@Payload() payload: WithUserId<{ photoId: number }>) {
    const photoId = payload.dto?.photoId;
    if (photoId === undefined) {
      throw new Error('photoId is required');
    }

    return this.usersService.removePhoto(payload.userId, photoId);
  }

  @MessagePattern(RpcPatterns.users.setMyInterests)
  setMyInterests(@Payload() payload: WithUserId<SetInterestsDto>) {
    if (!payload.dto) {
      throw new Error('Interests payload is required');
    }

    return this.usersService.setInterests(payload.userId, payload.dto);
  }
}

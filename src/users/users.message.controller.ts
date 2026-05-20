import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { UsersService } from './users.service';
import { AddPhotoDto } from './dto/add-photo.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SetInterestsDto } from './dto/set-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface WithUserId<T = unknown> {
  userId: number;
  dto?: T;
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
    return this.usersService.addPhoto(payload.userId, payload.dto as AddPhotoDto);
  }

  @MessagePattern(RpcPatterns.users.removeMyPhoto)
  removeMyPhoto(@Payload() payload: WithUserId<{ photoId: number }>) {
    return this.usersService.removePhoto(payload.userId, payload.dto?.photoId ?? 0);
  }

  @MessagePattern(RpcPatterns.users.setMyInterests)
  setMyInterests(@Payload() payload: WithUserId<SetInterestsDto>) {
    return this.usersService.setInterests(
      payload.userId,
      payload.dto as SetInterestsDto,
    );
  }
}

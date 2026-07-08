import { IsInt, Min } from 'class-validator';

export class StartConversationDto {
  @IsInt()
  @Min(1)
  counterpartUserId: number;
}

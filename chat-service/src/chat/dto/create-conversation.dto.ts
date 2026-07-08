import { IsInt, Min } from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  @Min(1)
  participantAId: number;

  @IsInt()
  @Min(1)
  participantBId: number;
}

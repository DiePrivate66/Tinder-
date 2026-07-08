import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @Min(1)
  conversationId: number;

  @IsInt()
  @Min(1)
  senderUserId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  body: string;
}

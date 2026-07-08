import { IsInt, Min } from 'class-validator';

export class CreateMatchDto {
  @IsInt()
  @Min(1)
  userAId!: number;

  @IsInt()
  @Min(1)
  userBId!: number;
}

import { IsInt, Min } from 'class-validator';

export class StartMatchDto {
  @IsInt()
  @Min(1)
  counterpartUserId: number;
}

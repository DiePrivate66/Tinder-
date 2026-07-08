import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class AddPhotoDto {
  @IsUrl({ require_tld: false })
  url!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

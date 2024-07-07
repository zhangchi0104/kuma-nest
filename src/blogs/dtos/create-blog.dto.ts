import { Type } from 'class-transformer';
import { IsObject, IsString, MinLength, ValidateNested } from 'class-validator';
import { CreateMetadataDto } from './create-metadata.dto';

export class CreateBlogDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateMetadataDto)
  metadata: CreateMetadataDto;

  @IsString()
  @MinLength(1)
  content: string;
}

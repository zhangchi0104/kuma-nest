import { Type } from 'class-transformer';
import { IsObject, IsString, MinLength, ValidateNested } from 'class-validator';
import { CreateMetadataDto } from './create-metadata.dto';
import { LanguageRequiredDto } from 'src/dtos/language.dto';

export class CreateBlogDto extends LanguageRequiredDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateMetadataDto)
  metadata: CreateMetadataDto;

  @IsString()
  @MinLength(1)
  content: string;
}

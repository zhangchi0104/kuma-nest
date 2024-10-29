import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LanguageRequiredDto } from 'src/dtos/language.dto';

export class CreateMetadataDto extends LanguageRequiredDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(20, {
    each: true,
  })
  tags: string[] = [];

  createdAt: string = new Date().toISOString();
}

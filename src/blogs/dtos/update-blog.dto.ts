import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { LanguageRequiredDto } from 'src/dtos/language.dto';

export class UpdateBlogContentDto extends LanguageRequiredDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  content: string;
}

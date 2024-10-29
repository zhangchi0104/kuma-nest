import { IsEnum, IsNotEmpty } from 'class-validator';
import { SupportedLanguages } from 'src/utils/type.util';

export class LanguageRequiredDto {
  @IsNotEmpty()
  @IsEnum(SupportedLanguages)
  languageCode: SupportedLanguages;
}

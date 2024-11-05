import { $Enums } from '@prisma/client';
import { IsIn, IsNotEmpty } from 'class-validator';

export class LanguageRequiredDto {
  @IsNotEmpty()
  @IsIn(['ZH_CN', 'EN_US'])
  languageCode: $Enums.LanguageCodes;
}

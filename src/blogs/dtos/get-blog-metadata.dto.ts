import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LanguageRequiredDto } from 'src/dtos/language.dto';

export class GetBlogMetadataDto extends LanguageRequiredDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  public readonly pageSize?: number;

  @IsString()
  @IsOptional()
  public readonly cursor?: string;
}

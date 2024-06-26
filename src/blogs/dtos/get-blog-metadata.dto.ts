import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetBlogMetadataDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  public readonly pageSize?: number;

  @IsString()
  @IsOptional()
  public readonly cursor?: string;
}

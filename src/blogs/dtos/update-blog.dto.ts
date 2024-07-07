import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateBlogContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  content: string;
}

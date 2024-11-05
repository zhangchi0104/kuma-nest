export interface BlogMetadata {
  Title: string;
  LanguageCode: string;
  BlogId: string;
  Description?: string;
  Tags: string[];
  CreatedAtUtc: string;
  UpdatedAtUtc?: string;
  IsDeleted?: boolean;
  DeletedAtUtc?: string;
}

export type BlogMetadataPrimaryKey = Pick<
  BlogMetadata,
  'BlogId' | 'LanguageCode'
>;

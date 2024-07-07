export interface BlogMetadata {
  title: string;
  PostId: string;
  description?: string;
  tags: string[];
  publishedAtUtc: string;
  updatedAtUtc?: string;
  isDeleted: boolean;
}

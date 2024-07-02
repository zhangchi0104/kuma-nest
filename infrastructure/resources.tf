resource "aws_s3_bucket" "blog_content_bucket" {
  bucket = local.blog_content_bucket
}

resource "aws_s3_bucket" "blog_assets_bucket" {
  bucket = local.blog_assets_bucket
}

resource "aws_s3_bucket_public_access_block" "blog_assets_bucket" {
  bucket                  = aws_s3_bucket.blog_assets_bucket.bucket
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "blog_metadata" {
  name         = local.blog_metadata_table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PostId"
  attribute {
    name = "PostId"
    type = "S"
  }
}


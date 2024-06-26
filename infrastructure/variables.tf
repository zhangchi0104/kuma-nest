variable "env_name" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "ap-southeast-2"
}

variable "blog_aseets_bucket_basename" {
  type    = string
  default = "alexz-blog-assets"
}

variable "blog_content_bucket_basename" {
  type    = string
  default = "alexz-blog-content"
}

variable "blog_metadata_table_basename" {
  type    = string
  default = "blog-metadata"
}

variable "lambda_execution_role_basename" {
  type    = string
  default = "blog-lambda-execution-role"
}

variable "gateway_domain" {
  type    = string
  default = "blog-lambda-policy"
}

variable "jwt_public_key" {
  type = string
}

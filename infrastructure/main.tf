data "aws_caller_identity" "current" {}
locals {
  blog_content_bucket        = format("%s-%s", var.blog_content_bucket_basename, var.env_name)
  blog_assets_bucket         = format("%s-%s", var.blog_aseets_bucket_basename, var.env_name)
  blog_metadata_table        = format("%s-%s", var.blog_metadata_table_basename, var.env_name)
  lambda_execution_role_name = "${var.lambda_execution_role_basename}-${var.env_name}"
  aws_profile                = format("blog-%s", var.env_name)
  account_id                 = data.aws_caller_identity.current.account_id
  lambda_name                = "blog-main-${var.env_name}"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  backend "s3" {
    bucket         = "terraform-state-blog-alexz"
    dynamodb_table = "terraform-state-lock-blog-alexz"
    key            = "blog-alexz"
    region         = "ap-southeast-2"
  }
}

provider "aws" {
  region = var.aws_region
}

resource "null_resource" "build_backend" {
  triggers = {
    bundle_hash = data.archive_file.lambda.output_base64sha256
  }

  provisioner "local-exec" {
    command = "yarn build:serverless"
  }
}

data "archive_file" "lambda" {

  type        = "zip"
  output_path = "dist.zip"
  source_dir  = "../dist"
}

resource "aws_lambda_function" "blog_main" {
  filename         = "dist.zip"
  function_name    = local.lambda_name
  role             = aws_iam_role.blog_main_exec_role.arn
  source_code_hash = data.archive_file.lambda.output_base64sha256
  handler          = "dist/index.handler"
  runtime          = "nodejs18.x"
  environment {
    variables = {
      BLOG_ASSETS_BUCKET  = local.blog_assets_bucket
      BLOG_CONTENT_BUCKET = local.blog_content_bucket
      BLOG_METADATA_TABLE = local.blog_metadata_table
      JWT_PUBLIC_KEY      = var.jwt_public_key
    }
  }
}

output "aws_region" {
  value = var.aws_region
}

output "lambda_info" {
  value = {
    arn     = aws_lambda_function.blog_main.arn
    runtime = aws_lambda_function.blog_main.runtime
    file    = aws_lambda_function.blog_main.filename
  }
}

output "assets_bucket" {
  value = {
    arn  = aws_s3_bucket.blog_assets_bucket.arn
    name = aws_s3_bucket.blog_assets_bucket.bucket
  }
}

output "content_bucket" {
  value = {
    arn  = aws_s3_bucket.blog_content_bucket.arn
    name = aws_s3_bucket.blog_content_bucket.bucket
  }
}

output "metadata_table" {
  value = {
    name = aws_dynamodb_table.blog_metadata.name
    arn  = aws_dynamodb_table.blog_metadata.arn
  }
}

output "api_gateway_url" {
  value = {
    execution_url = aws_api_gateway_deployment.blog_api_deployment.invoke_url
    custom_domain = aws_api_gateway_domain_name.blog_gateway_domain.domain_name
  }
}

output "deployment_roles" {
  value = {
    prod = aws_iam_role.blog_ci["prod"].arn
    dev  = aws_iam_role.blog_ci["dev"].arn
  }
}
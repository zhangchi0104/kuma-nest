resource "aws_iam_role" "blog_main_exec_role" {
  name = "lambda_exec_role-${var.env_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}


data "aws_iam_policy_document" "blog_lambda_policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${local.account_id}:log-group:/aws/lambda/${local.lambda_name}:*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.blog_assets_bucket.arn,
      aws_s3_bucket.blog_content_bucket.arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      aws_s3_bucket.blog_assets_bucket.arn,
      aws_s3_bucket.blog_content_bucket.arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query",
    ]
    resources = [
      aws_dynamodb_table.blog_metadata.arn
    ]
  }
}

resource "aws_iam_policy" "blog_lambda_policy" {
  name   = "blog-lambda-policy-${var.env_name}"
  policy = data.aws_iam_policy_document.blog_lambda_policy.json
}


resource "aws_iam_role_policy_attachment" "blog_main_policy_attachment" {
  role       = aws_iam_role.blog_main_exec_role.name
  policy_arn = aws_iam_policy.blog_lambda_policy.arn
}

data "aws_iam_policy_document" "blog_ci" {
  for_each = toset(["dev", "prod"])
  statement {
    actions = [
      "s3:*",
    ]
    resources = [
      "arn:aws:s3:::${var.blog_aseets_bucket_basename}-${each.value}",
      "arn:aws:s3:::${var.blog_content_bucket_basename}-${each.value}",
      "arn:aws:s3:::${var.blog_aseets_bucket_basename}-${each.value}/*",
      "arn:aws:s3:::${var.blog_content_bucket_basename}-${each.value}/*"
    ]
  }

  statement {
    actions = [
      "dynamodb:*",
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${local.account_id}:table/${var.blog_metadata_table_basename}-${each.value}",
      "arn:aws:dynamodb:${var.aws_region}:${local.account_id}:table/${var.blog_metadata_table_basename}-${each.value}/*"
    ]
  }

  statement {
    actions = [
      "apigateway:*",
    ]
    resources = [
      "arn:aws:apigateway:${var.aws_region}::/restapis/*",
      "arn:aws:apigateway:${var.aws_region}::/restapis/*/stages/*"

    ]

  }
}

resource "aws_iam_policy" "blog_ci" {
  for_each    = toset(["dev", "prod"])
  name        = "BlogDeployment-${each.value}"
  description = "Policy for Blog Deployment CI/CD"
  policy      = data.aws_iam_policy_document.blog_ci[each.key].json
}

data "aws_iam_policy" "managed_route53_admin" {
  provider = aws
  name     = "AmazonRoute53FullAccess"
}

data "aws_iam_policy" "cert_manager_admin" {
  provider = aws
  name     = "AWSCertificateManagerFullAccess"
}

data "aws_iam_policy" "lambda_admin" {
  provider = aws
  name     = "AWSLambda_FullAccess"
}


resource "aws_iam_role" "blog_ci" {
  for_each = toset(["dev", "prod"])
  name     = "BlogDeployment-${each.value}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          AWS = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
        }
      }
    ]
  })

}

resource "aws_iam_role_policy_attachment" "blog_ci_cert_manager" {
  for_each   = toset(["dev", "prod"])
  role       = aws_iam_role.blog_ci[each.key].name
  policy_arn = data.aws_iam_policy.cert_manager_admin.arn
}

resource "aws_iam_role_policy_attachment" "blog_ci_route53_admin" {
  for_each   = toset(["dev", "prod"])
  role       = aws_iam_role.blog_ci[each.key].name
  policy_arn = data.aws_iam_policy.managed_route53_admin.arn
}

resource "aws_iam_role_policy_attachment" "blog_ci_lambda_admin" {
  for_each   = toset(["dev", "prod"])
  role       = aws_iam_role.blog_ci[each.key].name
  policy_arn = data.aws_iam_policy.lambda_admin.arn
}

resource "aws_iam_role_policy_attachment" "blog_ci_resources" {
  for_each   = toset(["dev", "prod"])
  role       = aws_iam_role.blog_ci[each.key].name
  policy_arn = aws_iam_policy.blog_ci[each.key].arn
}
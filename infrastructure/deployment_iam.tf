locals {
  state_key      = "blog-alexz"
  state_dynamodb = "terraform-state-lock-blog-alexz"
}
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
      "arn:aws:apigateway:${var.aws_region}::/restapis/*/stages/*",
      "arn:aws:apigateway:${var.aws_region}::/domainnames/*.api.chiz.dev",
      "arn:aws:apigateway:${var.aws_region}::/domainnames/*.api.chiz.dev/*"
    ]
  }

  statement {
    actions = [
      "iam:CreateRole",
      "iam:CreateOpenIDConnectProvider",
      "iam:DeleteRole",
      "iam:DeleteOpenIDConnectProvider",
      "iam:AttachRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:DetachRolePolicy",
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:PutRolePolicy",
      "iam:CreatePolicyVersion",
    ]
    resources = [
      "arn:aws:iam::${local.account_id}:role/Blog*",
      "arn:aws:iam::${local.account_id}:role/blog*",
      "arn:aws:iam::${local.account_id}:role/lambda*",
      "arn:aws:iam::${local.account_id}:policy/blog*",
      "arn:aws:iam::${local.account_id}:policy/Blog*",
      "arn:aws:iam::${local.account_id}:policy/lambda*"
    ]
  }
}

data "aws_iam_policy_document" "tf_state" {
  statement {
    actions = [
      "s3:List*",
      "s3:Get*",
      "s3:Describe*"
    ]
    resources = [
      aws_s3_bucket.tf_state.arn,
    ]
  }
  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.tf_state.arn}/${local.state_key}",
    ]
  }
  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
      "dynamodb:DescribeContinuousBackups",
      "dynamodb:DescribeTimeToLive",
      "dynamodb:ListTagsOfResource",
    ]
    resources = [
      "arn:aws:dynamodb:*:*:table/${local.state_dynamodb}"
    ]
  }

}

resource "aws_iam_policy" "blog_ci" {
  for_each    = toset(["dev", "prod"])
  name        = "BlogDeployment-${each.value}"
  description = "Policy for Blog Deployment CI/CD"
  policy      = data.aws_iam_policy_document.blog_ci[each.key].json
}
resource "aws_iam_policy" "tf_state" {
  name        = "TerraformBlogStatePolicy"
  description = "Policy for Terraform state"
  policy      = data.aws_iam_policy_document.tf_state.json
}

data "aws_iam_policy" "managed_iam_read_only" {
  provider = aws
  name     = "IAMReadOnlyAccess"
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
      # Allowing github actions to assume this role
      {
        Action = "sts:AssumeRoleWithWebIdentity",
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${local.github_token_domain}"
        }
        Condition = {
          StringEquals = {
            "${local.github_token_domain}:aud" : "${local.audience}"
          }
          StringLike = {
            "${local.github_token_domain}:sub" = "repo:zhangchi0104/kuma-nest:environment:${var.env_name == "prod" ? "main" : var.env_name}"
          }
        }
      },
      # Allowing the account root user to assume this role
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Sid    = "",
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
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

resource "aws_iam_role_policy_attachment" "blog_ci_iam_read_only" {
  for_each   = toset(["dev", "prod"])
  role       = aws_iam_role.blog_ci[each.key].name
  policy_arn = data.aws_iam_policy.managed_iam_read_only.arn
}

resource "aws_iam_role_policy_attachment" "blog_tf_state" {
  for_each   = toset(["dev", "prod"])
  role       = aws_iam_role.blog_ci[each.key].name
  policy_arn = aws_iam_policy.tf_state.arn
}


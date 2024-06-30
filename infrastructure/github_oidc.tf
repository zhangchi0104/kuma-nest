locals {
  github_token_domain = "token.actions.githubusercontent.com"
  audience            = "sts.amazonaws.com"
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://${local.github_token_domain}"
  client_id_list = [
    local.audience
  ]
  thumbprint_list = [
    "ffffffffffffffffffffffffffffffffffffffff"
  ]
}

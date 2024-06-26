locals {
  gateway_name = "blog_main_api-${var.env_name}"
}
resource "aws_api_gateway_rest_api" "blog_main_gateway" {
  name = local.gateway_name
}

# {proxy+}
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.blog_main_gateway.id
  parent_id   = aws_api_gateway_rest_api.blog_main_gateway.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.blog_main_gateway.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  depends_on = [
    aws_lambda_function.blog_main,
    aws_api_gateway_method.proxy,
    aws_api_gateway_rest_api.blog_main_gateway
  ]
  rest_api_id             = aws_api_gateway_rest_api.blog_main_gateway.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.blog_main.invoke_arn
}

resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.blog_main_gateway.id
  resource_id   = aws_api_gateway_rest_api.blog_main_gateway.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  depends_on = [
    aws_api_gateway_method.proxy_root,
    aws_api_gateway_rest_api.blog_main_gateway,
    aws_lambda_function.blog_main,
  ]
  rest_api_id             = aws_api_gateway_rest_api.blog_main_gateway.id
  resource_id             = aws_api_gateway_method.proxy_root.resource_id
  http_method             = aws_api_gateway_method.proxy_root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.blog_main.invoke_arn
}

resource "aws_api_gateway_deployment" "blog_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.blog_main_gateway.id

  triggers = {
    redployment = sha1(jsonencode([
      aws_api_gateway_method.proxy.id,
      aws_api_gateway_method.proxy_root.id,
      aws_api_gateway_integration.lambda_integration.id,
      aws_api_gateway_integration.lambda_root.id,
      aws_api_gateway_resource.proxy.id,
    ]))
  }
  lifecycle {
    create_before_destroy = true
  }
  stage_name = var.env_name
}
resource "aws_api_gateway_stage" "blog_stage" {
  count         = var.env_name == "dev" ? 0 : 1
  deployment_id = aws_api_gateway_deployment.blog_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.blog_main_gateway.id
  stage_name    = var.env_name

}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.blog_main.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_rest_api.blog_main_gateway.execution_arn}/*/*"
}

# resource "aws_api_gateway_domain_name" "blog_domain" {
#   domain_name = "${var.env_name}.${var.gateway_domain}"
#   endpoint_configuration {
#     types = ["REGIONAL"]
#   }
# }

# resource "aws_api_gateway_base_path_mapping" "lambda_domain_mapping" {
#   api_id = aws_api_gateway_rest_api.blog_main_gateway.id
#   stage_name = aws_api_gateway_deployment.blog_api_deployment.stage_name
#   domain_name = aws_api_gateway_domain_name.blog_domain.domain_name
#   base_path = "v1"
# }


resource "aws_acm_certificate" "wildcard_api_chiz_dev" {
  domain_name       = "*.api.chiz.dev"
  validation_method = "DNS"
}

resource "aws_route53_zone" "api_chiz_dev" {
  name = "api.chiz.dev"
}


resource "aws_route53_record" "api_chiz_dev_cert" {
  for_each = {
    for dvo in aws_acm_certificate.wildcard_api_chiz_dev.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.api_chiz_dev.zone_id
}

resource "aws_acm_certificate_validation" "example" {
  depends_on = [
    aws_route53_record.api_chiz_dev_cert
  ]
  certificate_arn         = aws_acm_certificate.wildcard_api_chiz_dev.arn
  validation_record_fqdns = [for record in aws_route53_record.api_chiz_dev_cert : record.fqdn]
}

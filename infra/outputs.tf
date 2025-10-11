/*  Outputs for infrastructure resources:
    - api_url: The endpoint URL for the deployed AWS API Gateway HTTP API.
    - cognito_issuer: The issuer URL for the AWS Cognito User Pool domain, used for authentication flows.
    - cognito_client_id: The client ID for the AWS Cognito User Pool client application.
    - cloudfront_domain: The domain name of the AWS CloudFront distribution serving the site.
    - s3_bucket: The name of the AWS S3 bucket hosting the static site assets.
*/
output "api_url" {
  value = aws_apigatewayv2_api.http.api_endpoint
}
output "cognito_issuer" {
  value = "https://${aws_cognito_user_pool_domain.domain.domain}.auth.${var.region}.amazoncognito.com"
}
output "cognito_client_id" {
  value = aws_cognito_user_pool_client.app.id
}
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.cdn.domain_name
}
output "s3_bucket" {
  value = aws_s3_bucket.site.bucket
}

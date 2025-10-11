/* main.tf
* VPC - KMS - Aurora Serverless v2 (Data API)
* Cognito - API Gateway (HTTP API + JWT)
* Lambda (FastAPI via Mangum) - S3 + CloudFront (OAC)
*/

// We’ll use AZs for multi-AZ networking
data "aws_availability_zones" "available" {}

// Naming / Tagging
locals {
  // Base name used across resources: e.g., "appstack-prod"
  name = "${var.project}-${var.env}"

  // Common tags for hygiene and cost allocation
  tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "Terraform"
  }
}

/* VPC (2 public + 2 private subnets)
* - Private subnets host Aurora
* - NAT lets private subnet resources reach the internet (patching, DNS)
*/
resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = merge(local.tags, { Name = "${local.name}-vpc" })
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.this.id
  tags   = merge(local.tags, { Name = "${local.name}-igw" })
}

// Public subnets (2 AZs)
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.0.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  tags                    = merge(local.tags, { Name = "${local.name}-public-a" })
}
resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true
  tags                    = merge(local.tags, { Name = "${local.name}-public-b" })
}

// Public route table with default route to IGW
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  tags   = merge(local.tags, { Name = "${local.name}-rtb-public" })
}
resource "aws_route" "public_inet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}
resource "aws_route_table_association" "pub_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "pub_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

// NAT (so private subnets can reach out)
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = merge(local.tags, { Name = "${local.name}-eip-nat" })
}
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags          = merge(local.tags, { Name = "${local.name}-nat" })
}

// Private subnets (for Aurora)
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]
  tags              = merge(local.tags, { Name = "${local.name}-private-a" })
}
resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]
  tags              = merge(local.tags, { Name = "${local.name}-private-b" })
}

// Private route table with NAT default route
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id
  tags   = merge(local.tags, { Name = "${local.name}-rtb-private" })
}
resource "aws_route" "priv_nat" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id
}
resource "aws_route_table_association" "priv_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}
resource "aws_route_table_association" "priv_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}

// KMS Keys (DB + S3)
resource "aws_kms_key" "db" {
  description             = "${local.name} db kms"
  deletion_window_in_days = 7
  tags                    = local.tags
}

resource "aws_kms_key" "s3" {
  description             = "${local.name} s3 kms"
  deletion_window_in_days = 7
  tags                    = local.tags

  # REVIEW: Will likely need an explicit key policy statement to allow
  # CloudFront (service principal) to decrypt when reading from S3 with OAC.
  # See: docs.aws.amazon.com/AmazonCloudFront/... OAC + SSE-KMS example.
  # You can add a policy JSON here referencing your distribution ID after creation.
}

/* Aurora Serverless v2 (PostgreSQL) + Secrets
* - Engine mode "provisioned" with instance_class "db.serverless"
* - Data API: enable_http_endpoint = true (IMPORTANT)
*   (Supported for Aurora PostgreSQL Serverless v2 / provisioned in many regions)
*/
resource "aws_db_subnet_group" "aurora" {
  name       = "${local.name}-dbsubnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = merge(local.tags, { Name = "${local.name}-dbsubnet" })
}

resource "random_password" "db" {
  length  = 24
  special = true
}

resource "aws_secretsmanager_secret" "db" {
  name       = "${local.name}/db-credentials"
  kms_key_id = aws_kms_key.db.arn
  tags       = local.tags
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = "appuser",
    password = random_password.db.result
  })
}

// SG for Aurora — allow internal VPC connections on 5432
resource "aws_security_group" "aurora" {
  name        = "${local.name}-aurora-sg"
  description = "Aurora access"
  vpc_id      = aws_vpc.this.id
  tags        = local.tags

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Restrict further if you know the client SGs
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_rds_cluster" "aurora" {
  engine          = var.db_engine         # e.g., "aurora-postgresql"
  engine_version  = var.db_engine_version # e.g., "15"
  database_name   = var.db_name
  master_username = "appuser"
  master_password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.aurora.id]

  storage_encrypted = true
  kms_key_id        = aws_kms_key.db.arn

  deletion_protection     = false
  backup_retention_period = 7
  apply_immediately       = true

  // Serverless v2 uses engine_mode=provisioned + instance_class=db.serverless
  engine_mode = "provisioned"
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 4
  }

  // >>> CRITICAL FOR RDS DATA API <<<
  enable_http_endpoint = true # allows HTTPS SQL calls via rds-data (Data API)
  // (Supported on Aurora Postgres v2/provisioned in many regions)
  tags = local.tags
}

resource "aws_rds_cluster_instance" "aurora_instances" {
  count               = 1
  identifier          = "${local.name}-db-${count.index}"
  cluster_identifier  = aws_rds_cluster.aurora.id
  instance_class      = "db.serverless"
  engine              = var.db_engine
  engine_version      = var.db_engine_version
  publicly_accessible = false
  tags                = local.tags
}

// NOTE: In older examples you might see "aws_rds_cluster_role_association"
// for S3 import/export or other features. It's NOT required just to use the Data API.

// Cognito (User Pool + Client + Hosted Domain)

resource "aws_cognito_user_pool" "this" {
  name = "${local.name}-userpool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  mfa_configuration        = "OFF"
  auto_verified_attributes = ["email"]
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  tags = local.tags
}

resource "aws_cognito_user_pool_client" "app" {
  name         = "${local.name}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows                  = ["code"]
  supported_identity_providers         = ["COGNITO"]

  // Use CloudFront domain as callback/logout target
  // NOTE: Can run "apply" once to create CloudFront, then update this client automatically
  callback_urls = [
    "https://${aws_cloudfront_distribution.cdn.domain_name}/"
  ]
  logout_urls = [
    "https://${aws_cloudfront_distribution.cdn.domain_name}/"
  ]

  depends_on = [aws_cloudfront_distribution.cdn]
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain       = var.cognito_domain_prefix # must be unique per-region
  user_pool_id = aws_cognito_user_pool.this.id
}

// API Gateway (HTTP API) + JWT Authorizer (Cognito)

resource "aws_apigatewayv2_api" "http" {
  name          = "${local.name}-api"
  protocol_type = "HTTP"
  tags          = local.tags
}

// JWT Authorizer uses Cognito Hosted UI issuer + client id (audience)
resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.http.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${local.name}-jwt"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.app.id]
    issuer   = "https://${aws_cognito_user_pool_domain.domain.domain}.auth.${var.region}.amazoncognito.com"
  }
}

// Lambda (FastAPI via Mangum) + Permissions

// Package backend at ../backend/build (site-packages + app.py)
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/build"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_iam_role" "lambda_exec" {
  name = "${local.name}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
  tags = local.tags
}

# Basic logging
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allow Lambda to call RDS Data API + read DB secret
resource "aws_iam_policy" "lambda_db" {
  name = "${local.name}-lambda-db"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid : "RDSDataAPI",
        Effect : "Allow",
        Action : [
          "rds-data:ExecuteStatement",
          "rds-data:BatchExecuteStatement",
          "rds-data:BeginTransaction",
          "rds-data:CommitTransaction",
          "rds-data:RollbackTransaction"
        ],
        Resource : aws_rds_cluster.aurora.arn
      },
      {
        Sid : "ReadDbSecret",
        Effect : "Allow",
        Action : ["secretsmanager:GetSecretValue"],
        Resource : aws_secretsmanager_secret.db.arn
      }
    ]
  })
  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "lambda_db_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_db.arn
}

resource "aws_lambda_function" "api" {
  function_name = "${local.name}-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "app.handler" # Mangum entrypoint (app.py -> handler)
  runtime       = "python3.12"
  filename      = data.archive_file.lambda_zip.output_path
  timeout       = 15
  environment {
    variables = {
      DB_ARN     = aws_rds_cluster.aurora.arn
      SECRET_ARN = aws_secretsmanager_secret.db.arn
      DB_NAME    = var.db_name
    }
  }
  // IMPORTANT: ensures code changes trigger replacement
  source_code_hash = filebase64sha256(data.archive_file.lambda_zip.output_path)
  tags             = local.tags
}

// HTTP API integration (Lambda proxy)
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

// A protected route example; attach JWT authorizer
resource "aws_apigatewayv2_route" "route" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "GET /users/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
  authorization_type = "JWT"
}

// Allow API Gateway to invoke Lambda
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

// Stage: use $default with auto_deploy so base URL works without /stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
  tags        = local.tags
}

// S3 (static site) + Cloudfront (OAC)

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "site" {
  bucket        = "${local.name}-site-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
  tags          = local.tags
}

// Strong “block public access” posture
resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

// SSE-KMS for site bucket (CloudFront can read if KMS key policy permits)
resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

// CloudFront OAC to access the S3 origin privately
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${local.name}-oac"
  description                       = "OAC for S3 static site"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  tags                = local.tags

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-site"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-site"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

// Bucket policy: only CloudFront may read objects
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [{
      Sid : "AllowCloudFrontRead",
      Effect : "Allow",
      Principal : { Service : "cloudfront.amazonaws.com" },
      Action : ["s3:GetObject"],
      Resource : ["${aws_s3_bucket.site.arn}/*"],
      Condition : {
        StringEquals : {
          "AWS:SourceArn" : aws_cloudfront_distribution.cdn.arn
        }
      }
    }]
  })
}

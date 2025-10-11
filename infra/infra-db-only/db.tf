/* Small Terraform config to just instantiate the database */

terraform {
  required_providers {
    aws    = { source = "hashicorp/aws",    version = "~> 5.60" }
    random = { source = "hashicorp/random", version = "~> 3.6"  }
  }
}

provider "aws" { region = "us-east-1" }

/* Provide your private subnets (two AZs) */
variable "private_subnet_ids" {
  type    = list(string)
  default = ["subnet-07356d8c8091f5196", "subnet-05dc86cec054951fa"]
}

/* DB subnet group spanning your two subnets */
resource "aws_db_subnet_group" "aurora" {
  name       = "dev-dbsubnet"
  subnet_ids = var.private_subnet_ids
}

/* Random DB password for the master user */
resource "random_password" "db" {
  length  = 24
  special = true
}

/* Secret for username/password (uses AWS-managed KMS by default) */
resource "aws_secretsmanager_secret" "db" {
  name = "dev/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id     = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({ username = "appuser", password = random_password.db.result })
}

/* Look up the existing default VPC and its default security group */
variable "db_security_group_id" {
  type = string
}

/* Aurora Serverless v2 cluster (PostgreSQL) with the RDS Data API enabled */
resource "aws_rds_cluster" "aurora" {
  engine                   = "aurora-postgresql"
  engine_version           = "15"
  database_name            = "appdb"
  master_username          = "appuser"
  master_password          = random_password.db.result
  db_subnet_group_name     = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [var.db_security_group_id]
  storage_encrypted        = true              /* uses AWS-managed KMS key */
  backup_retention_period  = 1
  deletion_protection      = false
  apply_immediately        = true

  /* Serverless v2 settings */
  engine_mode = "provisioned"
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 1
  }

  /* Enable the HTTPS RDS Data API */
  enable_http_endpoint = true
}

/* One serverless v2 instance */
resource "aws_rds_cluster_instance" "aurora" {
  count               = 1
  cluster_identifier  = aws_rds_cluster.aurora.id
  instance_class      = "db.serverless"
  engine              = "aurora-postgresql"
  engine_version      = "15"
  publicly_accessible = false
}

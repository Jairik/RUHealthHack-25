/* Specify the required Terraform version and providers */
terraform {
  required_version = ">= 1.6.0" # Minimum Terraform version required
  required_providers {
    aws = {
      source  = "hashicorp/aws" # AWS provider source
      version = "~> 5.60"       # AWS provider version constraint
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = var.region # AWS region to deploy resources in
}

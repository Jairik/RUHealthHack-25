/* Variables and descriptions
    region:
        The AWS region where resources will be deployed.
        Default: "us-east-1"
    project:
        The name of the project or application stack.
        Default: "appstack"
    env:
        The environment for deployment (e.g., prod, dev, staging).
        Default: "prod"
    db_name:
        The name of the database to be created.
        Default: "appdb"
    db_engine:
        The database engine to use (e.g., aurora-postgresql).
        Default: "aurora-postgresql"
    db_engine_version:
        The version of the database engine.
        Default: "15" (Aurora PostgreSQL 15.x)
    cognito_domain_prefix:
        The prefix for the AWS Cognito domain.
        Example: "yourprefix-xyz"
*/
variable "region" {
  type    = string
  default = "us-east-1"
}
variable "project" {
  type    = string
  default = "appstack"
}
variable "env" {
  type    = string
  default = "prod"
}
variable "db_name" {
  type    = string
  default = "appdb"
}
variable "db_engine" {
  type    = string
  default = "aurora-postgresql"
}
variable "db_engine_version" {
  type    = string
  default = "15"
} // Aurora Postgres 15.x
variable "cognito_domain_prefix" {
  type = string
}
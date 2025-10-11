# Infrastructure Stack - AWS

- Cognito for auth
- Aurora Serverless v2 for relational database
- Lambda + API Gateway for FastAPI backend
- S3 + CloudFront for frontend hosting

These configurations use Terraform to instantiate the database, lambda, and s3 instance. To run, simply type ```terraform init``` and then ```terraform plan```.

If prompted for subnets, 
["subnet-07356d8c8091f5196", "subnet-05dc86cec054951fa"]

If asked for db_security_group_id,
sg-07a514fe5c3e8f431

''' Initial loading of the data from a s3 bucket into a csv file '''

import boto3

# Create S3 client
s3 = boto3.client('s3')
bucket_name = 'ruhealthhack2025'

# List all objects
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get('Contents', []):
    print(obj['Key'])

# Download a file
s3.download_file(bucket_name, 'filename.csv', 'local_filename.csv')

''' Defines a basic helper function to connect to AWS services, returining a boto3 client object '''

import boto3

def connect_to_aws(service_name='s3', region_name='us-east-1'):
    """
    Connect to an AWS service and return a boto3 client object.

    Parameters:
    service_name (str): The name of the AWS service (e.g., 's3', 'ec2').
    region_name (str): The AWS region name (default is 'us-east-1').

    Returns:
    boto3.client: A boto3 client object for the specified service.
    """
    try:
        client = boto3.client(service_name, region_name=region_name)
        return client
    except Exception as e:
        print(f"Error connecting to {service_name} in {region_name}: {e}")
        return None
    
def test_connection(s3_client):
    """ Test the AWS connection by listing S3 buckets """
    if s3_client:
        response = s3_client.list_buckets()
        buckets = [bucket['Name'] for bucket in response.get('Buckets', [])]
        print("S3 Buckets:", buckets)
    else:
        print("Failed to connect to S3.")
    
client = connect_to_aws('s3')
test_connection(client)
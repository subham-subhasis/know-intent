# AWS Cognito Custom OTP Authentication Setup Guide

This project uses AWS Cognito with Custom Auth Triggers for OTP-based authentication via phone and email.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Node.js installed for Lambda development

## Step 1: Deploy Lambda Triggers

All Lambda trigger code is located in the `aws-lambda-triggers/` directory.

### Quick Deploy with AWS CLI

```bash
cd aws-lambda-triggers

# Package and deploy each Lambda function
for func in DefineAuthChallenge CreateAuthChallenge VerifyAuthChallengeResponse PreSignUp; do
  zip ${func}.zip ${func}.js

  aws lambda create-function \
    --function-name Cognito${func} \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
    --handler ${func}.handler \
    --zip-file fileb://${func}.zip \
    --region ap-south-1
done
```

### For CreateAuthChallenge (requires dependencies):

```bash
cd aws-lambda-triggers
npm init -y
npm install @aws-sdk/client-sns @aws-sdk/client-ses @aws-sdk/client-dynamodb

zip -r CreateAuthChallenge.zip CreateAuthChallenge.js node_modules/

aws lambda create-function \
  --function-name CognitoCreateAuthChallenge \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --handler CreateAuthChallenge.handler \
  --zip-file fileb://CreateAuthChallenge.zip \
  --timeout 30 \
  --environment Variables="{RATE_LIMIT_TABLE=otp-rate-limits,SES_FROM_EMAIL=noreply@yourdomain.com}" \
  --region ap-south-1
```

## Step 2: Create DynamoDB Table for Rate Limiting

```bash
aws dynamodb create-table \
  --table-name otp-rate-limits \
  --attribute-definitions \
    AttributeName=identifier,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=identifier,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --time-to-live-specification \
    Enabled=true,AttributeName=expiresAt \
  --region ap-south-1
```

## Step 3: Configure SNS for SMS (India DLT Compliance)

1. Register with a DLT provider in India
2. Get Sender ID and Entity ID approved
3. Configure SNS:

```bash
aws sns set-sms-attributes \
  --attributes \
    DefaultSenderID=YourApprovedSenderID,\
    DefaultSMSType=Transactional \
  --region ap-south-1
```

## Step 4: Configure SES for Email

1. Verify your sender email domain in AWS SES
2. Move SES out of sandbox mode for production use
3. Set the `SES_FROM_EMAIL` environment variable in the CreateAuthChallenge Lambda

## Step 5: Attach Triggers to Cognito

```bash
aws cognito-idp update-user-pool \
  --user-pool-id ap-south-1_kf2i3I0h5 \
  --lambda-config \
    DefineAuthChallenge=arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:CognitoDefineAuthChallenge,\
    CreateAuthChallenge=arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:CognitoCreateAuthChallenge,\
    VerifyAuthChallengeResponse=arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:CognitoVerifyAuthChallenge,\
    PreSignUp=arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:CognitoPreSignUp \
  --region ap-south-1
```

## Step 6: Grant Cognito Permission to Invoke Lambda

For each Lambda function, run:

```bash
aws lambda add-permission \
  --function-name CognitoDefineAuthChallenge \
  --statement-id CognitoTriggerPermission \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:ap-south-1:YOUR_ACCOUNT_ID:userpool/ap-south-1_kf2i3I0h5 \
  --region ap-south-1
```

Repeat for all four functions:
- `CognitoDefineAuthChallenge`
- `CognitoCreateAuthChallenge`
- `CognitoVerifyAuthChallenge`
- `CognitoPreSignUp`

## Testing the Setup

1. Start the Expo app
2. Navigate to sign up
3. Enter email or phone number
4. Complete the sign-up flow
5. Verify OTP sent via SMS or email

## Monitoring and Debugging

Check CloudWatch Logs for each Lambda function:

```bash
aws logs tail /aws/lambda/CognitoCreateAuthChallenge --follow --region ap-south-1
```

## Security Considerations

- Rate limiting: Max 5 OTP requests per hour per phone/email
- OTP validity: 5 minutes
- DynamoDB TTL: Auto-deletes rate limit records after 1 hour
- RLS policies ensure data isolation

## Cost Optimization

- DynamoDB: On-demand billing with auto-scaling
- SNS: Pay per SMS sent (DLT-compliant costs in India)
- SES: Free tier covers first 62,000 emails/month
- Lambda: Free tier covers most development use cases

## Troubleshooting

### OTP not received
- Check CloudWatch Logs for CreateAuthChallenge
- Verify SNS/SES configuration
- Check sender verification status

### Authentication fails
- Check CloudWatch Logs for VerifyAuthChallengeResponse
- Verify OTP is correct and not expired

### Rate limiting issues
- Check DynamoDB table for entries
- Verify TTL is configured correctly

## Support

For detailed logs and debugging, check:
- CloudWatch Logs for each Lambda function
- Cognito User Pool triggers configuration
- SNS delivery status
- SES sending statistics

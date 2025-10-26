# AWS Lambda Triggers for Cognito Custom OTP Authentication

## Overview

These Lambda functions implement custom OTP authentication for AWS Cognito using phone numbers or email addresses.

## Lambda Functions

### 1. DefineAuthChallenge.js
Determines the authentication flow and when to issue tokens.

### 2. CreateAuthChallenge.js
Generates OTP and sends it via SNS (SMS) or SES (Email).

### 3. VerifyAuthChallengeResponse.js
Validates the OTP provided by the user.

### 4. PreSignUp.js
Auto-confirms users and verifies email/phone for seamless custom auth.

## AWS Setup Instructions

### Step 1: Create DynamoDB Table for Rate Limiting

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

### Step 2: Configure SNS for SMS (India DLT Compliance)

1. Register with DLT (Distributed Ledger Technology) provider in India
2. Get your Sender ID and Entity ID approved
3. Configure SNS with DLT credentials:

```bash
aws sns set-sms-attributes \
  --attributes \
    DefaultSenderID=YourApprovedSenderID,\
    DefaultSMSType=Transactional \
  --region ap-south-1
```

### Step 3: Configure SES for Email

1. Verify your sender email domain in SES
2. Move SES out of sandbox mode for production
3. Set the environment variable `SES_FROM_EMAIL` in Lambda

### Step 4: Create IAM Role for Lambda

Create an IAM role with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:*:table/otp-rate-limits"
    }
  ]
}
```

### Step 5: Deploy Lambda Functions

For each Lambda function:

1. **Create the function:**
   ```bash
   zip DefineAuthChallenge.zip DefineAuthChallenge.js

   aws lambda create-function \
     --function-name CognitoDefineAuthChallenge \
     --runtime nodejs18.x \
     --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
     --handler DefineAuthChallenge.handler \
     --zip-file fileb://DefineAuthChallenge.zip \
     --region ap-south-1
   ```

2. **Repeat for other functions:**
   - `CognitoCreateAuthChallenge` (CreateAuthChallenge.js)
   - `CognitoVerifyAuthChallenge` (VerifyAuthChallengeResponse.js)
   - `CognitoPreSignUp` (PreSignUp.js)

3. **For CreateAuthChallenge, add dependencies:**
   ```bash
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

### Step 6: Attach Triggers to Cognito User Pool

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

### Step 7: Grant Cognito Permission to Invoke Lambda

For each Lambda function:

```bash
aws lambda add-permission \
  --function-name CognitoDefineAuthChallenge \
  --statement-id CognitoTriggerPermission \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:ap-south-1:YOUR_ACCOUNT_ID:userpool/ap-south-1_kf2i3I0h5 \
  --region ap-south-1
```

Repeat for all four functions.

## Testing

1. Use AWS Lambda console to test functions with sample Cognito events
2. Check CloudWatch Logs for debugging
3. Test OTP delivery via SNS/SES
4. Verify rate limiting in DynamoDB

## Environment Variables

Set these in the CreateAuthChallenge Lambda function:

- `RATE_LIMIT_TABLE`: DynamoDB table name (default: otp-rate-limits)
- `SES_FROM_EMAIL`: Verified sender email address
- `AWS_REGION`: ap-south-1 (automatically set)

## Rate Limiting

- Maximum 5 OTP requests per hour per phone/email
- Stored in DynamoDB with TTL of 1 hour
- Prevents abuse and reduces costs

## Security Considerations

- OTP valid for 5 minutes
- Rate limiting prevents brute force attacks
- DLT compliance for SMS in India
- Auto-verification prevents account enumeration
- CloudWatch logging for audit trail

## Cost Optimization

- DynamoDB: On-demand billing with TTL
- SNS: Pay per SMS sent
- SES: Free tier for first 62,000 emails/month
- Lambda: Free tier covers most use cases

## Support

For issues or questions, check CloudWatch Logs or AWS Support.

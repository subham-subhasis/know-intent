# Quick Start: AWS Cognito OTP Authentication

## Prerequisites Checklist

Before testing the authentication flow, ensure you have:

- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured
- [ ] Node.js installed (for Lambda deployment)
- [ ] DLT registration (for SMS in India)
- [ ] SES verified domain (for email)

## 5-Minute Setup (Minimal)

### 1. Install Lambda Dependencies

```bash
cd aws-lambda-triggers
npm init -y
npm install @aws-sdk/client-sns @aws-sdk/client-ses @aws-sdk/client-dynamodb
```

### 2. Create DynamoDB Table

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
  --region ap-south-1
```

### 3. Deploy Lambda Functions

```bash
# Replace YOUR_ACCOUNT_ID and YOUR_LAMBDA_ROLE with your values

# Package and deploy each function
for func in DefineAuthChallenge VerifyAuthChallengeResponse PreSignUp; do
  zip ${func}.zip ${func}.js
  aws lambda create-function \
    --function-name Cognito${func} \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
    --handler ${func}.handler \
    --zip-file fileb://${func}.zip \
    --region ap-south-1
done

# Deploy CreateAuthChallenge with dependencies
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

### 4. Attach Triggers to Cognito

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

### 5. Grant Permissions

```bash
for func in DefineAuthChallenge CreateAuthChallenge VerifyAuthChallengeResponse PreSignUp; do
  aws lambda add-permission \
    --function-name Cognito${func} \
    --statement-id CognitoTriggerPermission \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:ap-south-1:YOUR_ACCOUNT_ID:userpool/ap-south-1_kf2i3I0h5 \
    --region ap-south-1
done
```

### 6. Configure SNS (for SMS)

```bash
aws sns set-sms-attributes \
  --attributes \
    DefaultSenderID=YourApprovedSenderID,\
    DefaultSMSType=Transactional \
  --region ap-south-1
```

## Testing the Flow

### Option 1: Email-Based Testing (Easiest)

1. Verify your email in SES:
   ```bash
   aws ses verify-email-identity --email-address your@email.com --region ap-south-1
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

3. Test signup:
   - Navigate to Sign Up
   - Enter your email address
   - Create password
   - Select date of birth
   - Choose interests
   - Check your email for OTP
   - Enter OTP to complete signup

### Option 2: Phone-Based Testing (Requires DLT)

1. Ensure DLT registration is complete
2. Configure SNS with approved Sender ID
3. Follow same steps as email but use phone number

## Monitoring

### Check Lambda Logs

```bash
# View CreateAuthChallenge logs (OTP generation)
aws logs tail /aws/lambda/CognitoCreateAuthChallenge --follow --region ap-south-1

# View VerifyAuthChallengeResponse logs (OTP validation)
aws logs tail /aws/lambda/CognitoVerifyAuthChallenge --follow --region ap-south-1
```

### Check DynamoDB Rate Limits

```bash
aws dynamodb scan --table-name otp-rate-limits --region ap-south-1
```

## Troubleshooting

### OTP Not Received

**Email:**
- Check SES sending statistics
- Verify sender email in SES
- Check spam folder
- View CloudWatch Logs for CreateAuthChallenge

**SMS:**
- Verify SNS configuration
- Check DLT registration status
- Ensure Sender ID is approved
- View CloudWatch Logs for CreateAuthChallenge

### Authentication Fails

1. Check CloudWatch Logs:
   ```bash
   aws logs tail /aws/lambda/CognitoDefineAuthChallenge --follow --region ap-south-1
   ```

2. Verify OTP was generated:
   ```bash
   aws logs filter-pattern "OTP" /aws/lambda/CognitoCreateAuthChallenge --region ap-south-1
   ```

3. Check rate limiting:
   ```bash
   aws dynamodb scan --table-name otp-rate-limits --region ap-south-1
   ```

### Lambda Permission Errors

Re-grant permissions:
```bash
aws lambda add-permission \
  --function-name CognitoCreateAuthChallenge \
  --statement-id CognitoTriggerPermission \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:ap-south-1:YOUR_ACCOUNT_ID:userpool/ap-south-1_kf2i3I0h5 \
  --region ap-south-1
```

## Common Issues

### Issue: "User pool ap-south-1_kf2i3I0h5 does not exist"
**Solution:** Verify User Pool ID in AWS Console

### Issue: "Access Denied" when deploying Lambda
**Solution:** Check IAM role has Lambda deployment permissions

### Issue: "Cannot send email - Email address not verified"
**Solution:** Verify sender email in SES first

### Issue: "SMS delivery failed"
**Solution:**
1. Verify DLT registration
2. Check Sender ID approval status
3. Ensure phone number format is correct (+91XXXXXXXXXX)

## Production Checklist

Before going to production:

- [ ] Move SES out of sandbox mode
- [ ] Register Sender ID with DLT (India)
- [ ] Configure custom domain for SES
- [ ] Set up CloudWatch alarms for Lambda errors
- [ ] Enable Lambda X-Ray tracing
- [ ] Configure DynamoDB auto-scaling (if needed)
- [ ] Add proper error handling in frontend
- [ ] Implement password reset flow
- [ ] Add session management
- [ ] Set up auth guards on protected routes

## Cost Estimates (Monthly)

**Development/Testing:**
- DynamoDB: $0-5 (on-demand, low usage)
- Lambda: $0 (within free tier)
- SES: $0 (within free tier)
- SNS SMS: ~$0.01 per SMS (DLT rates in India)

**Production (10,000 users, 50% activity):**
- DynamoDB: ~$5-10
- Lambda: ~$5-10
- SES: ~$10 (if beyond free tier)
- SNS SMS: ~$50-100 (varies by DLT provider)

## Next Steps

1. ✅ Deploy AWS infrastructure (use this guide)
2. ⏳ Test OTP flow with email
3. ⏳ Test OTP flow with phone
4. ⏳ Implement login flow for returning users
5. ⏳ Add password reset functionality
6. ⏳ Add auth state management
7. ⏳ Implement protected routes
8. ⏳ Move to production

## Getting Help

- AWS Documentation: https://docs.aws.amazon.com/cognito/
- Amplify Documentation: https://docs.amplify.aws/
- DLT Registration (India): https://www.dltconnect.com/

## Useful AWS CLI Commands

```bash
# List Lambda functions
aws lambda list-functions --region ap-south-1

# Get User Pool details
aws cognito-idp describe-user-pool --user-pool-id ap-south-1_kf2i3I0h5 --region ap-south-1

# Test SNS
aws sns publish --phone-number +91XXXXXXXXXX --message "Test" --region ap-south-1

# Test SES
aws ses send-email \
  --from noreply@yourdomain.com \
  --to your@email.com \
  --subject "Test" \
  --text "Test email" \
  --region ap-south-1
```

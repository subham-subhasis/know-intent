# AWS Cognito Custom OTP Authentication - Migration Complete

## What Was Implemented

Your app now uses AWS Cognito with custom OTP authentication instead of Supabase Auth. Users can sign up and log in using either phone numbers or email addresses, with OTP verification handled through AWS Lambda triggers.

## Key Changes Made

### 1. AWS Amplify Integration
- Installed `aws-amplify`, `amazon-cognito-identity-js`, and `@react-native-community/netinfo`
- Configured Amplify with your Cognito User Pool credentials
- Environment variables added to `.env`:
  - `EXPO_PUBLIC_AWS_REGION=ap-south-1`
  - `EXPO_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_kf2i3I0h5`
  - `EXPO_PUBLIC_COGNITO_CLIENT_ID=5ep45j1v9gv4brk8dsh3cen9oc`

### 2. Lambda Trigger Functions Created
Four Lambda functions are ready for deployment in `/aws-lambda-triggers/`:
- **DefineAuthChallenge.js** - Controls authentication flow
- **CreateAuthChallenge.js** - Generates and sends OTP via SNS/SES
- **VerifyAuthChallengeResponse.js** - Validates user's OTP
- **PreSignUp.js** - Auto-confirms users for seamless custom auth

### 3. Authentication Service Layer
Created `/lib/auth.ts` with these functions:
- `signUp()` - Creates new Cognito user with email or phone
- `initiateAuth()` - Starts custom auth flow and triggers OTP
- `verifyOTP()` - Confirms OTP and completes authentication
- `signOut()` - Signs user out
- `getCurrentUser()` - Gets current authenticated user
- `getSession()` - Retrieves auth session and tokens

### 4. Updated Sign-Up Flow
**Flow:** Email/Phone → Password → Date of Birth → Interests → OTP Verification

- **Step 1** (`/app/signup/index.tsx`): Collect email or phone with country code
- **Step 2** (`/app/signup/password.tsx`): Create password
- **Step 3** (`/app/signup/dateofbirth.tsx`): Unchanged
- **Step 4** (`/app/signup/kpiselection.tsx`):
  - Now creates Cognito account
  - Triggers custom auth flow to send OTP
- **Step 5** (`/app/signup/verifyotp.tsx`): NEW - 6-digit OTP verification screen

### 5. Sign-Up Data Storage
Created `/lib/signupStorage.ts` to pass user data between signup screens without using navigation params.

### 6. Removed Supabase Auth
- Commented out Supabase client initialization (kept for database features)
- Removed Supabase auth imports from signup flow
- Updated profile page to prepare for Cognito user fetching

## What You Need to Do Next

### Step 1: Deploy AWS Infrastructure

Follow the instructions in `/AWS_SETUP_INSTRUCTIONS.md`:

1. **Create DynamoDB table** for OTP rate limiting
2. **Configure SNS** for SMS with DLT compliance (India)
3. **Configure SES** for email delivery
4. **Deploy Lambda functions** to AWS
5. **Attach Lambda triggers** to your Cognito User Pool
6. **Grant permissions** for Cognito to invoke Lambda functions

### Step 2: Test the Flow

1. Start your Expo app
2. Navigate to Sign Up
3. Enter email or phone number
4. Complete the signup flow
5. Verify you receive OTP via email or SMS
6. Enter OTP to complete authentication

### Step 3: Production Considerations

**Security:**
- Lambda functions include rate limiting (5 OTP requests per hour)
- OTP expires after 5 minutes
- DynamoDB auto-deletes rate limit records after 1 hour

**Monitoring:**
- Check CloudWatch Logs for Lambda function execution
- Monitor SNS delivery status for SMS
- Monitor SES sending statistics for email

**Costs:**
- DynamoDB: On-demand billing with automatic scaling
- SNS: Pay per SMS (DLT-compliant rates in India)
- SES: First 62,000 emails/month are free
- Lambda: Free tier covers most use cases

## Architecture Overview

```
User Signs Up
    ↓
Cognito receives credentials
    ↓
PreSignUp Lambda (auto-confirms user)
    ↓
User initiates auth with username
    ↓
DefineAuthChallenge Lambda (decides to send OTP)
    ↓
CreateAuthChallenge Lambda (generates OTP, sends via SNS/SES, stores in private params)
    ↓
User enters OTP
    ↓
VerifyAuthChallengeResponse Lambda (validates OTP)
    ↓
DefineAuthChallenge Lambda (issues tokens if correct)
    ↓
User authenticated
```

## Files Modified or Created

**New Files:**
- `/lib/amplify.ts` - Amplify configuration
- `/lib/auth.ts` - Authentication service layer
- `/lib/signupStorage.ts` - Sign-up data storage
- `/app/signup/verifyotp.tsx` - OTP verification screen
- `/aws-lambda-triggers/*.js` - Lambda trigger functions
- `/AWS_SETUP_INSTRUCTIONS.md` - Deployment guide
- `/COGNITO_MIGRATION_SUMMARY.md` - This file

**Modified Files:**
- `/app/_layout.tsx` - Imports Amplify configuration
- `/app/signup/index.tsx` - Stores email/phone in signupStorage
- `/app/signup/password.tsx` - Stores password in signupStorage
- `/app/signup/kpiselection.tsx` - Creates Cognito account and triggers OTP
- `/app/(tabs)/profile.tsx` - Prepared for Cognito user fetching
- `/lib/supabase.ts` - Kept for database (auth commented out)
- `/.env` - Added AWS/Cognito environment variables

## Next Steps

1. **Deploy Lambda functions** following AWS_SETUP_INSTRUCTIONS.md
2. **Test OTP delivery** via both SMS and email
3. **Implement login flow** for returning users
4. **Add password reset** functionality
5. **Update profile page** to fetch Cognito user details
6. **Add auth guards** to protected routes

## Support

For deployment issues:
- Check CloudWatch Logs for Lambda function errors
- Verify SNS/SES configuration
- Ensure IAM permissions are correct

For code issues:
- Review `/lib/auth.ts` for authentication logic
- Check sign-up flow in `/app/signup/` directory
- Verify Amplify configuration in `/lib/amplify.ts`

## Important Notes

- Supabase database functionality is still available for data storage
- Only authentication was migrated from Supabase to Cognito
- Lambda functions must be deployed before testing OTP flow
- SNS requires DLT registration for SMS delivery in India
- SES requires domain verification and sandbox removal for production

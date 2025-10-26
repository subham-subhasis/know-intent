/**
 * AWS Cognito Lambda Trigger: Create Auth Challenge
 *
 * Generates OTP and sends it via SNS (SMS) or SES (Email).
 *
 * Deploy this function in AWS Lambda and attach it to your Cognito User Pool
 * as the "Create Auth Challenge" trigger.
 *
 * Required IAM Permissions:
 * - sns:Publish (for SMS)
 * - ses:SendEmail (for Email)
 * - dynamodb:PutItem (for rate limiting)
 */

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const sesClient = new SESClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE || 'otp-rate-limits';
const MAX_ATTEMPTS_PER_HOUR = 5;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkRateLimit(identifier) {
  const oneHourAgo = Date.now() - 3600000;

  try {
    const params = {
      TableName: RATE_LIMIT_TABLE,
      KeyConditionExpression: 'identifier = :id AND timestamp > :time',
      ExpressionAttributeValues: {
        ':id': { S: identifier },
        ':time': { N: oneHourAgo.toString() },
      },
    };

    const result = await dynamoClient.send(new QueryCommand(params));
    return (result.Items?.length || 0) < MAX_ATTEMPTS_PER_HOUR;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
}

async function logAttempt(identifier) {
  const params = {
    TableName: RATE_LIMIT_TABLE,
    Item: {
      identifier: { S: identifier },
      timestamp: { N: Date.now().toString() },
      expiresAt: { N: Math.floor(Date.now() / 1000 + 3600).toString() }, // TTL
    },
  };

  try {
    await dynamoClient.send(new PutItemCommand(params));
  } catch (error) {
    console.error('Log attempt error:', error);
  }
}

async function sendSMS(phoneNumber, otp) {
  const message = `Your verification code is: ${otp}. Valid for 5 minutes.`;

  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'YourApp',
      },
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional',
      },
    },
  };

  try {
    await snsClient.send(new PublishCommand(params));
    console.log('SMS sent successfully to:', phoneNumber);
  } catch (error) {
    console.error('SMS send error:', error);
    throw error;
  }
}

async function sendEmail(email, otp) {
  const params = {
    Source: process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com',
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Your Verification Code',
      },
      Body: {
        Html: {
          Data: `
            <html>
              <body>
                <h2>Your Verification Code</h2>
                <p>Use the following code to verify your account:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This code is valid for 5 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </body>
            </html>
          `,
        },
        Text: {
          Data: `Your verification code is: ${otp}. Valid for 5 minutes.`,
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  console.log('CreateAuthChallenge event:', JSON.stringify(event, null, 2));

  const phoneNumber = event.request.userAttributes.phone_number;
  const email = event.request.userAttributes.email;
  const identifier = phoneNumber || email;

  if (!identifier) {
    throw new Error('No phone number or email found');
  }

  // Check rate limiting
  const canProceed = await checkRateLimit(identifier);
  if (!canProceed) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  // Generate OTP
  const otp = generateOTP();

  // Store OTP in private challenge parameters (not visible to client)
  event.response.privateChallengeParameters = {
    answer: otp,
  };

  event.response.challengeMetadata = 'OTP_CHALLENGE';

  // Send OTP
  try {
    if (phoneNumber) {
      await sendSMS(phoneNumber, otp);
    } else if (email) {
      await sendEmail(email, otp);
    }

    // Log attempt for rate limiting
    await logAttempt(identifier);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Failed to send verification code. Please try again.');
  }

  console.log('CreateAuthChallenge response:', JSON.stringify(event.response, null, 2));
  return event;
};

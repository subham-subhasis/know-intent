/**
 * AWS Cognito Lambda Trigger: Pre Sign-up
 *
 * Auto-confirms users and auto-verifies email/phone for custom auth flow.
 *
 * Deploy this function in AWS Lambda and attach it to your Cognito User Pool
 * as the "Pre Sign-up" trigger.
 */

exports.handler = async (event) => {
  console.log('PreSignUp event:', JSON.stringify(event, null, 2));

  // Auto-confirm the user
  event.response.autoConfirmUser = true;

  // Auto-verify email if present
  if (event.request.userAttributes.email) {
    event.response.autoVerifyEmail = true;
  }

  // Auto-verify phone if present
  if (event.request.userAttributes.phone_number) {
    event.response.autoVerifyPhone = true;
  }

  console.log('PreSignUp response:', JSON.stringify(event.response, null, 2));
  return event;
};

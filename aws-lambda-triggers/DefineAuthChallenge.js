/**
 * AWS Cognito Lambda Trigger: Define Auth Challenge
 *
 * Determines which challenge to present to the user during custom authentication.
 *
 * Deploy this function in AWS Lambda and attach it to your Cognito User Pool
 * as the "Define Auth Challenge" trigger.
 */

exports.handler = async (event) => {
  console.log('DefineAuthChallenge event:', JSON.stringify(event, null, 2));

  if (event.request.session.length === 0) {
    // First attempt - send OTP challenge
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  } else if (
    event.request.session.length === 1 &&
    event.request.session[0].challengeName === 'CUSTOM_CHALLENGE' &&
    event.request.session[0].challengeResult === true
  ) {
    // User provided correct OTP
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    // User provided wrong OTP or too many attempts
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }

  console.log('DefineAuthChallenge response:', JSON.stringify(event.response, null, 2));
  return event;
};

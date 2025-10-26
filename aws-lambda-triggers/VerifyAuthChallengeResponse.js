/**
 * AWS Cognito Lambda Trigger: Verify Auth Challenge Response
 *
 * Validates the OTP provided by the user against the generated OTP.
 *
 * Deploy this function in AWS Lambda and attach it to your Cognito User Pool
 * as the "Verify Auth Challenge Response" trigger.
 */

exports.handler = async (event) => {
  console.log('VerifyAuthChallengeResponse event:', JSON.stringify(event, null, 2));

  const expectedAnswer = event.request.privateChallengeParameters.answer;
  const userAnswer = event.request.challengeAnswer;

  console.log('Expected OTP:', expectedAnswer);
  console.log('User provided OTP:', userAnswer);

  if (userAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
    console.log('OTP verification: SUCCESS');
  } else {
    event.response.answerCorrect = false;
    console.log('OTP verification: FAILED');
  }

  console.log('VerifyAuthChallengeResponse response:', JSON.stringify(event.response, null, 2));
  return event;
};

# API Integration Summary

## Overview
Successfully integrated the Lambda API endpoints for signup and signin flows.

## Signup Flow

### Step 1: Email/Phone Entry (`app/signup/index.tsx`)
- User enters email or phone number
- Data stored in `signupStorage.emailOrPhone`
- `signupStorage.isEmail` flag set based on input type

### Step 2: Password Entry (`app/signup/password.tsx`)
- User creates and confirms password
- Password stored in `signupStorage.password`
- Password will be hashed before API call

### Step 3: Date of Birth (`app/signup/dateofbirth.tsx`)
- User selects date of birth
- Formatted as `YYYY-MM-DD` string
- Stored in `signupStorage.dateOfBirth`

### Step 4: Interest Selection (`app/signup/kpiselection.tsx`)
- User selects interests (KPIs) or enters custom suggestions
- On "Next" button click:
  1. Shows loading spinner
  2. Hashes password using SHA256
  3. Calls `/signup` API endpoint with:
     - `email`: user's email
     - `password_hash`: SHA256 hash of password
     - `date_of_birth`: formatted date string
     - `interests`: array of selected KPIs or custom suggestions
  4. On success: Clears storage and navigates to main app
  5. On failure: Shows error message, stays on page for retry

## Login Flow

### Landing Page (`app/index.tsx`)
- User enters username or phone number
- User confirms profile selection via checkbox
- On "Login To Intent" button click:
  1. Shows loading spinner
  2. Calls `/signin` API endpoint with:
     - `identifier`: username/phone
     - `otp_verified`: true
     - `device_info`: iOS/Android/Web based on platform
     - `location_info`: "Unknown"
  3. On success: Navigates to main app
  4. On failure: Shows error message for retry

## Technical Details

### Password Security
- Passwords are hashed using SHA256 via `crypto-js`
- Hash function located in `lib/passwordUtils.ts`
- Plain text password never sent to API

### Data Storage
- Signup data temporarily stored in memory via `signupStorage`
- Storage cleared after successful signup
- No sensitive data persisted locally

### Error Handling
- Network errors caught and displayed to user
- User can retry without losing entered data (except on successful signup)
- Loading states prevent duplicate submissions

### API Service Location
- All API functions: `src/api/userService.ts`
- Base URL: `https://asoszydi6wv2y5mwdbqdh2upfm0evcft.lambda-url.ap-south-1.on.aws`
- 10-second timeout on all requests
- Automatic error parsing from API responses

## Files Modified

1. `app/signup/dateofbirth.tsx` - Added DOB storage
2. `app/signup/kpiselection.tsx` - Integrated signup API call
3. `app/index.tsx` - Integrated signin API call
4. `lib/signupStorage.ts` - Updated interface for date string
5. `lib/passwordUtils.ts` - Created password hashing utility
6. `src/api/userService.ts` - Created API service layer

## Testing Notes

- Ensure backend API is accessible
- Test with various email/phone formats
- Verify error messages display correctly
- Check loading states work as expected
- Confirm navigation after successful auth

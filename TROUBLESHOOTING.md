# Troubleshooting Guide

## "Unable to resolve module @aws-amplify" Error - FIXED ✓

This error has been resolved by:

1. ✅ Adding Metro config to support `.cjs` and `.mjs` extensions
2. ✅ Installing required polyfills:
   - `react-native-get-random-values` (for crypto)
   - `react-native-url-polyfill` (already installed)
3. ✅ Importing polyfills at the top of `lib/amplify.ts`

### How to Clear Cache and Test

If you still see module resolution errors, clear the cache:

```bash
# Clear all caches
rm -rf node_modules/.cache .expo
npx expo start --clear

# Or use this one-liner
npm run dev -- --clear
```

## Common Errors and Solutions

### Error: "Invariant Violation: Native module cannot be null"

**Cause:** Metro bundler cache issue or missing native dependencies

**Solution:**
```bash
# Clear cache and restart
rm -rf node_modules/.cache .expo
npx expo start --clear
```

### Error: "Unable to resolve @aws-amplify/core"

**Cause:** Using old AWS Amplify v5 imports

**Solution:** We're using v6 imports which are correct:
```typescript
// ✅ Correct (v6)
import { Amplify } from 'aws-amplify';
import { signUp, signIn } from 'aws-amplify/auth';

// ❌ Wrong (v5)
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
```

### Error: "ReferenceError: crypto is not defined"

**Cause:** Missing crypto polyfill

**Solution:** Already fixed in `lib/amplify.ts`:
```typescript
import 'react-native-get-random-values';
```

### Error: "URL is not defined"

**Cause:** Missing URL polyfill

**Solution:** Already fixed in `lib/amplify.ts`:
```typescript
import 'react-native-url-polyfill/auto';
```

### Error: Cognito functions not working

**Cause:** Lambda triggers not deployed yet

**Solution:**
1. Deploy Lambda functions to AWS (see `QUICK_START.md`)
2. Attach triggers to Cognito User Pool
3. Grant permissions

### TypeScript Errors (LinearGradient)

These are pre-existing errors in the codebase unrelated to Cognito integration. They don't affect runtime.

## Testing Without AWS Infrastructure

To test the app without deploying AWS infrastructure first:

1. Comment out the Cognito signup call in `app/signup/kpiselection.tsx`:

```typescript
const handleNext = async () => {
  if (!validateSelection()) return;

  // Temporarily bypass Cognito for testing UI
  router.replace('/(tabs)');
  return;

  // Original Cognito code (uncomment after AWS setup)
  // setLoading(true);
  // const result = await authService.signUp(...);
  // ...
};
```

2. Test the UI flow without backend integration
3. After deploying AWS infrastructure, uncomment the Cognito code

## Verifying Installation

Check that all dependencies are installed:

```bash
npm list aws-amplify amazon-cognito-identity-js react-native-get-random-values
```

Expected output:
```
+-- aws-amplify@6.15.7
+-- amazon-cognito-identity-js@6.3.15
+-- react-native-get-random-values@2.0.0
```

## Development Workflow

### Step 1: Start the App
```bash
npm run dev
# or
npm run dev -- --clear  # with cache clearing
```

### Step 2: Test Sign-Up Flow
1. Navigate to Sign Up
2. Enter email or phone
3. Create password
4. Select date of birth
5. Choose interests
6. At this point, you'll need AWS infrastructure deployed

### Step 3: If You Get Errors
1. Clear cache: `rm -rf .expo node_modules/.cache`
2. Restart: `npm run dev -- --clear`
3. Check Metro bundler logs for specific errors

## Environment Variables

Make sure `.env` has these values:

```env
EXPO_PUBLIC_AWS_REGION=ap-south-1
EXPO_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_kf2i3I0h5
EXPO_PUBLIC_COGNITO_CLIENT_ID=5ep45j1v9gv4brk8dsh3cen9oc
```

These are automatically loaded by Expo.

## Metro Bundler Configuration

The `metro.config.js` file is configured to support AWS Amplify:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support .cjs and .mjs files from AWS Amplify
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = config;
```

## Next Steps After Fixing Module Resolution

1. ✅ Module resolution fixed
2. ⏳ Deploy AWS Lambda functions
3. ⏳ Configure SNS and SES
4. ⏳ Test OTP delivery
5. ⏳ Test complete sign-up flow

## Getting Help

If you encounter errors:

1. **Check Metro logs** - The terminal where `npm run dev` is running
2. **Clear cache** - `rm -rf .expo node_modules/.cache && npm run dev -- --clear`
3. **Check environment variables** - Ensure `.env` is properly configured
4. **Verify imports** - Make sure you're using AWS Amplify v6 imports

## Contact and Support

- AWS Amplify Docs: https://docs.amplify.aws/
- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/

## Summary of Changes Made

### Files Created:
- `metro.config.js` - Metro bundler configuration for AWS Amplify

### Files Modified:
- `lib/amplify.ts` - Added polyfill imports at the top
- `package.json` - Added `react-native-get-random-values`

### Packages Installed:
- `react-native-get-random-values@2.0.0` - Crypto polyfill

The "unable to resolve module @aws-amplify" error should now be fixed!

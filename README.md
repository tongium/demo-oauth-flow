# demo-oauth-flow

[![Netlify Status](https://api.netlify.com/api/v1/badges/c29abdfd-5abb-4bdc-a3ad-a5e7d9aa8d21/deploy-status)](https://app.netlify.com/sites/finnomena/deploys)

An interactive demo website showcasing the OAuth 2.0 PKCE (Proof Key for Code Exchange) authorization flow. This application is fully customizable for testing with any OAuth 2.0 compliant authorization server.

## Features

- **OAuth 2.0 PKCE Flow**: Complete implementation of the Authorization Code flow with PKCE (RFC 7636)
- **Configurable OAuth Server**: Set custom OAuth server, client ID, and scopes at runtime
- **Token Management**: Display and manage access tokens, refresh tokens, and ID tokens
- **User Information**: Fetch and display user info from the OIDC userinfo endpoint
- **Token Refresh**: Refresh access tokens using the refresh token grant
- **Logout**: Securely logout and clear stored tokens
- **Dark UI**: Modern, responsive dark theme for better OAuth server testing experience

## Technology Stack

- **Frontend Framework**: [SolidJS](https://www.solidjs.com/) - A lightweight, reactive JavaScript framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Type Safety**: TypeScript - Full type safety across the application
- **Authentication**: JWT decoding with proper type safety

## Project Structure

```
src/
├── config/                 # OAuth configuration and endpoints
│   └── oauth.ts            # Centralized OAuth config and URL builders
├── lib/                    # Utility functions
│   ├── storage.ts          # LocalStorage abstraction layer
│   ├── crypto.ts           # PKCE generation and cryptographic utilities
│   └── errors.ts           # Custom error types for better error handling
├── services/               # Business logic and API clients
│   └── oauth-client.ts     # OAuth 2.0 client implementation
├── types/                  # TypeScript type definitions
│   └── index.ts            # OAuth types (tokens, config, user info)
├── hooks/                  # Custom Solid hooks
│   └── auth.ts             # Main authentication hook with all OAuth functions
├── components/             # Reusable UI components
│   ├── Settings.tsx        # OAuth configuration form
│   ├── User.tsx            # User info display and token management
│   ├── TextInput.tsx       # Editable text input component
│   └── CopyTextInput.tsx   # Read-only input with copy functionality
├── pages/                  # Page components
│   ├── Home.tsx            # Main page (Settings or User based on auth state)
│   └── authz/
│       └── Callback.tsx    # OAuth callback handler
├── App.tsx                 # Root component
├── index.tsx               # Application entry point
├── index.css               # Global styles
└── routes.tsx              # Route definitions
```

## Architecture Improvements

### 1. **Separation of Concerns**
- **Config Layer**: All OAuth endpoints and constants centralized in `src/config/oauth.ts`
- **Service Layer**: OAuth API client isolated in `src/services/oauth-client.ts`
- **Storage Layer**: LocalStorage abstraction in `src/lib/storage.ts` for reusability
- **Utilities**: Crypto functions and error handling in dedicated modules

### 2. **Type Safety**
- Comprehensive TypeScript interfaces for all OAuth types
- Proper typing for tokens, user info, and configuration
- No generic `any` types - all data structures are properly typed

### 3. **Error Handling**
- Custom error classes (`OAuthError`, `TokenExchangeError`, `ValidationError`)
- Consistent error messaging across the application
- User-friendly error display in components

### 4. **Security Improvements**
- Uses `crypto.getRandomValues()` instead of `Math.random()` for secure random generation
- Proper PKCE implementation with SHA256 code challenges
- Secure state parameter generation

### 5. **Component Quality**
- Removed module-level side effects (moved to effect hooks)
- Proper state management with loading and error states
- Better UX with feedback during async operations (e.g., "Refreshing..." button state)

## Usage

### Configuration

1. **Set Your OAuth Server**: Enter the OAuth 2.0 authorization server URL
2. **Set Client ID**: Your registered OAuth client ID
3. **Set Scopes**: OAuth scopes (default: "openid offline")
4. **Callback URL**: Use the displayed callback URL in your OAuth server configuration

### Environment Variables

Create an `.env` file with:

```env
VITE_BASE_URL=http://localhost:5173
VITE_AUTH_URL=https://your-oauth-server.com
VITE_AUTH_CLIENT_ID=your-client-id
```

### Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## OAuth 2.0 PKCE Flow Explained

This application implements the Authorization Code flow with PKCE:

1. **User clicks "Continue"**: Application generates a code verifier and challenge
2. **Redirect to Authorization Server**: User is redirected to login and consent
3. **Callback**: Server redirects back with authorization code
4. **Token Exchange**: Application exchanges code for tokens (using code verifier)
5. **User Logged In**: Tokens are stored and user info is displayed
6. **Token Refresh**: User can refresh access tokens without re-authenticating
7. **Logout**: Clear tokens and redirect to logout endpoint

### Why PKCE?

PKCE (RFC 7636) adds a layer of security to the Authorization Code flow by:
- Preventing authorization code interception attacks
- Protecting against certain malware attacks
- Recommended even for confidential clients

## Key Functions

### Authentication Hook (`src/hooks/auth.ts`)

- `useLogin()` - Initiate OAuth login flow
- `useLogout()` - Clear tokens and logout
- `useRequestTokensByAuthorizationCode(code)` - Exchange authorization code for tokens
- `useRefreshToken()` - Refresh access token
- `useUserInfo()` - Fetch user information
- `useIsLogin()` - Check if user is authenticated
- `useAccessToken()` - Get current access token
- `useIDToken()` - Get current ID token
- `useReadRefreshToken()` - Get current refresh token

### OAuth Client Service (`src/services/oauth-client.ts`)

- `OAuthClient.getAuthorizationUrl()` - Build authorization URL with PKCE
- `OAuthClient.exchangeAuthorizationCode()` - Exchange code for tokens
- `OAuthClient.refreshAccessToken()` - Refresh token
- `OAuthClient.getUserInfo()` - Fetch userinfo endpoint
- `OAuthClient.getLogoutUrl()` - Build logout URL

## Testing with Custom OAuth Servers

This demo is designed to work with any OAuth 2.0 PKCE-compliant authorization server:

- **Google OAuth**: Configure with your Google Client ID
- **GitHub OAuth**: Configure with your GitHub OAuth App
- **Keycloak**: Deploy locally or use a hosted instance
- **Auth0**: Create an Auth0 application
- **Custom Servers**: Any RFC 6749 compliant OAuth server

Just update the configuration at runtime or in environment variables.

## Contributing

Found a bug or want to improve? Feel free to open an issue or submit a pull request!

## License

MIT

# Node
Backend

## Environment Variables
Create a `.env` file in the `hotel-backend` folder with at least the following keys:

```
PORT=5000
HOST=localhost
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173   # or your deployed frontend

# social auth credentials
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# twilio (for SMS OTPs)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

With these set, the helper modules will send e‑mails, SMS and support social login.

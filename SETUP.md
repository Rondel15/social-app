# Social App — Setup Guide

## Prerequisites
- Node.js v18+
- MongoDB running locally
- Cloudinary account (free at cloudinary.com)

---

## Step 1 — Install dependencies
```bash
cd social-app
npm install
```

---

## Step 2 — Set up environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/socialapp
NEXTAUTH_SECRET=any_long_random_string
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Get Cloudinary credentials:
1. Sign up free at cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

---

## Step 3 — Start MongoDB
```bash
brew services start mongodb-community
```

---

## Step 4 — Run the app
```bash
npm run dev
```

Open http://localhost:3000

---

## What's working out of the box

| Feature | Status |
|---|---|
| Register / Login | ✅ |
| Create posts (text, image, video) | ✅ |
| Like and comment on posts | ✅ |
| Friend feed (posts from friends only) | ✅ |
| Send / accept / decline friend requests | ✅ |
| User profiles with posts and friends | ✅ |
| Direct messages (friends only) | ✅ |
| Notifications (likes, comments, requests) | ✅ |
| Media uploads via Cloudinary | ✅ |
| People you may know sidebar | ✅ |

---

## Next features to build
1. Real-time messages with Socket.io (similar to chat app)
2. Real-time notifications
3. Stories (24hr disappearing posts)
4. Post sharing / repost
5. Search users by name
6. Edit profile / upload avatar
7. Mutual friends count
8. Post privacy settings (friends vs public)

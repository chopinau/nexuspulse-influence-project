# Backend Auth & Membership Testing

## Setup

1. Install dependencies:
   ```bash
   npm install next-auth @prisma/client @next-auth/prisma-adapter bcryptjs
   npm install -D prisma @types/bcryptjs ts-node
   ```

2. Initialize DB:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Seed Users:
   ```bash
   npx ts-node prisma/seed.ts
   ```

## Test Users

All users have the password: **`password123`**

| Email | Plan | Daily Limit | Notes |
|-------|------|-------------|-------|
| **`free@nexus.test`** | FREE | 1 / day | Should fail after 1 request |
| **`trial@nexus.test`** | TRIAL | 20 / day | Has access to paid features |
| **`paid@nexus.test`** | PAID | 100 / day | Full access |

## API Usage

When calling `POST /api/ai/summary`, the backend will now enforce:
1. Valid Session (Auth)
2. Plan Limits (Free vs Paid)
3. Trial Expiration (Auto-downgrade on access)

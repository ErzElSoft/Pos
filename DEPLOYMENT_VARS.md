# Railway Environment Variables Configuration

Copy these to your Railway dashboard under Environment Variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.abcdef.mongodb.net/pos_system?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRE=7d
CLIENT_URL=https://your-pos-app.vercel.app
DEFAULT_ADMIN_EMAIL=admin@pos.com
DEFAULT_ADMIN_PASSWORD=adminHell0!@#
DEFAULT_CASHIER_EMAIL=cashier@pos.com
DEFAULT_CASHIER_PASSWORD=adminHell0!@#
```

## MongoDB Atlas Setup (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Create database user
4. Get connection string
5. Replace MONGODB_URI above with your string

## Generate JWT Secret

Use this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
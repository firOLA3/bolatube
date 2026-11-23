# Backend deployment (Render)

The `render.yaml` Blueprint runs this API with `npm start` and checks
`/healthz`. The API waits for MongoDB before listening and exits if startup
configuration or the database connection fails.

1. Import the `bolatube` repository into Render as a Blueprint and deploy the
   service from `render.yaml`.
2. Set these values in the Render service environment. Do not commit them or
   paste them into chat.

   | Variable | Value |
   | --- | --- |
   | `MongoURI` | MongoDB Atlas connection string |
   | `JWT_SECRET` | A unique random secret of at least 32 characters |
   | `CORS_ORIGINS` | Exact Vercel site origin, e.g. `https://your-site.vercel.app`; comma-separate any other allowed origins |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Generate a production JWT secret locally with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste it directly into Render's `JWT_SECRET` setting and do not commit it.

3. In MongoDB Atlas, allow the Render service's outbound IP addresses in
   Network Access and ensure its database user has access to the application
   database. Avoid opening database access to all IPs unless you have
   deliberately accepted that risk.
4. In Vercel, set `VITE_API_URL` to the Render service's public URL, without a
   trailing slash.
5. After both services are deployed, test the Render URL's `/healthz` endpoint
   and try signup, login, and an avatar upload from the Vercel site.

Create a Cloudinary account and use its credentials for the three Cloudinary
variables. Avatar uploads use Cloudinary in production; local development
continues to store uploads under `uploads/avatars`.

Welcome emails are optional. To enable them, set both `MAIL_USER` and
`MAIL_PASS` in Render to a Gmail account and its app password. If either is
unset, signup still works but no welcome email is sent. The previously
hardcoded mail credential must be revoked and replaced.

`DNS_SERVERS` is only for the local DNS workaround. Do not set it on Render
unless the hosting provider's DNS requires it. Render supplies `PORT`
automatically.

For local development, copy `.env.example` to `.env` and fill in local values.
Never commit `.env` or use production secrets in a public repository.

### Tech Stack

The project uses Express and MongoDB for the backend. Cron jobs are handled with cron, while emails are sent using Nodemailer. For handling file uploads, we use Multer, and CSV parsing is done with csv-parser. JWT is used for authentication.

---

### Running Locally

All the env vars are kept in `.env.template` only incase it is needed locally for review.

1. **With pnpm:**
   ```sh
   pnpm install && pnpm run dev
   ```
2. **With Docker:**
   ```sh
   docker build . -t task
   docker run -p 8080:8080 task
   ```

### Admin

Seed admin with:

```sh
pnpm run seed:admin
```

Admin credentials:

- Email: `sibendra619@gmail.com`
- Password: `admin`

### Customer

Example customer:

- Email: `tester@gmail.com`
- Password: `Test@123`

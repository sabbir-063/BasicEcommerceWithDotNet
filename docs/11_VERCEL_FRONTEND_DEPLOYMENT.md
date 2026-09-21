# Deploying the frontend to Vercel

The repository-level `vercel.json` configures Vercel to install and build the
Vite application in `front/`, publish `front/dist`, and serve `index.html` for
client-side routes.

## Vercel project settings

1. Import this repository into Vercel.
2. Keep the project Root Directory set to the repository root (`.`). The build
   and output paths are already configured in `vercel.json`.
3. Add this environment variable for Production, Preview, and Development as
   appropriate:

   ```env
   VITE_API_BASE_URL=https://YOUR-BACKEND-HOST/api
   ```

4. Deploy the project.
5. Add the final Vercel origin to the backend CORS configuration and redeploy
   the backend. For example:

   ```env
   Cors__AllowedOrigins__0=https://YOUR-PROJECT.vercel.app
   ```

`VITE_API_BASE_URL` is included in the browser bundle, so it must not contain
secrets. Do not add database credentials, JWT secrets, Cloudinary secrets, or
admin credentials to the Vercel frontend project.

The rewrite in `vercel.json` ensures that directly opening React routes (for
example, `/products/123`) loads the SPA instead of returning a Vercel 404.

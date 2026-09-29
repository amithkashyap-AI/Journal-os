# Hostinger Shared Hosting Deployment Guide

This guide walks you through deploying **Research Publishing OS** to **Hostinger Shared Web Hosting (hPanel)**.

---

## 1. Technical Architecture & Constraints on Hostinger Shared

| Feature | Hostinger Shared Hosting Reality | Our Solution |
| :--- | :--- | :--- |
| **Database** | Shared hosting **only supports MySQL**. PostgreSQL is not available locally. | Connect to a **100% Free Serverless PostgreSQL** database ([Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)). |
| **Process Model** | Background processes & custom external TCP ports (4000–4007) are blocked by CloudLinux LVE. | We use a **Unified Hostinger Server** (`server.js`), which runs internal microservices on internal loopbacks and routes Next.js + API Gateway through a single port assigned by Passenger. |
| **Node.js Runtime** | Configured via **hPanel > Advanced > Node.js** using CloudLinux Phusion Passenger. | Configured with `Application startup file: server.js` running Node.js 20.x or 22.x. |

---

## Step 1: Create a Free Cloud PostgreSQL Database (2 Minutes)

Since Hostinger Shared Hosting does not offer PostgreSQL, use **Neon.tech** (free forever, serverless Postgres, automated SSL):

1. Go to [https://neon.tech](https://neon.tech) and sign up (free with GitHub/Google).
2. Click **Create Project**, choose a project name (e.g. `rpos-db`), and select the region closest to your Hostinger server (e.g. Europe or US).
3. Copy the pooled connection string shown on your dashboard:
   ```text
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

---

## Step 2: Run Database Migrations & Seed Dummy Data

Before deploying files to Hostinger, apply all schema migrations and initial seed data to your Neon cloud database from your computer:

```bash
# 1. Export your remote Neon connection string
export DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# 2. Run all 15 database migrations
pnpm --filter @rpos/database migrate:deploy

# 3. Seed initial 10 journals, 10 conferences, 50 papers, and default users
pnpm --filter @rpos/database seed
```

> **Result:** Your cloud database now has all tables, composite indexes, and demo users ready for production.

---

## Step 3: Package the Application for Hostinger

We have included a build and packaging script that bundles the pre-compiled code, Next.js standalone assets, and the unified `server.js` startup file into a single zip archive:

```bash
./scripts/package-hostinger.sh
```

This creates a file named **`rpos-hostinger-deploy.zip`** in your project root.

---

## Step 4: Upload to Hostinger

You can deploy using either **Option A (Git)** or **Option B (File Manager Zip)**:

### Option A: Via Hostinger File Manager (Simplest)
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Websites** → select your domain → **Files** → **File Manager**.
3. Navigate into `public_html`.
4. Upload `rpos-hostinger-deploy.zip`.
5. Right-click the uploaded zip file and select **Extract** directly into `public_html`.

### Option B: Via Git in hPanel
1. Push your repository to your private GitHub or GitLab account.
2. In hPanel, go to **Advanced** → **Git**.
3. Create a repository connection:
   - **Repository URL**: `https://github.com/your-username/research-publishing-os.git`
   - **Branch**: `main`
   - **Install directory**: `public_html`
4. Click **Deploy**.

---

## Step 5: Configure Node.js in Hostinger hPanel

1. In hPanel, navigate to **Advanced** → **Node.js** (or search "Node.js" in the top bar).
2. Click **Create Application** (or Edit existing):
   - **Node.js version**: `20.x` or `22.x`
   - **Application mode**: `Production`
   - **Application root**: `public_html` (or `domains/yourdomain.com/public_html`)
   - **Application URL**: `yourdomain.com`
   - **Application startup file**: `server.js`
3. Click **Create** / **Save**.

---

## Step 6: Set Production Environment Variables

In your `public_html` directory, create or edit the `.env` file with your production values:

```env
NODE_ENV=production
PORT=3000

# Remote Cloud PostgreSQL (From Step 1)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Security Keys (Minimum 32 characters for JWT_SECRET)
JWT_SECRET=production_ultra_secure_jwt_secret_key_9921_at_least_32_chars
JWT_EXPIRES_IN=7d
INTERNAL_API_SECRET=production_internal_microservice_secret_token_8812

# Storage
STORAGE_DIR=storage/manuscripts
LOG_LEVEL=info
```

---

## Step 7: Install Production Dependencies & Start

1. In hPanel, go to **Advanced** → **SSH Access** and enable it if not already enabled.
2. Connect to your Hostinger terminal via SSH or use the hPanel Web Terminal:
   ```bash
   cd public_html
   npm install --production --ignore-scripts
   ```
3. Return to **Node.js** in hPanel and click **Restart Application**.

---

## Step 8: Verify Your Deployment

Open your browser and verify the health endpoints:

1. **System Health**: `https://yourdomain.com/health`
   * Should return: `{"status":"ok","service":"api-gateway",...}`
2. **Subsystem Services**: `https://yourdomain.com/health/services`
   * Should return:
     ```json
     {
       "status": "ok",
       "services": {
         "auth": "ok",
         "submission": "ok",
         "review": "ok",
         "notification": "ok",
         "journal": "ok",
         "files": "ok"
       }
     }
     ```
3. **Web Portal**: Visit `https://yourdomain.com` to see the full Research Publishing OS portal.

---

## Production Credentials (from Seed Data)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Superadmin** | `superadmin@rpos.dev` | `superadmin123` |
| **Admin** | `admin@rpos.dev` | `admin123` |
| **Lead Editor** | `editor.ai@rpos.dev` | `editor123` |
| **Reviewer** | `reviewer@rpos.dev` | `reviewer123` |
| **Author** | `author@rpos.dev` | `author123` |
| **Publisher** | `publisher@rpos.dev` | `publisher123` |

---

## Troubleshooting on Hostinger

* **503 Service Unavailable / Passenger Error**:
  Check error logs in hPanel under **Logs** or inside `public_html/stderr.log`. Usually caused by missing environment variables (`DATABASE_URL`) or an outdated Node version (ensure 20.x or 22.x is selected).
* **Database Connection Timeout (`P1001`)**:
  Ensure `?sslmode=require` is at the end of your Neon/Supabase `DATABASE_URL`, as cloud PostgreSQL requires encrypted connections.
* **Storage Permissions**:
  Ensure `public_html/storage/manuscripts` directory has write permissions (`chmod 755 storage/manuscripts`).

# Deploy to GitHub Pages (Free Hosting)

This dashboard is a static site — no build step needed. Follow these steps to host it for free on GitHub Pages.

## Prerequisites

- A GitHub account (free)
- Git installed on your computer

---

## Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `ops-dashboard` (or any name you like)
3. Set visibility to **Public** (or Private — Pages works on both)
4. Click **Create repository**

## Step 2: Push Your Code

Open a terminal in the `ops-dashboard` folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ops-dashboard.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. In the left sidebar, click **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and folder `/ (root)`
6. Click **Save**

## Step 4: Access Your Dashboard

- Wait 1–2 minutes for deployment
- Your dashboard will be live at:
  ```
  https://YOUR_USERNAME.github.io/ops-dashboard/
  ```

## Updating

After making changes locally:

```bash
git add .
git commit -m "Update dashboard"
git push
```

GitHub Pages will automatically redeploy within 1–2 minutes.

---

## Alternative Hosting Options

### Cloudflare Pages

1. Push code to GitHub (steps 1–2 above)
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
3. Click **Create a project** → **Connect to Git**
4. Select your repo, click **Begin setup**
5. Under **Build settings**, set:
   - Build command: (leave empty)
   - Build output directory: `/` (root)
6. Click **Save and Deploy**

### Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag and drop the `ops-dashboard` folder onto the deploy area
3. Or connect your GitHub repo with build command empty and publish directory `/`

All three options are free and will host the site as long as your account exists.

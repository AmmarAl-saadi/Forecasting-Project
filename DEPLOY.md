# Deploying to GitHub Pages

## First-time setup

1. Push this repository to GitHub (see below).
2. Go to **Settings → Pages** in your repo.
3. Under **Source**, choose **Deploy from a branch**.
4. Select branch `main` (or `master`) and folder `/ (root)`.
5. Click **Save**.

GitHub Pages will publish the site at:
```
https://<your-username>.github.io/<repo-name>/
```

## Push / update

```bash
git add index.html README.md DEPLOY.md
git commit -m "Update ops dashboard"
git push origin main
```

Changes go live within ~60 seconds of the push.

## Updating data month-over-month

No re-deploy needed. Open the live page, click the upload zone, and drop in the new workbook. All processing is client-side.

If you want the new month's data permanently embedded (so the page loads with it by default), update the `EMBEDDED_DATA` constant in `index.html` and push again.

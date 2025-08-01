# GitHub Setup Instructions

## 1. Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `turkcell-call-analytics`
3. Description: "AI-powered call analytics dashboard for Turkcell customer service"
4. Make it **Public**
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

## 2. Push Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/turkcell-call-analytics.git

# Push your code
git branch -M main
git push -u origin main
```

## 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. The workflow will automatically run when you push code

## 4. Access Your Site

After the workflow completes (usually takes 2-3 minutes), your site will be available at:

```
https://YOUR_USERNAME.github.io/turkcell-call-analytics/
```

## 5. Environment Variables (Optional)

Since we're using VITE_DEMO_MODE=true in the GitHub Actions workflow, the app will run in demo mode on GitHub Pages. 

If you want to use real API keys in production, you can:
1. Go to Settings → Secrets and variables → Actions
2. Add repository secrets for:
   - `VITE_ELEVENLABS_API_KEY`
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Then update the workflow to use these secrets.

## Notes

- The GitHub Actions workflow will automatically deploy on every push to main branch
- The site uses demo mode by default (no real API calls)
- All sensitive API keys are already embedded in the code for development
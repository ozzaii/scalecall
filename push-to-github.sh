#!/bin/bash

echo "🚀 Pushing to GitHub..."
echo ""
echo "Please enter your GitHub username:"
read GITHUB_USERNAME

echo ""
echo "Setting up remote repository..."
git remote add origin https://github.com/$GITHUB_USERNAME/turkcell-call-analytics.git

echo "Pushing code to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "Your site will be available at:"
echo "https://$GITHUB_USERNAME.github.io/turkcell-call-analytics/"
echo ""
echo "Note: It may take 2-3 minutes for the site to be deployed."
echo "You can check the deployment status in the Actions tab of your repository."
# PowerShell Deploy Script for GitHub Pages and Source
# Usage: ./deploy.ps1 -Message "Your commit message"
param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

function Write-Section($msg) {
    Write-Host "`n==== $msg ====" -ForegroundColor Cyan
}

# 1. Commit and push source code to source branch
Write-Section "Committing and pushing source code to source branch..."
git add .
if (-not (git diff --cached --quiet)) {
    git commit -m $Message
    git push origin source
    Write-Host "Source code pushed to source branch." -ForegroundColor Green
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# 2. Pull latest changes (optional safety)
Write-Section "Pulling latest changes from source..."
git pull origin source

# 3. Build the app
Write-Section "Building the app..."
npm install
npm run build

# 4. Deploy build to gh-pages branch using gh-pages package
Write-Section "Deploying build to gh-pages branch..."
npm run deploy

Write-Host "`nDeployment complete!" -ForegroundColor Green

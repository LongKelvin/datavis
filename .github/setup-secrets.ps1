# ─────────────────────────────────────────────────────────────────────────────
# DataVis — One-time GitHub Secrets + Environment Setup
# Run this script ONCE from a machine with direct internet access (no proxy).
#
# Prerequisites:
#   1. gh CLI installed  (choco install gh)
#   2. Logged in         (gh auth login)
#   3. Vercel account + project already created on vercel.com
#
# How to get the 3 Vercel values:
#   VERCEL_TOKEN      → vercel.com/account/tokens  → Create Token
#   VERCEL_ORG_ID     → vercel.com/account          → Settings → General → Team ID
#                       (for personal accounts, run: vercel whoami --token <TOKEN>
#                        and then: vercel teams ls)
#   VERCEL_PROJECT_ID → vercel.com/<org>/<project>  → Settings → General → Project ID
#                       (or run: vercel link  inside the /src folder)
# ─────────────────────────────────────────────────────────────────────────────

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelToken,

    [Parameter(Mandatory=$true)]
    [string]$VercelOrgId,

    [Parameter(Mandatory=$true)]
    [string]$VercelProjectId
)

$REPO = "LongKelvin/datavis"
$REVIEWER_ID = 48915642   # LongKelvin

Write-Host "`n==> Setting GitHub Actions secrets for $REPO ..." -ForegroundColor Cyan

# 1. Set the 3 Vercel secrets
gh secret set VERCEL_TOKEN       --body $VercelToken    --repo $REPO
gh secret set VERCEL_ORG_ID      --body $VercelOrgId    --repo $REPO
gh secret set VERCEL_PROJECT_ID  --body $VercelProjectId --repo $REPO

Write-Host "`n==> Creating 'production' environment with required reviewer ..." -ForegroundColor Cyan

# 2. Create the production environment with LongKelvin as required reviewer
$body = @{
    reviewers = @(
        @{ type = "User"; id = $REVIEWER_ID }
    )
    deployment_branch_policy = $null
} | ConvertTo-Json -Depth 5

$tmpFile = [System.IO.Path]::GetTempFileName()
$body | Out-File -FilePath $tmpFile -Encoding utf8 -NoNewline
gh api --method PUT `
    -H "Accept: application/vnd.github+json" `
    "/repos/$REPO/environments/production" `
    --input $tmpFile
Remove-Item $tmpFile

Write-Host "`n==> Done! Verify at: https://github.com/$REPO/settings/environments" -ForegroundColor Green
Write-Host "    Secrets:       https://github.com/$REPO/settings/secrets/actions" -ForegroundColor Green

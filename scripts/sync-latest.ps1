param(
    [string]$RepositoryRoot = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = 'Stop'

Set-Location $RepositoryRoot

if (-not (Test-Path '.git')) {
    throw 'This folder is not a Git repository.'
}

function Get-GitExecutable {
    $candidates = @()
    $gitCommand = Get-Command git -ErrorAction SilentlyContinue
    if ($gitCommand) {
        $candidates += $gitCommand.Source
    }
    $candidates += 'C:\Program Files\Git\cmd\git.exe'
    $candidates += 'C:\Program Files\Git\bin\git.exe'

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw 'Git executable was not found. Install Git or add it to PATH.'
}

function Get-NodeExecutable {
    $candidates = @()
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCommand) {
        $candidates += $nodeCommand.Source
    }
    $candidates += 'C:\Program Files\nodejs\node.exe'

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw 'Node.js executable was not found. Install Node.js to synchronize workspace dependencies.'
}

function Get-CorepackScript {
    param(
        [string]$NodeExecutable
    )

    $candidate = Join-Path (Split-Path $NodeExecutable -Parent) 'node_modules\corepack\dist\corepack.js'
    if (Test-Path $candidate) {
        return $candidate
    }

    throw 'Corepack was not found with Node.js. Install pnpm, then run pnpm install manually.'
}

$git = Get-GitExecutable

function Get-PorcelainStatus {
    return & $git status --porcelain
}

Write-Host 'Checking current branch...'
$branch = (& $git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Current branch: $branch"

Write-Host 'Checking for local changes...'
$status = Get-PorcelainStatus
$hadStash = $false
if ($status) {
    Write-Host 'Local changes detected. Temporarily stashing them before pull...'
    & $git stash push --include-untracked --quiet --message 'sync-latest auto-stash'

    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to create an automatic stash. Please stash or commit your changes manually, then run sync again.'
    }

    $hadStash = $true
}

Write-Host 'Pulling latest changes from origin...'
& $git pull --ff-only origin $branch

if ($LASTEXITCODE -ne 0) {
    throw 'Git pull failed.'
}

Write-Host 'Synchronizing workspace dependencies...'
$node = Get-NodeExecutable
$corepack = Get-CorepackScript -NodeExecutable $node
& $node $corepack pnpm install --frozen-lockfile

if ($LASTEXITCODE -ne 0) {
    throw 'Workspace dependency installation failed.'
}

if ($hadStash) {
    Write-Host 'Local changes were preserved in the stash so the sync could finish safely.'
    Write-Host 'Use git stash list and git stash pop when you are ready to reapply them.'
}

Write-Host 'Sync complete.'

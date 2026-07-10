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

$git = Get-GitExecutable

Write-Host 'Checking current branch...'
$branch = (& $git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Current branch: $branch"

Write-Host 'Pulling latest changes from origin...'
& $git pull --ff-only origin $branch

Write-Host 'Sync complete.'
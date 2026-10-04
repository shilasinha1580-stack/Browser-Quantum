# PowerShell script to prepare Real Standalone Mozilla Gecko Runtime for Windows x64 and x86
param (
    [string]$Arch = "both" # "x64", "x86", or "both"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host "Preparing Real Standalone Mozilla Gecko Runtime for Windows"
Write-Host "=========================================================="

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = (Get-Item "$scriptDir\..\..").FullName

$targets = @()
if ($Arch -eq "x64" -or $Arch -eq "both") {
    $targets += @{
        Name = "x64"
        Url = "https://ftp.mozilla.org/pub/firefox/releases/115.15.0esr/win64/en-US/Firefox%20Setup%20115.15.0esr.exe"
        DestDir = "$scriptDir\bin\x64"
        TempExe = "$scriptDir\gecko-setup-x64.exe"
    }
}
if ($Arch -eq "x86" -or $Arch -eq "both") {
    $targets += @{
        Name = "x86"
        Url = "https://ftp.mozilla.org/pub/firefox/releases/115.15.0esr/win32/en-US/Firefox%20Setup%20115.15.0esr.exe"
        DestDir = "$scriptDir\bin\x86"
        TempExe = "$scriptDir\gecko-setup-x86.exe"
    }
}

foreach ($t in $targets) {
    Write-Host "Processing $($t.Name) standalone Gecko runtime..."
    New-Item -ItemType Directory -Force -Path $t.DestDir | Out-Null

    if (-not (Test-Path $t.TempExe)) {
        Write-Host "Downloading Mozilla Gecko standalone build for $($t.Name)..."
        Invoke-WebRequest -Uri $t.Url -OutFile $t.TempExe -UseBasicParsing
    }

    $tempExtract = "$scriptDir\temp_extract_$($t.Name)"
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract }
    New-Item -ItemType Directory -Force -Path $tempExtract | Out-Null

    Write-Host "Extracting Gecko core package with 7-Zip..."
    & 7z x $t.TempExe "-o$tempExtract" -y | Out-Null

    $coreDir = "$tempExtract\core"
    if (-not (Test-Path $coreDir)) {
        throw "Failed to extract Gecko core directory for $($t.Name)"
    }

    # Copy extracted core files to bin/<arch>
    Copy-Item "$coreDir\*" -Destination $t.DestDir -Recurse -Force
    Remove-Item -Recurse -Force $tempExtract

    # Rename firefox.exe to quantum.exe
    if (Test-Path "$($t.DestDir)\firefox.exe") {
        Move-Item -Path "$($t.DestDir)\firefox.exe" -Destination "$($t.DestDir)\quantum.exe" -Force
    }

    # Configure distribution policies and bundled uBlock Origin
    $distExtDir = "$($t.DestDir)\distribution\extensions"
    New-Item -ItemType Directory -Force -Path $distExtDir | Out-Null
    Copy-Item "$rootDir\desktop\common\policies.json" "$($t.DestDir)\distribution\policies.json" -Force
    Copy-Item "$rootDir\desktop\common\extensions\uBlock0@raymondhill.net.xpi" "$distExtDir\uBlock0@raymondhill.net.xpi" -Force
    Copy-Item "$rootDir\public\logo.ico" "$($t.DestDir)\logo.ico" -Force

    # Verify standalone Gecko engine presence
    if (-not (Test-Path "$($t.DestDir)\quantum.exe")) { throw "Missing $($t.DestDir)\quantum.exe" }
    if (-not (Test-Path "$($t.DestDir)\xul.dll")) { throw "Missing $($t.DestDir)\xul.dll (Gecko Engine)" }
    if (-not (Test-Path "$distExtDir\uBlock0@raymondhill.net.xpi")) { throw "Missing bundled uBlock Origin in $($t.Name)" }

    Write-Host "✅ Real standalone Mozilla Gecko runtime for $($t.Name) prepared in: $($t.DestDir)"
}

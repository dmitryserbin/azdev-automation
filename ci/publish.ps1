[CmdletBinding()]
Param
(
    [ValidateNotNullOrEmpty()]
    [Parameter(Mandatory=$True)]
    [String]$Token,

    [Parameter(Mandatory=$False)]
    [String]$Registry = "registry.npmjs.org",

    [Parameter(Mandatory=$False)]
    [String]$PackageDirectory = $PSScriptRoot
)

try
{
    $PackageJson = Join-Path -Path $PackageDirectory -ChildPath package.json

    if (-not (Test-Path -Path $PackageJson))
    {
        throw "File <$PackageJson> not found"
    }

    $Name = & node -p "require('./package.json').name"
    $Version = & node -p "require('./package.json').version"

    if (-not $Name)
    {
        throw "Unable to detect package name"
    }

    if (-not $Version)
    {
        throw "Unable to detect package version"
    }

    $ExistingPackage = & npm view $Name@$Version

    if ($ExistingPackage)
    {
        Write-Output "Package <$Name> version <$Version> already exist"

        return
    }

    Write-Output "Creating new <$Name> package <$Version> version"

    $NewPackage = & npm pack --prefix $PackageDirectory

    Write-Output "Publishing <$NewPackage> package to repository"

    if (-not (Test-Path -Path $NewPackage))
    {
        throw "File <$NewPackage> not found"
    }

    # Generate NPM credentials
    ("//{0}/:_authToken={1}" -f $Registry, $Token) | Out-File `
        -FilePath (Join-Path -Path $PackageDirectory -ChildPath .npmrc) `
        -ErrorAction Stop

    & npm publish $NewPackage
}
catch
{
    throw
}

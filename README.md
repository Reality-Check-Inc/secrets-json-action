# secrets-json-action
github action to replace secrets in appsettings.json

This action get the current unix time stamp and tag as a version

## Inputs

### `tz`

The tz string in unix format.  Defaults to `America/Denver`

### `secrets`

The secrets.json contents from a repository secret.

`secrets.json` is the output from UserSecrets for .Net.  This is what is used
in the test.

```json
{
  "WeatherApi:ApiKey": "key",
  "ArcGIS:LicenseKey": "key",
  "ArcGIS:ApiKey": "key"
}
```

### `appsettings`

The path to the project `appsettings.json` file with an AppConfig object.

Standard AppConfig values updated are:

| Variable            | Description |
|---------------------|-------------|
| {BuildVersion} | Version from tag  |
| {BuildFlavor} | Build flavor as passed in from the action  |
| {BuildTimeStamp} | Current build unix time stamp in UTC  |
| {BuildDate} | Current build date string  |
| {BuildDateTime} | Current build date & time string  |

`appsettings.json` is the configuration file for Maui apps.  This is what is used in the test.

```json
{
  "AppConfig": {
    "AppName": "Something",
    "BuildDate": "{BuildDate}",
    "BuildDateTime": "{BuildDateTime}",
    "BuildTimeStamp": "{BuildTimeStamp}",
    "Version": "{BuildVersion}",
    "Flavor": "{BuildFlavor}",
    "ApplicationInsights": {
      "ConnectionString": ""
    },
    "WeatherApi": {
      "BaseUrl": "http://api.weatherapi.com",
      "ApiKey": "{WeatherApi:ApiKey}",
      "ApiVersion": "v1"
    },
    "ArcGIS": {
      "LicenseKey": "{ArcGIS:LicenseKey}",
      "ApiKey": "{ArcGIS:ApiKey}"
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

### `csproj`

The path to the project `.csproj` file.  The `ApplicationDisplayVersion` value will be replaced with `BuildVersion`, while the `ApplicationVersion` value will be replaced with `BuildTimeStamp`.

```xml
<!-- Versions -->
<ApplicationDisplayVersion>1.0.0.2</ApplicationDisplayVersion>
<ApplicationVersion>1</ApplicationVersion>
```

### `manifest`

The path to the Windows platform `Package.appxmanifest` file.  The `Identity` `Version` attribute value will be replaced with `BuildVersion`.

```xml
<Identity
  Name="companyname.mauiapp"
  Publisher="CN=Reality, C=US"
  Version="1.0.0.2" />
```

### `buildversion`

The build version if coming from a repository variable, such as `${{ vars.BUILDVERSION }}`

### `buildflavor`

The build flavor, such as windows, macos, ios. Replaces {BuildFlavor} in appsettings.json with this value.

## Outputs

### `version`

Build version from tag

### `timestamp`

Build unix timestamp, always in UTC

### `date`

Build date string

### `datetime`

Build date & time string

## Example usage

```yaml
- name: Update appsettings, csproj and appxmanifest
  id: info
  uses: Reality-Check-Inc/secrets-json-action@v1.9.31
  with:
    secrets: ${{ secrets.SECRETS_JSON }}
    appsettings: "${{ env.AppSettings_Path }}"
    asbuildflavor: "Flavor"
    asbuildversion: "Version"
    asbuilddate: "BuildDate"
    asbuildtimestamp: "BuildTimeStamp"
    csproj: "${{ env.Project_Path }}"
    manifest: "${{ env.Manifest_Path }}"
    buildversion: "${{ vars.BUILDVERSION }}"
    buildflavor: Windows
    printDirectory: false
    printFile: true
  env:
    GH_TOKEN: ${{ secrets.PAT }}

# By default, Linux runners use the bash shell,
# so you must use the syntax $NAME.
# By default, Windows runners use PowerShell,
# so you would use the syntax $env:NAME
# Use the output from the `info` step
- name: Set variables
  run: |
    gh variable set BUILDVERSION --body "${{ steps.info.outputs.version }}"
    echo "build_version=${{ steps.info.outputs.version }}" | Out-File -FilePath $env:GITHUB_ENV -Append
    echo "build_timestamp=${{ steps.info.outputs.timestamp }}" | Out-File -FilePath $env:GITHUB_ENV -Append
    echo "build_date=${{ steps.info.outputs.date }}" | Out-File -FilePath $env:GITHUB_ENV -Append
  env:
    GH_TOKEN: ${{ secrets.PAT }}

- name: Show the variables
  run: |
    echo "${{ env.build_version }}"
    echo "${{ env.build_timestamp }}"
    echo "${{ env.build_date }}"    
```

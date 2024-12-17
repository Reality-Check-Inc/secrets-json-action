# secrets-json-action
github action to replace secrets in appsettings.json

This action get the current unix time stamp and tag as a version

## Inputs

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

The path to the appsettings.json file.

Standard values updated are:

| Variable            | Description |
|---------------------|-------------|
| {BuildVersion} | Version from tag  |
| {BuildFlavor} | Build flavor as passed in from the action  |
| {BuildTimeStamp} | Current build unix time stamp  |
| {BuildDate} | Current build in UTC date string  |

### `flavor`

The build flavor, such as windows, macos, ios. Replaces {BuildFlavor} in appsettings.json with this value.

## Outputs

### `version`

Build version from tag

### `timestamp`

Build unix timestamp

### `date`

Build date string


## Example usage

```yaml
- name: Update Secrets in AppSettings.json
  id: info
  uses: Reality-Check-Inc/secrets-json-action@v1.9
  with:
    secrets: ${{ secrets.SECRETS_JSON }}
    appsettings: test_data/appsettings.json
    flavor: macOS
  env:
    GH_TOKEN: ${{ secrets.PAT }}
```

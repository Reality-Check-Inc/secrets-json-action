# secrets-json-action
github action to replace secrets in appsettings.json

This action get the current unix time stamp and tag as a version

## Inputs

### `secrets`

The secrets.json contents from a repository secret.

### `appsettings`

The path to the appsettings.json file.

### `flavor`

The build flavor, such as windows, macos, ios. Replaces {BuildFlavor} in appsettings.json with this value.

## Outputs

None

## Example usage

```yaml
- name: Update Secrets in AppSettings.json
  uses: Reality-Check-Inc/secrets-json-action@v1
  with:
    secrets: ${{ secrets.SECRETS_JSON }}
    appsettings: test_data/appsettings.json
    flavor: Windows
  env:
    GH_TOKEN: ${{ secrets.PAT }}   
```

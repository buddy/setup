# Buddy Setup Action

GitHub Action for installing BDY CLI for Buddy CI/CD platform.

## Features

- Automatically installs BDY CLI if not already installed
- Fetches latest version from specified environment channel (prod/dev)
- Supports multiple installation methods (download, APT, NPM)
- Configurable version selection or auto-fetch latest
- Skip installation if already installed

## Usage

### Basic Usage (Latest from prod)
```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
```

### Specify Environment Channel
```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
  with:
    env: 'dev'  # or 'prod' (default)
```

### Specify Exact Version
```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
  with:
    version: '1.16.4'
    env: 'prod'
```

### All Options
```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
  with:
    # Environment channel (default: prod)
    env: 'prod'

    # Specific version (optional, fetches latest if not specified)
    version: '1.16.4'

    # Installation method: download, apt, or npm (default: download)
    installation_method: 'download'

    # Skip installation if BDY CLI is already installed (default: true)
    skip_if_installed: 'true'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `env` | Environment channel (`prod`, `dev`, etc.) | No | `prod` |
| `version` | BDY CLI version to install. If not specified, fetches latest from the specified channel | No | Auto-fetched |
| `installation_method` | Installation method (`download`, `apt`, or `npm`) | No | `download` |
| `skip_if_installed` | Skip installation if BDY CLI is already installed | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `bdy_version` | The installed BDY CLI version |
| `bdy_path` | Path to the BDY CLI binary |

## Environment Variables

The action exports the following environment variables for use in subsequent steps:

| Variable | Description |
|----------|-------------|
| `BDY_VERSION` | The installed BDY CLI version |
| `BDY_PATH` | Path to the BDY CLI binary |

**Example usage:**
```yaml
- name: Check installed version
  run: echo "Installed BDY CLI version: $BDY_VERSION"
```

## Installation Methods

### Download (Default)
Downloads the BDY CLI binary directly from the official repository and extracts it to `/usr/local/bin/`. Supports all environments and specific versions.

```yaml
- uses: buddy/setup@v1
  with:
    installation_method: 'download'
    env: 'prod'
    version: '1.16.4'  # optional
```

### APT
Installs BDY CLI using the APT package manager (Ubuntu/Debian). Uses the Buddy APT repository for the specified environment.

```yaml
- uses: buddy/setup@v1
  with:
    installation_method: 'apt'
    env: 'prod'
```

### NPM
Installs BDY CLI using NPM. For `prod` environment, installs latest stable. For other environments, uses NPM dist-tags.

```yaml
- uses: buddy/setup@v1
  with:
    installation_method: 'npm'
    env: 'dev'  # installs bdy@dev
```

## Example Workflows

### Production Deployment
```yaml
name: Deploy with Buddy

on: [push, workflow_dispatch]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup BDY CLI
        uses: buddy/setup@v1

      - name: Verify installation
        run: |
          echo "BDY CLI version: $BDY_VERSION"
          echo "BDY CLI path: $BDY_PATH"

      - name: Login to Buddy
        uses: buddy/login@v1
        with:
          token: ${{ secrets.BUDDY_TOKEN }}

      - name: Run deployment
        run: bdy deploy
```

### Development Testing
```yaml
name: Test with Dev CLI

on: [pull_request, workflow_dispatch]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup BDY CLI (dev channel)
        uses: buddy/setup@v1
        with:
          env: 'dev'

      - name: Run tests
        run: bdy test
```

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

# Buddy Setup Action

GitHub Action for installing BDY CLI for the Buddy CI/CD platform.

## Features

- Automatically installs BDY CLI if not already installed
- Fetches latest version from the specified environment channel (e.g. prod, dev)
- Supports multiple installation methods (`download`, `apt`, `npm`)
- Configurable version selection or auto-fetch latest
- Skip installation if already installed

## Usage

### Basic (latest from prod)

```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
```

### Pick a channel

```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
  with:
    env: 'dev'
```

### Pin a version

```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
  with:
    version: '1.16.4'
    env: 'prod'
```

### All options

```yaml
- name: Setup BDY CLI
  uses: buddy/setup@v1
  with:
    env: 'prod' # default: prod
    version: '1.16.4' # default: latest from env
    installation_method: 'download' # download | apt | npm; default: download
    skip_if_installed: 'true' # default: true
```

## Inputs

| Input                 | Description                                                                   | Required | Default    |
| --------------------- | ----------------------------------------------------------------------------- | -------- | ---------- |
| `env`                 | Environment channel (`prod`, `dev`, `beta`, `stage`, `master`)                | No       | `prod`     |
| `version`             | BDY CLI version to install. If not specified, fetches latest from the channel | No       | (latest)   |
| `installation_method` | Installation method (`download`, `apt`, or `npm`)                             | No       | `download` |
| `skip_if_installed`   | Skip installation if BDY CLI is already installed                             | No       | `true`     |

## Outputs

| Output        | Description                   |
| ------------- | ----------------------------- |
| `bdy_version` | The installed BDY CLI version |
| `bdy_path`    | Path to the BDY CLI binary    |

## Environment variables

The action exports the following env vars for subsequent steps:

| Variable      | Description                   |
| ------------- | ----------------------------- |
| `BDY_VERSION` | The installed BDY CLI version |
| `BDY_PATH`    | Path to the BDY CLI binary    |

```yaml
- name: Check installed version
  run: echo "Installed BDY CLI version: $BDY_VERSION"
```

## Platform support

| Platform | Architecture | Installation methods     |
| -------- | ------------ | ------------------------ |
| Linux    | x64, arm64   | `download`, `apt`, `npm` |
| macOS    | arm64        | `download`, `npm`        |
| Windows  | x64          | `download`, `npm`        |

### Download (default)

Downloads the BDY CLI binary from `https://es.buddy.works/bdy/<env>/<version>/...` and extracts it to `/usr/local/bin/` (Linux/macOS) or `~/.bdy/` (Windows).

### APT

Linux only. Adds the Buddy APT repository (with GPG key) for the chosen `env` channel and installs `bdy` via `apt-get`.

### NPM

Installs globally via npm. Resolution:

- `version` set, `env: prod` → `npm i -g bdy@<version>` (e.g. `bdy@1.22.25`)
- `version` set, other `env` → `npm i -g bdy@<version>-<env>` (e.g. `bdy@1.22.42-dev`, `bdy@1.22.42-beta`)
- no `version`, `env: prod` → `npm i -g bdy` (latest)
- no `version`, other `env` → `npm i -g bdy@<env>` (latest of that channel tag)

## Example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup BDY CLI
        uses: buddy/setup@v1

      - name: Login to Buddy
        uses: buddy/login@v1
        with:
          token: ${{ secrets.BUDDY_TOKEN }}

      - name: Run pipeline
        uses: buddy/run-pipeline@v1
        with:
          workspace: my-workspace
          project: my-project
          identifier: deploy
```

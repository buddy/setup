import { arch } from 'node:os'
import { info, warning } from '@actions/core'
import { exec } from '@actions/exec'
import { SUPPORTED_ARCHITECTURE } from '@/const/architecture'
import type { IOutputs } from '@/types/outputs'
import { getInputs } from '@/utils/action/getInputs'
import { fetchLatestVersion } from '@/utils/version/fetchLatestVersion'

/**
 * Checks if BDY CLI is already installed
 * @returns True if BDY CLI is installed, false otherwise
 */
async function isBdyInstalled(): Promise<boolean> {
  try {
    const exitCode = await exec('which', ['bdy'], { silent: true })
    return exitCode === 0
  } catch {
    return false
  }
}

/**
 * Gets the installed BDY CLI version
 * @returns The version string or 'unknown' if not found
 */
async function getBdyVersion(): Promise<string> {
  try {
    let output = ''
    await exec('bdy', ['version'], {
      silent: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString()
        },
      },
    })

    // Parse version from output - it can include update warnings
    // Expected formats:
    // "1.16.2" or "1.11.0-dev" or
    // "BDY CLI version:\nA new version of bdy is available! (1.15.6)\n\n1.12.8"
    const lines = output.trim().split('\n')

    // Find the last line that looks like a version (X.Y.Z or X.Y.Z-suffix)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]?.trim()
      if (line && /^\d+\.\d+\.\d+(-[\w.]+)?/.test(line)) {
        return line
      }
    }

    return output.trim()
  } catch {
    return 'unknown'
  }
}

/**
 * Gets the path to BDY CLI binary
 * @returns The path to the BDY CLI binary or 'unknown' if not found
 */
async function getBdyPath(): Promise<string> {
  try {
    let path = ''
    await exec('which', ['bdy'], {
      silent: true,
      listeners: {
        stdout: (data: Buffer) => {
          path += data.toString()
        },
      },
    })
    return path.trim()
  } catch {
    return 'unknown'
  }
}

/**
 * Detects and validates the system architecture
 * @returns Supported architecture enum value
 * @throws Error if architecture is not supported
 */
function getArchitecture(): SUPPORTED_ARCHITECTURE {
  const ARCH_MAP = new Map<string, SUPPORTED_ARCHITECTURE>([
    ['x64', SUPPORTED_ARCHITECTURE.X64],
    ['arm64', SUPPORTED_ARCHITECTURE.ARM64],
  ])

  const systemArch = arch()
  const supportedArch = ARCH_MAP.get(systemArch)

  if (!supportedArch) {
    throw new Error(`Unsupported architecture: ${systemArch}. Only x64 and arm64 are supported.`)
  }

  return supportedArch
}

/**
 * Installs BDY CLI using the download method (curl + tar)
 * @param env - The environment channel (e.g., 'prod')
 * @param version - The version to install
 */
async function installViaDownload(env: string, version: string): Promise<void> {
  const architecture = getArchitecture()
  info(`Installing BDY CLI ${version} via download method for ${architecture}...`)

  const url = `https://es.buddy.works/bdy/${env}/${version}/linux-${architecture}.tar.gz`

  try {
    await exec('curl', ['-fL', url, '-o', 'bdy.tar.gz'])
  } catch {
    throw new Error(
      `Failed to download BDY CLI ${version} from ${env} channel. The version may not exist or the URL is incorrect: ${url}`,
    )
  }

  await exec('sudo', ['tar', '-zxf', 'bdy.tar.gz', '-C', '/usr/local/bin/'])
  await exec('rm', ['bdy.tar.gz'])

  info('BDY CLI installed successfully via download method')
}

/**
 * Installs BDY CLI using APT package manager
 * @param env - The environment channel (e.g., 'prod')
 */
async function installViaApt(env: string): Promise<void> {
  info('Installing BDY CLI via APT...')

  await exec('sudo', ['apt-get', 'update'])
  await exec('sudo', ['apt-get', 'install', '-y', 'software-properties-common'])
  await exec('sudo', [
    'gpg',
    '--homedir',
    '/tmp',
    '--no-default-keyring',
    '--keyring',
    '/usr/share/keyrings/buddy.gpg',
    '--keyserver',
    'hkp://keyserver.ubuntu.com:80',
    '--recv-keys',
    'eb39332e766364ca6220e8dc631c5a16310cc0ad',
  ])
  await exec('bash', [
    '-c',
    `echo "deb [arch=amd64 signed-by=/usr/share/keyrings/buddy.gpg] https://es.buddy.works/bdy/apt-repo ${env} main" | sudo tee /etc/apt/sources.list.d/buddy.list > /dev/null`,
  ])
  await exec('sudo', ['apt-get', 'update'])
  await exec('sudo', ['apt-get', 'install', '-y', 'bdy'])

  info('BDY CLI installed successfully via APT')
}

/**
 * Installs BDY CLI using NPM
 * @param env - The environment channel (e.g., 'prod')
 */
async function installViaNpm(env: string): Promise<void> {
  info('Installing BDY CLI via NPM...')

  const packageName = env === 'prod' ? 'bdy' : `bdy@${env}`
  await exec('sudo', ['npm', 'i', '-g', packageName])

  info('BDY CLI installed successfully via NPM')
}

/**
 * Main setup function that installs BDY CLI if needed
 * @returns Promise containing the BDY CLI version and path
 * @throws Error if installation fails
 */
export async function setup(): Promise<IOutputs> {
  const inputs = getInputs()

  const isInstalled = await isBdyInstalled()

  if (isInstalled) {
    const version = await getBdyVersion()
    const path = await getBdyPath()

    if (inputs.skip_if_installed) {
      info(`BDY CLI is already installed (${version}). Skipping installation.`)
      return {
        bdy_version: version,
        bdy_path: path,
      }
    }
    warning(`BDY CLI is already installed (${version}). Reinstalling...`)
  }

  // Fetch the latest version if not provided
  const version = inputs.version || (await fetchLatestVersion(inputs.env))
  info(`Using BDY CLI version: ${version} from ${inputs.env} channel`)

  switch (inputs.installation_method) {
    case 'download':
      await installViaDownload(inputs.env, version)
      break
    case 'apt':
      await installViaApt(inputs.env)
      break
    case 'npm':
      await installViaNpm(inputs.env)
      break
  }

  const installedVersion = await getBdyVersion()
  const path = await getBdyPath()

  return {
    bdy_version: installedVersion,
    bdy_path: path,
  }
}

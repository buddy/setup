export enum BdyEnvironment {
  DEV = 'dev',
  BETA = 'beta',
  STAGE = 'stage',
  MASTER = 'master',
  PROD = 'prod',
}

export enum InstallationMethod {
  DOWNLOAD = 'download',
  APT = 'apt',
  NPM = 'npm',
}

export interface IInputs {
  env: string
  version?: string
  installation_method: InstallationMethod
  skip_if_installed: boolean
}

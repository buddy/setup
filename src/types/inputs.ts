export interface IInputs {
  env: string
  version?: string
  installation_method: 'download' | 'apt' | 'npm'
  skip_if_installed: boolean
}

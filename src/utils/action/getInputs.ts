import { getBooleanInput, getInput } from '@actions/core'
import { BdyEnvironment, type IInputs, InstallationMethod } from '@/types/inputs'

/**
 * Retrieves and validates inputs from the GitHub Action
 * @returns The parsed and validated inputs
 */
export function getInputs(): IInputs {
  const env = getInput('env') || BdyEnvironment.PROD
  const version = getInput('version') || undefined
  const installation_method = getInput('installation_method') || InstallationMethod.DOWNLOAD
  const skip_if_installed = getBooleanInput('skip_if_installed')

  const validEnvs = Object.values(BdyEnvironment)
  if (!validEnvs.includes(env as BdyEnvironment)) {
    throw new Error(`Invalid env: ${env}. Must be one of: ${validEnvs.join(', ')}`)
  }

  const validMethods = Object.values(InstallationMethod)
  if (!validMethods.includes(installation_method as InstallationMethod)) {
    throw new Error(
      `Invalid installation_method: ${installation_method}. Must be one of: ${validMethods.join(', ')}`,
    )
  }

  return {
    env: env as BdyEnvironment,
    version,
    installation_method: installation_method as InstallationMethod,
    skip_if_installed,
  }
}

import { getBooleanInput, getInput } from '@actions/core'
import type { IInputs } from '@/types/inputs'

/**
 * Retrieves and validates inputs from the GitHub Action
 * @returns The parsed and validated inputs
 */
export function getInputs(): IInputs {
  const env = getInput('env') || 'prod'
  const version = getInput('version') || undefined
  const installation_method = getInput('installation_method') || 'download'
  const skip_if_installed = getBooleanInput('skip_if_installed')

  if (!['download', 'apt', 'npm'].includes(installation_method)) {
    throw new Error(
      `Invalid installation_method: ${installation_method}. Must be one of: download, apt, npm`,
    )
  }

  return {
    env,
    version,
    installation_method: installation_method as 'download' | 'apt' | 'npm',
    skip_if_installed,
  }
}

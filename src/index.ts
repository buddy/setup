import { exportVariable, setFailed, setOutput } from '@actions/core'
import { setup } from '@/setup'
import { normalizeError } from '@/utils/error/normalizeError'

setup()
  .then(({ bdy_version, bdy_path }) => {
    exportVariable('BDY_VERSION', bdy_version)
    exportVariable('BDY_PATH', bdy_path)
    setOutput('bdy_version', bdy_version)
    setOutput('bdy_path', bdy_path)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })

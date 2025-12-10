/**
 * Fetches the latest BDY CLI version from the Buddy API
 * @param env - The environment channel (e.g., 'prod')
 * @returns The latest version string
 * @throws Error if the fetch fails
 */
export async function fetchLatestVersion(env: string): Promise<string> {
  const url = `https://es.buddy.works/bdy/${env}/latest`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch latest version: ${response.status} ${response.statusText}`)
    }

    const version = await response.text()
    return version.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch latest version from ${url}: ${error.message}`)
    }
    throw new Error(`Failed to fetch latest version from ${url}`)
  }
}

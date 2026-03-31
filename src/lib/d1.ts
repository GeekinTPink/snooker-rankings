import { getCloudflareContext } from "@opennextjs/cloudflare"

export function getD1(): any | undefined {
  try {
    const { env } = getCloudflareContext() as any
    return env?.DB
  } catch {
    return undefined
  }
}


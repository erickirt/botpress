export const stringify = (input: unknown, beautify = true) => {
  return typeof input === 'string' && !!input.length
    ? input
    : input
      ? JSON.stringify(input, beautify ? null : undefined, beautify ? 2 : undefined)
      : '<input is null, false, undefined or empty>'
}

export function fastHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return (hash >>> 0).toString(16) // Convert to unsigned and then to hex
}

export const takeUntilTokens = <T>(arr: T[], tokens: number, count: (el: T) => number) => {
  const result: T[] = []
  let total = 0

  for (const value of arr) {
    const valueTokens = count(value)
    if (total + valueTokens > tokens) {
      break
    }
    total += valueTokens
    result.push(value)
  }

  return result
}

export type GenerationMetadata = {
  model: string
  cost: {
    input: number
    output: number
  }
  latency: number
  tokens: {
    input: number
    output: number
  }
}

import { type Result, execa } from 'execa'

import { log } from './log'
import { where } from './which'

export async function c(command: string, options?: string[], execaOptions: Record<string, any> = {}) {
  try {
    where(command)
    return await execa(command, options, execaOptions)
  }
  catch (e) {
    if ((e as Result).message && (e as Error).message.startsWith('not found')) {
      log.error(`"${command}" is not installed`)
    }

    return e as Result
  }
}

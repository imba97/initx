import path from 'node:path'
import { c } from '@initx-plugin/utils'
import { existsSync, readdirSync } from 'fs-extra'
import type { InitxHandler } from './handler'

export interface PackageInfo {
  name: string
  version: string
  description: string
  author: string
  homepage?: string
}

export interface InitxPlugin {
  packageInfo: PackageInfo
  handler: InitxHandler
}

export async function loadPlugins(): Promise<InitxPlugin[]> {
  const { stdout: npmPath } = await c('npm', ['config', 'get', 'prefix'])
  const nodeModules = path.join(npmPath as string, 'node_modules')

  const communityPlugins = readdirSync(nodeModules)

  const officialPluginPath = path.join(nodeModules, '@initx-plugin')
  const officialPlugins = existsSync(officialPluginPath)
    ? readdirSync(officialPluginPath).map(name => `@initx-plugin/${name}`)
    : []

  const pluginsName = [
    ...officialPlugins,
    ...communityPlugins
  ].filter(
    name => /^(?:@initx-plugin\/|initx-plugin-)/.test(name) && !/@initx-plugin\/(?:core|utils)$/.test(name)
  )

  return Promise.all(pluginsName.map(async (dirname) => {
    const InitxHandlerClass = await import(path.join(nodeModules, dirname))

    const packageAll = await import(path.join(nodeModules, dirname, 'package.json'))
    const packageInfo: PackageInfo = {
      name: packageAll.name,
      version: packageAll.version,
      description: packageAll.description,
      author: packageAll.author,
      homepage: packageAll.homepage
    }

    return {
      packageInfo,
      handler: new InitxHandlerClass()
    } as InitxPlugin
  }))
}
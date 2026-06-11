// 自定义 loader: 把 @/xxx 解析成 ./src/xxx
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve as pathResolve, dirname } from 'node:path'

const root = pathResolve(dirname(fileURLToPath(import.meta.url)), '..')

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const rel = specifier.slice(2)
    const full = pathResolve(root, 'src', rel)
    return nextResolve(pathToFileURL(full).href, context)
  }
  return nextResolve(specifier, context)
}

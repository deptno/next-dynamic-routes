import {Express} from 'express'
import {join, resolve} from 'path'
import debug from 'debug'
import {toExpressPath} from './convert/to-express-path'
import {readFileSync} from 'fs'

const log = debug('ndr')

export const withExpress = (app: Express, options: Options) => {
  const {dir = '.', target = 'serverless'} = options || {}
  const page = (path, file) => {
    const pattern = toExpressPath(path)

    app.use(pattern, async (req, res) => {
      log(`> ${req.url} - ${pattern}(${path}), ${file}`)
      req.query = req.params

      try {
        await require(file).render(req, res)
      } catch (e) {
        console.error('error', file, e)
        res.status(500).send()
      }
    })

    log('page: ', path, file, pattern)
  }

  log(`from \`${dir}\``)

  app.use('/_next/static/*', (req, res, next) => {
    req.page = req.url.slice(6)
    next()
  })

  extractPagesManifest(join(dir, target, 'pages-manifest.json'))
    .forEach(([path, file]) => page(path, resolve(dir, target, file)))

  return app
}
export default withExpress

const extractPagesManifest = (manifestPath: string) => {
  const data = readFileSync(join(manifestPath))
  const routes = JSON.parse(data.toString())
  return Object.entries<string>(routes)
    .sort(([path], [path2]) => path2.length - path.length)
}

declare global {
  namespace Express {
    interface Request {
      page?: string
    }
  }
}
type Options = {
  dir: string
  target?: 'serverless'|'server'
}

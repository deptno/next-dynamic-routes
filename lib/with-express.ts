import {Express} from 'express'
import {extname, join, resolve} from 'path'
import {parse} from 'url'
import debug from 'debug'
import {toExpressPath} from './convert/to-express-path'
import {readFileSync} from 'fs'

const log = debug('ndr')

export const withExpress = (app: Express, options: Options = {
  dir: '.',
}) => {
  const target = 'serverless'
  const {dir} = options
  const module = {
    page(path, file) {
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
    },
    run(port) {
      app.use(async (req, res) => {
        const {page, url, query} = req
        const parsed = parse(url)
        const {pathname = ''} = parsed
        const ext = extname(pathname)
        const target = resolve(join(dir, page || url))

        if (ext) {
          return res.sendFile(target, err => res.status(404).send())
        }

        try {
          const page = require(target)
          try {
            page.render(req, res)
          } catch (err) {
            console.error('err', err)
            res.status(500).send()
          }
        } catch (e) {
          res.status(404).send()
          console.error(`file not found(${target})`)
        }
        log(page, url, query)
      })
      return new Promise(resolve => app.listen(port, resolve))
    }
  }

  log(`from \`${dir}\``)

  app.use('/_next/static/*', (req, res, next) => {
    req.page = req.url.slice(6)
    next()
  })

  extractPagesManifest(join(dir, target, 'pages-manifest.json'))
    .forEach(([path, file]) => module.page(path, resolve(dir, target, file)))

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
}

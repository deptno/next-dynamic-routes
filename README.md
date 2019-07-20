# next dynamic routes

zero-config `serverless(AWS Lambda)` routes pair with next@9 dynamic(parameterized) route

You have to include code with next build directory(usually `.next`)

```bash
npm i next-dynamic-routes
```

## Code
### Client
```typescript jsx
<Link href="/hello/[place]" as="/hello/world">
  <a>Go world</a>
</Link>
```

### Serverless
```typescript
import serverless from 'serverless-http'
import {withExpress} from 'next-dynamic-routes'

const app = express()

export default serverless(withExpress(app, {dir: './.next'}))
```

### todo
- [ ] target: server
- [ ] loadable

### license
MIT

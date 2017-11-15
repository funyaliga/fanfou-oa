import Koa from 'koa'
import http from 'http'
import logger from 'koa-logger'
import cors from 'koa-cors'
import bodyparser from 'koa-bodyparser' //请求体JSON解析
import routes from './routes'

const app = new Koa()

app.use(async (ctx, next) => {
    const start = new Date()
    if (ctx.header['x-auth-token'] && ctx.header['x-auth-secret']) {
        ctx.oauth_token = ctx.header['x-auth-token']
        ctx.oauth_token_secret = ctx.header['x-auth-secret']
    }
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

app.use(cors())
app.use(logger())
app.use(bodyparser())
app.use(routes.routes(), routes.allowedMethods())

app.on('error', (error, ctx) => {
    console.log(`奇怪的错误${JSON.stringify(ctx.onerror)}`)
    console.log(`server error:${error}`)
})

app.listen(process.env.PORT || 3000)
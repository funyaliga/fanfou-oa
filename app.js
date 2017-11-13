import Koa from 'koa'
import http from 'http'
import logger from 'koa-logger'
import cors from 'koa-cors'
import bodyparser from 'koa-bodyparser' //请求体JSON解析
import routes from './routes'
// console.log(routes.routes)
const app = new Koa()

// app.use(async ctx => {
//     ctx.body = 'Hello World'
// })

app.use(cors())
app.use(logger())
app.use(bodyparser())
app.use(routes.routes(), routes.allowedMethods())

app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.on('error', (error, ctx) => {
	console.log(`奇怪的错误${JSON.stringify(ctx.onerror)}`)
	console.log(`server error:${error}`)
})

app.listen(process.env.PORT || 3000)
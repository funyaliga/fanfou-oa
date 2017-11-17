import Router from 'koa-router'
import axios from 'axios'
import Fanfou from './fanfou'
import config from 'config'
import { Base64 } from 'js-base64'

const ff = new Fanfou({
    "oauth_token": config.oauth_token,
    "oauth_token_secret": config.oauth_token.oauth_token_secret,
})

const router = Router()

router.post('/test', async (ctx, next) => {
    let response = await axios.get('http://httpbin.org/headers')
    ctx.body = response.data
})

router.post('/auth', async (ctx, next) => {
    const data = ctx.request.body

    try {
        const response = await ff.auth(data.username, data.password)
        ctx.status = 200
        ctx.body = { data: response }
    } catch (err) {
        ctx.status = 400
        ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})

router.post('/user/get', async (ctx, next) => {
    try {
        // 如果已经有token， 直接获取用户信息
        if (ctx.oauth_token && ctx.oauth_token_secret) {
            const user_data = await ff.get(ctx.oauth_token, ctx.oauth_token_secret, '/account/verify_credentials')
            ctx.status = 200
            ctx.body = { data: user_data }
            ctx.set({
                'x-auth-token': ctx.oauth_token,
                'x-auth-secret': ctx.oauth_token_secret,
            });

        } else if (ctx.header.authorization) {
            const [ username, password ] = Base64.decode(ctx.header.authorization.replace('Basic ', '')).split(':')
            const { oauth_token, oauth_token_secret } = await ff.auth(username, password)
            const user_data = await ff.get(oauth_token, oauth_token_secret, '/account/verify_credentials')
            ctx.status = 200
            ctx.body = { data: user_data }
        }
    } catch (err) {
        ctx.status = 400
        console.log('err', err)
        ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})

router.post('/get/*', async (ctx, next) => {
    const params = ctx.request.body
    const uri = ctx.originalUrl.replace('/get', '')
    try {
        const response = await ff.get(ctx.oauth_token, ctx.oauth_token_secret, uri, params)
        ctx.status = 200
        ctx.body = { data: response }
    } catch (err) {
        ctx.status = 400
        ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})

router.post('/post/*', async (ctx, next) => {
    const params = ctx.request.body
    const uri = ctx.originalUrl.replace('/post', '')
    try {
        const response = await ff.post(ctx.oauth_token, ctx.oauth_token_secret, uri, params)
        ctx.status = 200
        ctx.body = { data: response }
    } catch (err) {
        ctx.status = 400
        ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})


export default router
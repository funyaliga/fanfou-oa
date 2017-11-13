import Router from 'koa-router'
import axios from 'axios'
import Fanfou from './fanfou'

const ff = new Fanfou({
    "oauth_token": "258533-2a6e2c1f6d8961484f0edce0d96e80c3",
    "oauth_token_secret": "516732eaf0ea9cd8811a405008ff9047",
})

const router = Router()

router.post('/test', async (ctx, next) => {
    let response = await axios.get('http://httpbin.org/headers')
    // console.log('111111')
    // console.log(Fanfou)
    ctx.body = response.data
})

router.post('/auth', async (ctx, next) => {
    try {
        const response = await ff.auth('ping88914@hotmail.com', 'fanpyadizleron')
        ctx.status = 200
        ctx.body = { data: response }
    } catch (err) {
        ctx.status = 400
        ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})

router.post('/search/public_timeline', async (ctx, next) => {
    try {
        const response = await ff.get('http://api.fanfou.com/search/public_timeline.json', {q: '很烦人问我今后有什么打算，我打算成为林青霞，你觉得咋样'})
        ctx.status = 200
        ctx.body = { data: response }
    } catch (err) {
        ctx.status = 400
        ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})

router.post('/statuses/update', async (ctx, next) => {
    try {
        const response = await ff.post('http://api.fanfou.com/statuses/update.json', {
            status: '测试测试',
        })
        ctx.status = 200
        ctx.body = { data: response }
    } catch (err) {
        ctx.status = 400
        console.log(err.response ? err.response.data : err)
        // ctx.body = { data: err.response ? err.response.data : err.response.data }
    }
})

// module.exports = router
export default router
import { OAuth } from 'OAuth'
import axios from 'axios'
import qs from 'querystring'

const consumerKey = '7651f456762a44712e47de1e64d80b29'
const consumerSecret = '2dc487cddfb3d7fa73496fbaafa07c17'

const apiHost = 'http://api.fanfou.com'

const REQUEST_TOKEN_URL = 'http://fanfou.com/oauth/request_token'
const ACCESS_TOKEN_URL = 'http://fanfou.com/oauth/access_token'

Object.assign(OAuth.prototype, {
    // 修改原方法_buildAuthorizationHeaders
    buildAuthHeader(parames) {
        let authHeader = "OAuth "
        for (let key in parames) {
            if (parames.hasOwnProperty(key)) {
                authHeader += "" + this._encodeData(key) + "=\"" + this._encodeData(parames[key]) + "\"" + this._oauthParameterSeperator;
            }
        }
        authHeader = authHeader.substring(0, authHeader.length - this._oauthParameterSeperator.length)
        return authHeader
    }
})

class Fanfou {
    constructor(options) {
        this.oauth = new OAuth(
            REQUEST_TOKEN_URL,
            ACCESS_TOKEN_URL,
            consumerKey,
            consumerSecret,
            '1.0',
            null, // authorize callback
            'HMAC-SHA1',
            null, // nonceSize
            null // customHeaders
        )

        this.oauth_token = options.oauth_token
        this.oauth_token_secret = options.oauth_token_secret
    }

    auth(username, password) {
        const parames = {
            x_auth_username: username,
            x_auth_password: password,
            x_auth_mode: 'client_auth',
            oauth_consumer_key: consumerKey,
        }

        const header = this.oauth.buildAuthHeader(parames)

        // this.oauth._performSecureRequest(null, null, 'POST', this.oauth._accessUrl, request_data.data, null, null, function (error, data, response) {
        //     if (error) {
        //         if (response) {
        //             response.body = data
        //             console.log('error-response', response.body)
        //             // callback(new FanfouError(response))l
        //         } else {
        //             console.log('error', error)
        //         }
        //     } else {
        //         console.log('data', data)
        //     }
        // })

        return axios({
            url: ACCESS_TOKEN_URL,
            method: 'get',
            headers: {
                Authorization: header
            }
        }).then((response) => {
            const { oauth_token, oauth_token_secret } = qs.parse(response.data)
            this.oauth_token = oauth_token
            this.oauth_token_secret = oauth_token_secret

            return {
                oauth_token,
                oauth_token_secret
            }
        })
    }

    get(uri, params) {
        const url = `${uri}?${qs.stringify(params)}`
        const header = this.oauth.authHeader(url, this.oauth_token, this.oauth_token_secret, 'get')

        return axios({
            url,
            method: 'get',
            headers: {
                'Authorization': header
            }
        }).then((response) => {
            return response.data
        })
    }

    post(uri, params) {
        const strParams = qs.stringify(params)
        const url = `${uri}?${strParams}`
        const header = this.oauth.authHeader(url, this.oauth_token, this.oauth_token_secret, 'post')
        
        return axios({
            url: uri,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': header
            },
            data: qs.stringify(strParams)
        }).then((response) => {
            return response.data
        })
    }
}

export default Fanfou
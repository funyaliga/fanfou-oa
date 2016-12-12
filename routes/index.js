const express = require('express');
const router = express.Router();
const OAuth = require('OAuth').OAuth;

const consumerKey = '7651f456762a44712e47de1e64d80b29'
const consumerSecret = '2dc487cddfb3d7fa73496fbaafa07c17'

const apiHost = 'http://api.fanfou.com'

// URL-获取未授权的Request Token
const REQUEST_TOKEN_URL = 'http://fanfou.com/oauth/request_token'
const ACCESS_TOKEN_URL = 'http://fanfou.com/oauth/access_token'

const ffOa = new OAuth(
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

function oaAjax(url, success, error) {
	ffOa.get(
		url,
		ffOa.access_token,
		ffOa.access_token_secret,
		function (err, body, response) {
			if (!err && response.statusCode == 200) {
				typeof success == 'function' && success(body);
			} else {
				typeof error == 'function' && error(err, response, body);
			}
		}
	);
}


router.get('/test', function (req, res, next) {
	console.log(req.host);
});

router.get('/oauth/request_token', function (req, res, next) {
	ffOa.getOAuthRequestToken(function (err, oauth_token, oauth_token_secret, results) {
		if (err) {
			console.log('Get OAuthRequestToken Error: ' + err);
		} else {
			ffOa.token = oauth_token;
			ffOa.token_secret = oauth_token_secret;

			const url = `http://fanfou.com/oauth/authorize?oauth_token=${oauth_token}&oauth_callback=http://localhost:3000/oauth/request_token_callback`

			res.redirect(url);
		}
	})
});

router.get('/oauth/request_token_callback', function (req, res, next) {
	const oauth_token = req.query.oauth_token
	ffOa.getOAuthAccessToken(
		ffOa.token,
		ffOa.token_secret,
		oauth_token,
		function (err, access_token, access_token_secret, results) {
			if (err) {
				console.log('Get OAuthRequestToken Error: ' + err);
			} else {
				ffOa.access_token = access_token
				ffOa.access_token_secret = access_token_secret
				res.redirect('/home')
			}
		}
	)
});

router.get('/home', function (req, res, next) {
	const path = `${apiHost}/statuses/home_timeline.json?count=40`
	oaAjax(path, function (data){
		var jsonData = JSON.parse( data );
		console.log(data);
		console.log(jsonData);
	})
});


module.exports = router;


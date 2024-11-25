// @ts-check

const dotenv = require('dotenv')
const { signUp } = require('./auth/handler')

dotenv.config()

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */


const routes = [
	{
		method: 'POST',
		path: '/api/signup',
		options: {
			auth: false
		},
		handler: signUp

	},
	{
		method: 'GET',
		path: '/home',
		handler: (/** @type Request */ request, /** @type Response */ h) => {
			return h.response({ user: request.auth.credentials.username }).code(200)
		}
	}
]

module.exports = routes

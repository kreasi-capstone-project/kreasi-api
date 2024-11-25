const Hapi = require('@hapi/hapi')
const dotenv = require('dotenv')
const logger = require('./logger');
const routes = require('./routes');
const Boom = require('@hapi/boom');
const { validateToken } = require('./auth/handler');

dotenv.config()


/**
 * custom authentication schema
 * it's following bearer authentication mechanism
*/
const bearerAuthSchema = async (request, h) => {
	const authorization = request.headers.authorization
	if (!authorization || !authorization.startsWith('Bearer ')) {
		throw Boom.unauthorized("Your'e not authenticated, please login or register first")
	}
	const token = authorization.split(" ")
	const { isValid, credentials } = await validateToken(token[1])
	if (!isValid) {
		throw Boom.unauthorized("Your'e not authenticated, please login or register first")
	}
	return h.authenticated({ credentials })
}

const init = async () => {
	const server = Hapi.server({
		port: process.env.SERVER_PORT || 3000,
		host: process.env.SERVER_HOST || 'localhost',
		routes: {
			cors: {
				origin: ['*']
			}
		}
	});

	// Boom error handling to customize error response based on API Design
	server.ext("onPreResponse", (request, h) => {
		const response = request.response
		if (response.isBoom || response instanceof Error) {
			logger("error", response.error, "preResponse hook")
			const statusCode = response.isBoom ? response.output.payload.statusCode : 500;
			const message = response.isBoom
				? response.output.payload.message
				: response.message || "An unexpected error occurred";

			return h.response({
				status: 'fail',
				errors: {
					code: statusCode,
					message: message
				}
			}).code(statusCode)
		}
		return h.continue
	})

	server.auth.scheme('bearer', (server, options) => {
		return {
			authenticate: bearerAuthSchema
		}
	})
	server.auth.strategy('bearer', 'bearer');
	server.auth.default('bearer')

	server.route(routes)
	await server.start()
	logger("info", `server is running at ${server.info.uri}`)
}

init()

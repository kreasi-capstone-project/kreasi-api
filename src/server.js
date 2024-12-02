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
	const { isValid, credentials } = await validateToken(token[1], request.info.id)
	if (!isValid) {
		throw Boom.unauthorized("Your'e not authenticated, please login or register first")
	}
	return h.authenticated({ credentials })
}

const init = async () => {
	const server = Hapi.server({
		port: process.env.PORT || 8080,
		host: process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0',
		routes: {
			cors: {
				origin: ['*']
			}
		}
	});

	// Boom error handling to customize error response based on API Design
	server.ext("onPreResponse", (request, h) => {
		const response = request.response
		if (!response.isBoom || !(response instanceof Error)) {
			return h.continue
		}
		const message = response.isBoom
			? response.output.payload.message
			: response.message || "An unexpected error occurred";
		const statusCode = response.isBoom ? response.output.payload.statusCode : 500;

		// check if error is come from Joi (validation error)
		if (response.isBoom && response.output.payload.error === 'Bad Request' && response.details) {
			// Transform Joi error details into an object with [field_name]: error message
			const joiErrors = response.details.reduce((acc, detail) => {
				const field = detail.path.join('.'); // Convert Joi path to string
				acc[field] = detail.message.replace(/"([^"]+)"/, '$1');
				return acc;
			}, {});
			return h.response({
				status: 'fail',
				errors: {
					code: statusCode,
					message: 'Validation error',
					details: joiErrors // Include detailed validation errors
				}
			}).code(statusCode).takeover();
		}

		logger("error", message, "preResponse hook",
			{
				requestId: request.info.id,
				method: request.method.toUpperCase(),
				path: request.path,
				stack: response.stack
			}
		)
		return h.response({
			status: 'fail',
			errors: {
				code: statusCode,
				message: message
			}
		}).code(statusCode).takeover()
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

process.on('unhandledRejection', (err) => {
	console.error(err)
	process.exit(1)
})

init()

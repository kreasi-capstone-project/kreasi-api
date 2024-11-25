const pino = require('pino')
const dotenv = require('dotenv')

dotenv.config()

const pinoConfig = pino.pino({
	level: process.env.LOGGER_LEVEL || 'info',
	formatters: {
		level: (label) => {
			return { level: label.toUpperCase() }
		}
	},
	timestamp: pino.stdTimeFunctions.isoTime
})

/**
 * @typedef {Object} LoggerContext
 * @property {string} requestId - additional context
 * @property {string | null} userId - additional context, so we can know who did what in our system
 * @property {string | null} path
 * @property {string | null} method
 *
 * @param {'info' | 'error' | 'warn'} level - log level
 * @param {string} message - log message
 * @param {string} operationId - name of function. e.g createUserHandler, udpateUserHandler 
 * @param {LoggerContext | null} context
 *
 * Pino logger, it's mostly use to log error event to stdout.
 * But we can also use it to log any important event
 * so we can know who that did what in our system better
 */
function logger(level, message, operationId, context) {
	if (context) {
		pinoConfig[level]({
			message, context: {
				requestId: context.requestId,
				method: context.method,
				path: context.path,
				userId: context.userId,
				operationId: operationId,
				stack: context.stack
			}
		})
	}
	pinoConfig[level]({ message, operationId })
}

module.exports = logger

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
 * @property {string} requestId
 * @property {string} userId
 * @param {'info' | 'error' | 'warn'} level
 * @param {string} message
 * @param {string} operationId - name of function. e.g createUserHandler, udpateUserHandler 
 * @param {LoggerContext | null} context
 */
function logger(level, message, operationId, context) {
	if (context) {
		pinoConfig[level]({ message, operationId, context })
	}
	pinoConfig[level]({ message, operationId })
}

module.exports = logger

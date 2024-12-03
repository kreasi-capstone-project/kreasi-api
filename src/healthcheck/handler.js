const db = require("../dbConnection");
const Boom = require("@hapi/boom");
const logger = require("../logger");

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */

/**
 * @param {Request} request
 * @param {Response} h
 */
exports.healthcheck = async (request, h) => {
	try {
		const [rows] = db.query('SELECT 1')
		if (rows.length === 0 || rows.length) {
			logger('info', "db helath check pass", "healthcheck", { path: '/api/healthcheck', method: 'GET', requestId: request.info.id, userId: null })
		}
		return h.response({
			status: 'success',
		}).code(200)
	} catch (error) {
		logger('error', "db helath check failed", "healthcheck", { path: '/api/healthcheck', method: 'GET', requestId: request.info.id, userId: null, stack: error.stack })
		return h.response({
			status: 'fail',
			errors: {
				message: error.message
			}
		}).code(400)
	}
}

// @ts-check

const bcrypt = require('bcrypt')
const { v7: uuid } = require('uuid')
const Boom = require('@hapi/boom')
const logger = require('../logger')
const db = require('../dbConnection')

const BCRYPT_SALT_ROUND = 10

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */

/**
 * @param {string} token
 */
exports.validateToken = async (token) => {
	const [rows] = await db.query(
		'SELECT id, email, fullname, token FROM users WHERE token = ?',
		[token]
	)
	if (rows.length === 0) {
		throw Boom.unauthorized("You're not authenticated, please login or register account first")
	}
	return {
		isValid: true, credentials: {
			user: {
				id: rows[0].id,
				email: rows[0].email,
				fullname: rows[0].fullname
			}
		}
	}
}

exports.signUp = async (/** @type Request */ request, /** @type Response*/ h) => {
	try {
		const { email, password, fullname } = request.payload
		const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND)
		const userId = uuid()

		await db.execute(
			'INSERT INTO users (id, email, password, fullname, token) VALUES (?, ?, ?, ?, ?)',
			[userId, email, hashedPassword, fullname, userId]
		)
		return h.response({
			status: "success",
			data: {
				users: {
					id: userId,
					fullname: fullname,
					email: email,
					token: userId
				}
			}
		}).code(201)
	} catch (error) {
		logger("error", error.message || error, "createUser", { requestId: request.info.id, userId: null })
		if (error.code === "ER_DUP_ENTRY") {
			throw Boom.conflict("This email is already exist, try to login instead")
		}
		throw Boom.badRequest("An unexpected error happened")
	}
}

// @ts-check

const bcrypt = require("bcrypt");
const { v7: uuid } = require("uuid");
const Boom = require("@hapi/boom");
const logger = require("../logger");
const db = require("../dbConnection");

const BCRYPT_SALT_ROUND = 10;

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */

/**
 * @param {string} token
 */
exports.validateToken = async (token, requestId) => {
	const [rows] = await db.query(
		'SELECT id, email, fullname, token FROM users WHERE token = ?',
		[token]
	)
	// @ts-ignore
	if (rows.length === 0) {
		logger("error", 'unauthenticated request, token not found', "validateToken", { stack: null, requestId: requestId, userId: null, path: '/api/regiser', method: 'POST' })
		throw Boom.unauthorized("You're not authenticated, please login or register account first")
	}
	return {
		isValid: true, credentials: {
			user: {
				id: rows[0].id,
				email: rows[0].email,
				name: rows[0].fullname
			}
		}
	}
}

exports.register = async (/** @type Request */ request, /** @type Response*/ h) => {
	try {
		// @ts-ignore
		const { email, password, name } = request.payload
		const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND)
		const userId = uuid()

		await db.execute(
			'INSERT INTO users (id, email, password, fullname, token) VALUES (?, ?, ?, ?, ?)',
			[userId, email, hashedPassword, name, userId]
		)
		return h.response({
			status: "success",
			data: {
				users: {
					id: userId,
					name: name,
					email: email,
				},
				token: userId
			}
		}).code(201)
	} catch (error) {
		logger("error", error.message || error, "createUser", { requestId: request.info.id, userId: null, path: '/api/regiser', method: 'POST', stack: error.stack })

		if (error.code === "ER_DUP_ENTRY") {
			throw Boom.conflict("This account already exist, maybe you should login instead")
		}
		throw Boom.badRequest("An unexpected error happened")
	}
}

exports.signin = async (/** @type {Request}*/request, /** @type {Response}*/h) => {
	// @ts-ignore
	const { email, password } = request.payload
	const [rows] = await db.query(
		'SELECT id, fullname, email, password FROM users WHERE email = ?',
		[email]
	)
	// @ts-ignore
	if (rows.length === 0) {
		logger('error', 'login failed, email not found', 'signin', { stack: null, userId: null, method: 'POST', path: '/api/signin', requestId: request.info.id })
		throw Boom.badRequest("login fail, email or password is incorrect")
	}

	const isPasswordValid = bcrypt.compareSync(password, rows[0].password)
	if (!isPasswordValid) {
		logger('error', 'login failed, password incorrect', 'signin', { stack: null, userId: null, method: 'POST', path: '/api/signin', requestId: request.info.id })
		throw Boom.badRequest("login fail, email or password is incorrect")
	}
	const [updatedRows] = await db.execute("UPDATE users SET token = ? WHERE id = ?", [rows[0].id, rows[0].id])
	if (!updatedRows.affectedRows) {
		logger('error', 'login failed, fail to update the token', 'signin', { stack: null, userId: null, method: 'POST', path: '/api/signin', requestId: request.info.id })
		throw Boom.badRequest("login fail, this is not your fault and please try again later")
	}

	return h.response({
		status: 'success',
		data: {
			user: {
				id: rows[0].id,
				name: rows[0].fullname,
				email: rows[0].email,
			},
			token: rows[0].id
		}
	}).code(200)
}


exports.logout = async (/** @type Request */ request, /** @type Response*/ h) => {
	const userId = request.auth.credentials.user.id
	try {
		const [rows] = await db.execute("UPDATE users SET token = ? WHERE id = ?", [null, userId])

		if (rows.affectedRows === 0) {
			logger("error", "fail to logout user not exist", 'logout', { path: '/api/logout', method: 'DELETE', requestId: request.info.id, userId: null, stack: null })
			throw Boom.badRequest("fail to logout, user not exist")
		}

		return h.response().code(204)

	} catch (error) {
		logger("error", "fail to logout user not exist", 'logout', { path: '/api/logout', method: 'DELETE', requestId: request.info.id, userId: null, stack: null })
		throw Boom.serverUnavailable("This is not your fault, our team is working to fix this issue, please try again later")
	}
}

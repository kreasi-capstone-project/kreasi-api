// @ts-check

const mysql = require('mysql2')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const { v7: uuid } = require('uuid')
const Boom = require('@hapi/boom')
const logger = require('./logger')

dotenv.config()

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */

const connection = mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'root',
	database: process.env.DB_NAME || 'kreasi'
})

const BCRYPT_SALT_ROUND = 10

const routes = [
	{
		method: 'POST',
		path: '/api/signup',
		options: {
			auth: false
		},
		handler: async (/** @type Request */ request, /** @type Response*/ h) => {
			try {
				const { email, password, fullname } = request.payload
				const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND)
				const userId = uuid()

				const results = await connection.execute(
					'INSERT INTO users (id, email, password, fullname, token) VALUES (?, ?, ?, ?, ?)', [userId, email, hashedPassword, fullname, userId]
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
				logger("error", error.message || error, "createUser")
				if (error.code === "ER_DUP_ENTRY") {
					throw Boom.conflict("This email is already exist, try to login instead")
				}
				throw Boom.badRequest("An unexpected error happened")
			}
		}

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

// @ts-check

const dotenv = require('dotenv')
const { register, signin } = require('./auth/handler')
const Joi = require('joi')

dotenv.config()

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */


const routes = [
	{
		method: 'POST',
		path: '/api/register',
		options: {
			auth: false,
			validate: {
				payload: Joi.object({
					name: Joi.string().required().min(1),
					email: Joi.string().email().required(),
					password: Joi.string().required().min(6)
				}),
				failAction: async (request, h, error) => {
					throw error
				}

			},
		},
		handler: register

	},
	{
		method: 'POST',
		path: '/api/signin',
		options: {
			auth: false,
			validate: {
				payload: Joi.object({
					email: Joi.string().email().required(),
					password: Joi.string().required()
				}),
				failAction: async (request, h, error) => {
					throw error
				}
			},
		},
		handler: signin
	},
	{
		method: 'GET',
		path: '/home',
		handler: (/** @type Request */ request, /** @type Response */ h) => {
			return h.response({ user: request.auth.credentials.user }).code(200)
		}
	}
]

module.exports = routes

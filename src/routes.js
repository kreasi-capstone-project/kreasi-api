// @ts-check

const dotenv = require("dotenv");
const { signUp, signin } = require("./auth/handler");
const {
  getAllSubjects,
  getSubjectById,
  getAssessmentTest,
} = require("./subjects/handler");
const Boom = require("@hapi/boom");

dotenv.config();

/**
 * @typedef {import ('@hapi/hapi').Request} Request
 * @typedef {import ('@hapi/hapi').ResponseToolkit} Response
 */

const routes = [
  {
    method: "POST",
    path: "/api/signup",
    options: {
      auth: false,
    },
    handler: signUp,
  },
  {
    method: "POST",
    path: "/api/signin",
    options: {
      auth: false,
    },
    handler: signin,
  },
  {
    method: "GET",
    path: "/home",
    handler: (/** @type Request */ request, /** @type Response */ h) => {
      return h.response({ user: request.auth.credentials.user }).code(200);
    },
  },
  {
    method: "GET",
    path: "/api/subjects",
    options: {
      auth: "bearer",
    },
    handler: getAllSubjects,
  },
  {
    method: "GET",
    path: "/api/subjects/{id}",
    options: {
      auth: "bearer",
    },
    handler: getSubjectById,
  },
  {
    method: "GET",
    path: "/api/subjects/{id}/assessments",
    options: {
      auth: "bearer",
    },
    handler: getAssessmentTest,
  },
];

module.exports = routes;

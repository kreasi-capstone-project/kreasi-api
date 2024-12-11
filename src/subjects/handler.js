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
exports.getAllSubjects = async (request, h) => {
  try {
    const [rows] = await db.query("SELECT name, description FROM subjects");

    return h
      .response({
        status: "success",
        data: {
          subjects: rows,
        },
      })
      .code(200);
  } catch (error) {
    logger("error", error.message, "getAllSubjects", { stack: error.stack });
    throw Boom.badRequest("Failed to retrieve subjects");
  }
};

exports.getSubjectById = async (request, h) => {
  const { id } = request.params;

  try {
    const [rows] = await db.query(
      "SELECT name, description FROM subjects WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return h
        .response({
          status: "fail",
          errors: {
            code: 404,
            message: "learning path with that specified id is not found",
          },
        })
        .code(404);
    }

    return h
      .response({
        status: "success",
        data: {
          subjects: rows[0],
        },
      })
      .code(200);
  } catch (error) {
    logger("error", error.message, "getSubjectById", { stack: error.stack });
    throw Boom.badRequest("Failed to retrieve the learning path by ID");
  }
};

exports.getAssessmentTest = async (/** @type Request  */request, h) => {
  const { id } = request.params;
  const parsedId = parseInt(id, 10)
  if (!parsedId) {
    logger("error", "assessment not found, bad request param", "getAssessmentTest", { path: '/api/subjects/{id}/assessment', method: 'GET', userId: request.auth.credentials.user.id, requestId: request.info.id, stack: null })
    throw Boom.notFound("Assessment for this subject is not found")
  }

  try {
    const [rows] = await db.query(
      "SELECT id, name, assessments FROM subjects WHERE id = ? ",
      [parsedId]
    );
    const result = rows.map((row) => ({
      subjects: {
        id: row.id,
        name: row.name
      },
      assesments: row.assessments.reduce((acc, item) => {
        acc[item.question] = {
          "answers": item.answers,
          "correct_answers": item.correct_answer
        };
        return acc;
      }, {})
    }))[0]

    return h
      .response({
        status: "success",
        data: result
      })
      .code(200);
  } catch (error) {
    logger("error", error.message, "getAssessmentTest", { stack: error.stack });
    throw Boom.badRequest("Failed to retrieve assessment test");
  }
};


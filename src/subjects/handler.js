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

exports.getAssessmentTest = async (request, h) => {
  const { id } = request.params;

  try {
    const [subjectRows] = await db.query(
      "SELECT id, name FROM subjects WHERE id = ?",
      [id]
    );

    if (subjectRows.length === 0) {
      return Boom.notFound("Learning path with that specified id is not found");
    }

    const subject = subjectRows[0];

    const [assessmentRows] = await db.query(
      "SELECT question, answers, correct_answers FROM assessments WHERE subject_id = ?",
      [id]
    );

    const assessments = assessmentRows.reduce((acc, row) => {
      acc[row.question] = {
        answers: JSON.parse(row.answers),
        correct_answers: row.correct_answers,
      };
      return acc;
    }, {});

    return h
      .response({
        status: "success",
        data: {
          subjects: subject,
          assessments,
        },
      })
      .code(200);
  } catch (error) {
    logger("error", error.message, "getAssessmentTest", { stack: error.stack });
    throw Boom.badRequest("Failed to retrieve assessment test");
  }
};

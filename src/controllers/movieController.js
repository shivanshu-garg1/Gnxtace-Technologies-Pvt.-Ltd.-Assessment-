const Movie = require("../models/Movie");
const { sendResponse } = require("../utils/response");

exports.getAllMovies = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.body;
    const filter = {};
    if (name) {
      filter.name = name;
    }

    const offset = (page - 1) * limit;
    const movies = await Movie.find(filter, limit, offset);

    const db = require("../../database/db");
    const totalCount = await db("movies").count("* as count").first();

    sendResponse(res, {
      data: movies,
      total: totalCount.count,
      message: "Movies fetched successfully",
    });
  } catch (err) {
    console.error(err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: err.message,
    });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return sendResponse(res, {
        statusCode: 404,
        status: "error",
        message: "Movie not found",
      });
    }

    sendResponse(res, {
      data: movie,
      message: "Movie fetched successfully",
    });
  } catch (err) {
    console.log(err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: err.message,
    });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const { name, yearOfRelease, plot, producer } = req.body;

    let { actors } = req.body;

    if (!Array.isArray(actors)) {
      actors = actors ? [actors] : [];
    }

    // Movie name
    if (!name || !name.trim()) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Movie name is required",
      });
    }

    if (name.trim().length > 100) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Movie name cannot exceed 100 characters",
      });
    }

    // Year validation
    const currentYear = new Date().getFullYear();

    if (!yearOfRelease || yearOfRelease < 1888 || yearOfRelease > currentYear) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: `Year must be between 1888 and ${currentYear}`,
      });
    }

    // Plot validation
    if (!plot || plot.trim().length < 10) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Plot must contain at least 10 characters",
      });
    }

    // Producer validation
    if (!producer) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Producer is required",
      });
    }

    // Actor validation
    if (actors.length === 0) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "At least one actor is required",
      });
    }
    if (!Array.isArray(actors)) {
      actors = actors ? [actors] : [];
    }

    let posterUrl = req.body.poster;

    if (req.file) {
      posterUrl = `${req.protocol}://${
        req.get("X-Forwarded-Host") || req.get("Host")
      }/uploads/images/${req.file.filename}`;
    }

    if (name && name.length <= 30) {
      console.log("2");
      const existing = await Movie.find({ name });
      if (existing.length > 0) {
        return sendResponse(res, {
          statusCode: 400,
          status: "error",
          message: "Movie name must be unique",
        });
      }
    }

    const movie = await Movie.create({
      name,
      yearOfRelease,
      plot,
      poster: posterUrl,
      producer,
      actors,
    });
    sendResponse(res, {
      statusCode: 201,
      data: movie,
      message: "Movie created successfully",
    });
  } catch (err) {
    console.log(err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: err.message,
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const { name, yearOfRelease, plot, producer, actors } = req.body;

    let posterUrl = req.body.poster;

    if (req.file) {
      posterUrl = `${req.protocol}://${
        req.get("X-Forwarded-Host") || req.get("Host")
      }/uploads/posters/${req.file.filename}`;
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (yearOfRelease !== undefined) dataToUpdate.yearOfRelease = yearOfRelease;
    // if (plot !== undefined) dataToUpdate.plot = plot;
    if (posterUrl !== undefined) dataToUpdate.poster = posterUrl;
    if (producer !== undefined) dataToUpdate.producer = producer;
    if (actors !== undefined) dataToUpdate.actors = actors;

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      dataToUpdate,
    );

    if (!updatedMovie) {
      return sendResponse(res, {
        statusCode: 404,
        status: "error",
        message: "Movie not found",
      });
    }

    sendResponse(res, {
      data: updatedMovie,
      message: "Movie updated successfully",
    });
  } catch (err) {
    console.log(err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: err.message,
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const deletedMovie = await Movie.findByIdAndDelete(movieId);

    if (!deletedMovie) {
      return sendResponse(res, {
        statusCode: 404,
        status: "error",
        message: "Movie not found",
      });
    }

    sendResponse(res, {
      data: { movieId },
      message: "Movie deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting Movie:", err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: "Failed to delete Movie",
    });
  }
};

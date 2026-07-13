const Actor = require("../models/Actor");
const { sendResponse } = require("../utils/response");

const validateActor = ({ name, gender, dob, bio }) => {
  if (!name || !name.trim()) {
    return "Actor name is required";
  }

  if (name.trim().length < 2 || name.trim().length > 50) {
    return "Actor name must be between 2 and 50 characters";
  }

  if (!gender) {
    return "Gender is required";
  }

  const validGenders = ["Male", "Female", "Other"];

  if (!validGenders.includes(gender)) {
    return "Invalid gender";
  }

  if (!dob) {
    return "Date of birth is required";
  }

  const birthDate = new Date(dob);
  const today = new Date();

  if (isNaN(birthDate.getTime())) {
    return "Invalid date of birth";
  }

  if (birthDate > today) {
    return "Date of birth cannot be in the future";
  }

  if (!bio || !bio.trim()) {
    return "Biography is required";
  }

  if (bio.trim().length < 10 || bio.trim().length > 1000) {
    return "Biography must be between 10 and 1000 characters";
  }

  return null;
};
exports.getAllActors = async (req, res) => {
  try {
    const { name } = req.body;
    const filter = {};

    if (name) {
      filter.name = name; // Model will handle like match
    }

    const actors = await Actor.find(filter);

    sendResponse(res, {
      data: actors,
      message: "Actors fetched successfully",
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

exports.createActor = async (req, res) => {
  try {
    const { name, gender, dob, bio } = req.body;
    const existingActor = await Actor.find({
  name: name.trim(),
});

if (existingActor.length > 0) {
  return sendResponse(res, {
    statusCode: 400,
    status: "error",
    message: "Actor already exists",
  });
}
    const validationError = validateActor({
      name,
      gender,
      dob,
      bio,
    });
    if (validationError) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: validationError,
      });
    }
    let image = req.body.image;

    if (req.file) {
      image = `${req.protocol}://${
        req.get("X-Forwarded-Host") || req.get("Host")
      }/uploads/images/${req.file.filename}`;
    }

    const actor = await Actor.create({ name, gender, dob, bio, image });

    sendResponse(res, {
      statusCode: 201,
      data: actor,
      message: "Actor created successfully",
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

exports.updateActor = async (req, res) => {
  try {
    const actorId = req.params.id;
    const { name, gender, dob, bio } = req.body;
    if (name !== undefined) {
  if (!name.trim()) {
    return sendResponse(res, {
      statusCode: 400,
      status: "error",
      message: "Actor name cannot be empty",
    });
  }

  if (name.trim().length > 50) {
    return sendResponse(res, {
      statusCode: 400,
      status: "error",
      message: "Actor name is too long",
    });
  }
}

if (gender !== undefined) {
  const validGenders = ["Male", "Female", "Other"];

  if (!validGenders.includes(gender)) {
    return sendResponse(res, {
      statusCode: 400,
      status: "error",
      message: "Invalid gender",
    });
  }
}

if (dob !== undefined) {
  const date = new Date(dob);

  if (isNaN(date.getTime()) || date > new Date()) {
    return sendResponse(res, {
      statusCode: 400,
      status: "error",
      message: "Invalid date of birth",
    });
  }
}

if (bio !== undefined && bio.trim().length < 10) {
  return sendResponse(res, {
    statusCode: 400,
    status: "error",
    message: "Biography must be at least 10 characters",
  });
}
    let image = req.body.image;

    if (req.file) {
      image = `${req.protocol}://${
        req.get("X-Forwarded-Host") || req.get("Host")
      }/uploads/images/${req.file.filename}`;
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (gender) dataToUpdate.gender = gender;
    if (dob) dataToUpdate.dob = dob;
    if (bio) dataToUpdate.bio = bio;
    if (image) dataToUpdate.image = image;

    const updatedActor = await Actor.findByIdAndUpdate(actorId, dataToUpdate);

    if (!updatedActor) {
      return sendResponse(res, {
        statusCode: 404,
        status: "error",
        message: "Actor not found",
      });
    }

    sendResponse(res, {
      data: updatedActor,
      message: "Actor updated successfully",
    });
  } catch (err) {
    console.error("Error updating actor:", err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: "Failed to update actor",
    });
  }
};

exports.deleteActor = async (req, res) => {
  try {
    const actorId = req.params.id;

    const deletedActor = await Actor.findByIdAndDelete(actorId);

    if (!deletedActor) {
      return sendResponse(res, {
        statusCode: 404,
        status: "error",
        message: "Actor not found",
      });
    }

    sendResponse(res, {
      data: { actorId },
      message: "Actor deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting actor:", err);
    sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: "Failed to delete actor",
    });
  }
};

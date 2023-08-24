const service = require("./posts.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasRequiredProperties = hasProperties('post_title', 'post_body');

async function postExists(req, res, next) {
  const { postId } = req.params;

  const post = await service.read(postId);
  if (post) {
    res.locals.post = post;
    return next();
  }
  return next({ status: 404, message: `Post cannot be found.` });
}

const VALID_PROPERTIES = [
  'post_title',
  'post_body',
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

async function create(req, res, next) {
    try {
        const data = await service.create(req.body.data);
        res.status(201).json({ data });
    } catch (error) {
        next(error);
    }
}


async function update(req, res) {
  // your solution here
  try {
    const updatedPost = {
      ...req.body.data,
      post_id: res.locals.post.post_id,
    };
    const data = await service.update(updatedPost);
    res.json({data});
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.delete(res.locals.post.post_id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}


module.exports = {
  create: [hasOnlyValidProperties, hasRequiredProperties, asyncErrorBoundary(create)],
  update: [postExists, asyncErrorBoundary(postExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(postExists), asyncErrorBoundary(destroy)],
};

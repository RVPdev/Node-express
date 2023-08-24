const service = require("./comments.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function commentExists(req, res, next) {
  const { commentId } = req.params;
  const comment = await service.read(commentId);
  if (comment) {
    res.locals.comment = comment;
    return next();
  }
  return next({ status: 404, message: `Comment cannot be found.` });
}

async function list(req, res, next) {
  // your solution here
  service.list().then((data) => res.json({ data })).catch(next);
  
}

async function listCommenterCount(req, res, next) {
  try {
    const counts = await service.listCommenterCount();
    const processedCounts = counts.map(item => ({
      ...item,
      count: Number(item.count)
    }));

    
    res.json({data: processedCounts});
  } catch (err) {
    next(err);
  }
}

async function read(req, res, next) {
  const knexInstance = req.app.get("db");
  const { comment } = res.locals;
  res.json({ data: comment });
}

module.exports = {
  list: asyncErrorBoundary(list),
  listCommenterCount: asyncErrorBoundary(listCommenterCount),
  read: [asyncErrorBoundary(commentExists), read],
};

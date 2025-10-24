import { Role } from "@prisma/client";
import { DEFAULT_LIMIT_COMMENTS } from "../constants.js";
import * as commentQueries from "../queries/commentQueries.js";

export async function getComments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_COMMENTS;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    // Get all comments and the total number of comments
    const [comments, total] = await Promise.all([
      commentQueries.getManyComments(skip, limit),
      commentQueries.getTotalCommentCount(),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments,
    });
  } catch (err) {
    console.error(`Error fetching comments: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

const validateComment = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Comment should be between 1 and 255 characters"),
];
export const editComment = [
  validateComment,
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { commentId } = req.params;
      const { text } = matchedData(req);

      const existingComment = await commentQueries.getCommentById(
        parseInt(commentId)
      );

      // Validate comment exists and that the user has permission to edit it
      if (!existingComment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      if (existingComment.commenterId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this comment" });
      }

      // Update comment
      const updatedComment = await commentQueries.updateComment(
        parseInt(commentId),
        text
      );

      return res.json(updatedComment);
    } catch (err) {
      console.error(`Error updating comment: ${err}`);
      res.status(500).json({ error: "Internal Service Error" });
    }
  },
];

export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    const existingComment = await commentQueries.getCommentById(
      parseInt(commentId)
    );

    // Verify comment exists and confirm that user has permission to delete the comment
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (
      existingComment.commenterId !== req.user.id &&
      req.user.role !== Role.ADMIN
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    const deletedComment = await commentQueries.removeComment(
      parseInt(commentId)
    );

    return res.json({
      message: "Successfully deleted comment",
      comment: deletedComment,
    });
  } catch (err) {
    console.error(`Error deleting comment: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

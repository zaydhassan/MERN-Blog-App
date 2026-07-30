const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { promoteUserSchema } = require('../validators/schemas');
const {
  getAllUsers,
  getAllBlogs,
  deleteUser,
  deleteBlog,
  getComments,
  deleteComment,
  promoteUser,
} = require('../controllers/adminController');

router.get('/users', authenticateUser, isAdmin, getAllUsers);

router.get('/blogs', authenticateUser, isAdmin, getAllBlogs);

router.delete('/users/:id', authenticateUser, isAdmin, deleteUser);

router.delete('/blogs/:id', authenticateUser, isAdmin, deleteBlog);

router.get('/comments', authenticateUser, isAdmin, getComments);

router.delete('/comments/:id', authenticateUser, isAdmin, deleteComment);

// Promote / demote a user. The supported way to grant Admin (registration
// forces Reader). Body: { role: "Reader" | "Writer" | "Admin" }.
router.patch('/users/:id/role', authenticateUser, isAdmin, validate(promoteUserSchema), promoteUser);

module.exports = router;

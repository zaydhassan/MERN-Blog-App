const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
<<<<<<< HEAD
const validate = require('../middleware/validate');
const { promoteUserSchema } = require('../validators/schemas');
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
const {
  getAllUsers,
  getAllBlogs,
  deleteUser,
  deleteBlog,
  getComments,
  deleteComment,
<<<<<<< HEAD
  promoteUser,
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
} = require('../controllers/adminController');

router.get('/users', authenticateUser, isAdmin, getAllUsers);

router.get('/blogs', authenticateUser, isAdmin, getAllBlogs);

router.delete('/users/:id', authenticateUser, isAdmin, deleteUser);

router.delete('/blogs/:id', authenticateUser, isAdmin, deleteBlog);

router.get('/comments', authenticateUser, isAdmin, getComments);

router.delete('/comments/:id', authenticateUser, isAdmin, deleteComment);

<<<<<<< HEAD
// Promote / demote a user. The supported way to grant Admin (registration
// forces Reader). Body: { role: "Reader" | "Writer" | "Admin" }.
router.patch('/users/:id/role', authenticateUser, isAdmin, validate(promoteUserSchema), promoteUser);

module.exports = router;
=======
module.exports = router;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

const mongoose = require("mongoose");

<<<<<<< HEAD
// The denormalized `likes: [ObjectId]` and `comments: [{user, text}]` arrays
// that used to live here have been removed. They duplicated the Like and
// Comment collections and were never kept in sync (likeController wrote only
// to the Like collection), so `blog.likes`/`blog.comments` were always stale.
// Counts are now computed from the real collections (see getTrendingBlogs).
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
<<<<<<< HEAD
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
=======
    description: { 
      type: String,
      required: [true, "Description is required"],
    },
   image: {
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      type: String,
      required: [true, "Image is required"],
    },
    status: {
      type: String,
<<<<<<< HEAD
      enum: ["Published", "Draft", "Archived"],
      default: "Draft",
    },
    views: {
      type: Number,
      default: 0,
    },
    category: {
=======
      enum: ['Published', 'Draft', 'Archived'], 
      default: 'Draft'
    },
    views: {
      type: Number,
      default: 0
    },
    category: {  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      type: String,
      required: [true, "Category is required"],
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
<<<<<<< HEAD
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: [true, "user id is required"],
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Indexes for the actual query patterns:
//  - listing published blogs (newest first)
//  - browsing by category
//  - listing a user's blogs
blogSchema.index({ status: 1, created_at: -1 });
blogSchema.index({ category: 1, created_at: -1 });
blogSchema.index({ user: 1, created_at: -1 });

=======
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }], 
    comments: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, 
      text: String
    }],
    user:{
      type: mongoose.Types.ObjectId,
      ref:'users',
      required:[true,"user id is required"],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } 
);

>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
const blogModel = mongoose.model("Blog", blogSchema);

module.exports = blogModel;
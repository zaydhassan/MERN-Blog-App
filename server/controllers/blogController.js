const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");
const mongoose= require("mongoose");
const Tag = require("../models/Tag");
const BlogTag = require("../models/BlogTag");

exports.getTrendingBlogs = async (req, res) => {
  try {
    const trendingBlogs = await blogModel.find()
      .sort({ likes: -1, views: -1, "comments.length": -1 }) 
      .limit(5) 
      .populate("user", "username profile_image"); 

    return res.status(200).json({ success: true, trending: trendingBlogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching trending blogs", error });
  }
};

exports.getRecommendedBlogs = async (req, res) => {
  const { userId } = req.params;
  
  try {
    
    const userActivityBlogs = await blogModel.find({
      $or: [{ likes: userId }, { "comments.user": userId }],
    }).limit(5);

    let recommendedBlogs = userActivityBlogs;

    if (recommendedBlogs.length === 0) {
      recommendedBlogs = await blogModel.find().sort({ created_at: -1 }).limit(5);
    }

    return res.status(200).json({ success: true, recommendations: recommendedBlogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching recommended blogs", error });
  }
};

exports.getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel
      .find({ status: "Published" })
      .populate({
        path: "user",
        select: "username profile_image"
      })
      .populate("tags", "tag_name");
    if (!blogs.length) {
      return res.status(200).json({ success: false, message: "No Blogs Found", blogs: [] });
    }
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    
    return res.status(200).json({
      success: true,
      BlogCount: blogs.length,
      message: "All Blogs lists",
      blogs,
    });
  } catch (error) {
    console.error("Error Fetching Blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Error While Getting Blogs",
      error: error.toString(),
    });
  }
};

  exports.getBlogsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        const blogs = await blogModel.find({ category: category }).populate('user');
        if (blogs.length > 0) {
            res.status(200).json({ success: true, blogs });
        } else {
            res.status(404).json({ success: false, message: 'No blogs found for this category' });
        }
    } catch (error) {
        console.error("Error fetching blogs by category:", error);
        res.status(500).json({ success: false, message: "Error fetching blogs by category", error: error.toString() });
    }
};

exports.createBlogController = async(req,res) => {
    try {
      const uploadedImage = req.file ? `/uploads/${req.file.filename}` : req.body.image;

      const { title, description, category, tags = [], status = 'Draft', user } = req.body;
      
      if (!title || !description || !category || !user) {
            return res.status(400).send({
                success: false,
                message: "Please Provide all fields",
            });
        }
        if (!uploadedImage) {
          return res.status(400).json({ success: false, message: "Image file is required" });
      }

        const existingUser= await userModel.findById(user);
     if(!existingUser){
        return res.status(404).send({
            success: false,
            message:'unable to find user',
        });
     }
     let parsedTags;
        try {
            parsedTags = JSON.parse(tags);
            if (!Array.isArray(parsedTags)) parsedTags = [];
        } catch (error) {
            parsedTags = [];
        }

        const tagIds = await Promise.all(
          parsedTags.map(async (tagName) => {
              let tag = await Tag.findOne({ tag_name: tagName });
              if (!tag) {
                  tag = new Tag({ tag_name: tagName });
                  await tag.save();
              }
              return tag._id;
          })
      );
        const newBlog = new blogModel({title, description,image: uploadedImage,category, tags: tagIds,  user: req.user._id,status: status || 'Draft', views: 0});
        const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({ session });
    existingUser.blogs.push(newBlog);
    await existingUser.save({ session });

    await Promise.all(tagIds.map(async (tagId) => {
      const blogTag = new BlogTag({
        blog_id: newBlog._id,
        tag_id: tagId
      });
      await blogTag.save({ session });
    }));

    await session.commitTransaction();
        await newBlog.save();
        return res.status(201).send({
            success:true,
            message: "Blog Created!",
            newBlog,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: "Error while creating Blog",
            error
    })
}
};

exports.updateBlogController = async (req, res) => {
  try {
      const { id } = req.params;
      const { title, description, image, status, category, tags } = req.body;

      const updatedBlog = await blogModel.findByIdAndUpdate(
          id,
          { title, description, image, status, category, tags },
          { new: true }
      );

      if (!updatedBlog) {
          return res.status(404).json({ success: false, message: "Blog not found" });
      }

      return res.status(200).json({ success: true, message: "Blog Updated!", blog: updatedBlog });
  } catch (error) {
      console.error("Error updating blog:", error);
      return res.status(500).json({ success: false, message: "Error updating blog", error: error.message });
  }
};

  exports.getUserDrafts = async (req, res) => {
    try {
        const { userId } = req.params;
        const drafts = await blogModel.find({ user: userId, status: 'Draft' });
        
        res.status(200).send({
            success: true,
            drafts
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error retrieving drafts",
            error: error.message
        });
    }
};
  
  exports.getBlogByIdController = async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await blogModel.findById(id).populate('user', 'username profile_image');
      if (!blog) {
        return res.status(404).send({
          success: false,
          message: "blog not found with this ID",
        });
      }
      return res.status(200).send({
        success: true,
        message: "fetched single blog",
        blog,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        success: false,
        message: "error while getting single blog",
        error,
      });
    }
  };
  
  exports.deleteBlogController = async (req, res) => {
    try {
      const blogId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID" });
      }
  
      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
  
      await blogModel.deleteOne({ _id: blog._id });
  
      return res.status(200).json({ success: true, message: "Blog Deleted Successfully!" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
  };

  exports.userBlogController = async (req, res) => {
    try {
      const userBlog = await userModel.findById(req.params.id).populate("blogs");
  
      if (!userBlog) {
        return res.status(404).send({
          success: false,
          message: "blogs not found with this id",
        });
      }
      return res.status(200).send({
        success: true,
        message: "user blogs",
        userBlog,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        success: false,
        message: "error in user blog",
        error,
      });
    }
  };

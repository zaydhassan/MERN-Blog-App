const mongoose = require("mongoose");

// Point-in-time snapshot of a blog's content, for version history / restore.
//
// Snapshots are created two ways:
//   - "Auto": the update controller writes one of the PREVIOUS content before
//     each successful update, so a writer can always roll back the last edit.
//   - "Manual": the writer saves a named checkpoint from the editor.
//
// `tags` stores tag NAMES (not ObjectIds) so a snapshot is immutable — renaming
// or deleting a Tag later never corrupts historical revisions, and listing
// needs no populate. `label` distinguishes the two kinds and any writer-given
// name. Capped by the list query (newest 50), not by a hard DB prune.
const blogRevisionSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    label: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

// Powers the per-blog history list (newest first) and ownership checks.
blogRevisionSchema.index({ blog: 1, created_at: -1 });

module.exports = mongoose.models.BlogRevision || mongoose.model("BlogRevision", blogRevisionSchema);
import React from "react";
import SavedBlogsView from "../components/SavedBlogsView";

// A reader's saved-for-later articles. Backed by /api/v1/bookmarks.
const Bookmarks = () => (
  <SavedBlogsView
    kind="bookmarks"
    endpoint="/api/v1/bookmarks"
    eyebrow="Your reading list"
    title="Bookmarks"
    subtitle="Articles you saved to read later."
    emptyTitle="No saved articles yet"
    emptyBody="Tap the bookmark icon on any post to save it here for later."
  />
);

export default Bookmarks;
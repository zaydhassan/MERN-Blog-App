import React from "react";
import SavedBlogsView from "../components/SavedBlogsView";

// Articles the user has read, derived from the server's BlogView records.
// Backed by /api/v1/reading-history.
const ReadingHistory = () => (
  <SavedBlogsView
    kind="history"
    endpoint="/api/v1/reading-history"
    eyebrow="Pick up where you left off"
    title="Reading History"
    subtitle="Articles you've read recently."
    emptyTitle="You haven't read any articles yet"
    emptyBody="Once you open a post, it'll show up here so you can revisit it."
  />
);

export default ReadingHistory;
import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  Box, Button, CircularProgress, Divider, Drawer, IconButton, InputLabel,
  List, ListItem, ListItemText, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import { History, Restore, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import moment from "moment";

// Version-history drawer for the blog editor. Lists a post's saved snapshots
// (manual checkpoints + the automatic pre-edit snapshot the server writes on
// every update), lets the writer save a new named checkpoint, restore one into
// the editor, or delete one.
//
// Stateless about the editor itself: the parent (EditBlog) owns the live
// editor state and supplies two callbacks — `onSaveSnapshot(label)` (POST the
// current editor content as a revision) and `onRestore(revision)` (load a
// snapshot's content back into the editor + Quill). This component only owns
// the list fetching + delete.

const BlogRevisionsDrawer = ({ blogId, open, onClose, onRestore, onSaveSnapshot }) => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRevisions = useCallback(async () => {
    if (!blogId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/blog/${blogId}/revisions`);
      if (data.success) setRevisions(data.revisions || []);
    } catch {
      toast.error("Couldn't load version history.");
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  // Fetch whenever the drawer is opened (cheap; keeps the list fresh after a
  // save/delete without tracking "dirty" flags).
  React.useEffect(() => {
    if (open) fetchRevisions();
  }, [open, fetchRevisions]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSnapshot(label.trim() || "Snapshot");
      setLabel("");
      await fetchRevisions();
    } catch {
      // onSaveSnapshot already toasts on failure.
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (revId) => {
    try {
      await axios.delete(`/api/v1/blog/revisions/${revId}`);
      setRevisions((prev) => prev.filter((r) => r._id !== revId));
      toast.success("Snapshot deleted.");
    } catch {
      toast.error("Couldn't delete snapshot.");
    }
  };

  const handleRestore = (rev) => {
    onRestore(rev);
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <History color="primary" />
          <Typography variant="h6">Version history</Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", mb: 2 }}>
          Snapshots are saved when you update the blog (auto) or when you save one below (manual). Restoring loads it into the editor — click Update to keep it.
        </Typography>

        {/* Save a named checkpoint from the current editor state. */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Label (e.g. before rewrite)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" size="small" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save snapshot"}
          </Button>
        </Stack>

        <Divider sx={{ mb: 1 }} />

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : revisions.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", py: 3, textAlign: "center" }}>
              No snapshots yet. Save one, or update the blog to create an auto snapshot.
            </Typography>
          ) : (
            <List disablePadding>
              {revisions.map((rev) => (
                <ListItem
                  key={rev._id}
                  disableGutters
                  sx={{ py: 1.25, borderBottom: 1, borderColor: "divider" }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Restore into editor">
                        <IconButton edge="end" size="small" color="primary" onClick={() => handleRestore(rev)} aria-label="Restore snapshot">
                          <Restore fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete snapshot">
                        <IconButton edge="end" size="small" color="error" onClick={() => handleDelete(rev._id)} aria-label="Delete snapshot">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {rev.label || "Snapshot"}
                        </Typography>
                        {rev.label === "Auto" && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>(auto)</Typography>
                        )}
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="caption" sx={{ color: "text.secondary" }}>
                          {moment(rev.created_at).format("MMM Do, YYYY [at] h:mm a")}
                        </Typography>
                        <Typography component="div" variant="body2" sx={{ color: "text.primary", mt: 0.25 }} noWrap>
                          {rev.title}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default BlogRevisionsDrawer;
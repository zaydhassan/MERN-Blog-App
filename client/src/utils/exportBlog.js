// Client-side blog export to PDF (html2pdf.js) and Markdown (turndown).
// Both libs are dynamically imported on first use so they stay out of the
// main bundle — a reader who never exports never downloads the ~150KB.
//
// The PDF renders a header (title + byline) followed by the already-sanitized
// blog HTML (BlogDetails keeps a contentRef on the .blog-content div, which is
// what we pass in). The Markdown path converts the stored HTML with turndown
// and prepends an H1 title + byline.

const slugify = (s) =>
  String(s || "blog")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "blog";

// Trigger a browser download for a text payload (used by the Markdown path).
const downloadBlob = (filename, content, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const byline = (blog) => {
  const author = blog?.user?.username || "Unknown";
  const date = blog?.created_at
    ? new Date(blog.created_at).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })
    : "";
  const cat = blog?.category ? ` · ${blog.category}` : "";
  return `By ${author}${date ? ` · ${date}` : ""}${cat}`;
};

// Render the blog content element to a downloadable PDF.
export const downloadBlogAsPdf = async (contentEl, blog) => {
  if (!contentEl) {
    throw new Error("Nothing to export yet.");
  }
  const html2pdf = (await import("html2pdf.js")).default;
  const wrapper = document.createElement("div");
  wrapper.style.padding = "0 8px";
  wrapper.style.color = "#1a1a1a";
  wrapper.style.fontFamily = "Georgia, 'Times New Roman', serif";
  wrapper.innerHTML =
    `<h1 style="font-size:24px;margin:0 0 8px">${escapeHtml(blog?.title || "Untitled")}</h1>` +
    `<p style="font-size:12px;color:#666;margin:0 0 20px;font-style:italic">${escapeHtml(byline(blog))}</p>` +
    `<hr style="border:none;border-top:1px solid #ddd;margin:0 0 20px" />` +
    contentEl.innerHTML;
  document.body.appendChild(wrapper);
  try {
    await html2pdf()
      .set({
        margin: [12, 12, 14, 12],
        filename: `${slugify(blog?.title)}.pdf`,
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", compress: true },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(wrapper)
      .save();
  } finally {
    wrapper.remove();
  }
};

// Convert the blog's stored HTML to a Markdown string and download it.
export const downloadBlogAsMarkdown = async (blog) => {
  const TurndownService = (await import("turndown")).default;
  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
  const body = td.turndown(blog?.description || "");
  const md =
    `# ${blog?.title || "Untitled"}\n\n` +
    `*${byline(blog)}*\n\n` +
    `---\n\n` +
    `${body}\n`;
  downloadBlob(`${slugify(blog?.title)}.md`, md, "text/markdown;charset=utf-8");
};

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
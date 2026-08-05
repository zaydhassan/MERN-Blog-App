import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

// Routes that only make sense for a signed-in user. Clicking one of these
// while anonymous should bounce to /login (and back again after sign-in)
// rather than dropping the user on a broken/empty page.
export const AUTH_GATED_PATHS = [
  "/blogs",
  "/leaderboard",
  "/profile",
  "/my-blogs",
  "/bookmarks",
  "/reading-history",
  "/create-blog",
  "/analytics",
  "/rewards",
  "/notifications",
];

// Returns a `go(path)` function. Public paths navigate straight through;
// auth-gated paths navigate straight through when signed in, otherwise they
// redirect to /login?redirect=<path> with a gentle toast. Used by the
// footer and navbar so link clicks are guarded consistently.
const useRequireAuth = () => {
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth.isLogin);

  const go = (path) => {
    if (!AUTH_GATED_PATHS.includes(path) || isLogin) {
      navigate(path);
      return;
    }
    toast("Please sign in to continue.", { icon: "🔒" });
    navigate(`/login?redirect=${encodeURIComponent(path)}`);
  };

  return go;
};

export default useRequireAuth;
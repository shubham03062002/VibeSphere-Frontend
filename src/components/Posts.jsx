import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant/base";
import { X, Edit3, Trash2 } from "lucide-react";

const Posts = () => {
  const [feedPosts, setFeedPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    caption: "",
    imageUrl: "",
  });
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null); // for modal
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const auth = useSelector((state) => state.auth);

  // Small helper to format date/time consistently
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (err) {
      return isoString;
    }
  };

  // -------- Fetch Posts --------
  const getFeedPosts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/posts`, {
        withCredentials: true,
      });
      setFeedPosts(res.data.posts || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching feed posts");
    }
  };

  const getMyPosts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/posts/me`, {
        withCredentials: true,
      });
      setMyPosts(res.data.posts || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching my posts");
    }
  };

  // -------- Create or Update --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        const res = await axios.put(
          `${BASE_URL}/posts/${editingPost._id}`,
          newPost,
          { withCredentials: true }
        );
        toast.success(res.data.message);
        setEditingPost(null);
      } else {
        const res = await axios.post(`${BASE_URL}/posts/createpost`, newPost, {
          withCredentials: true,
        });
        toast.success(res.data.message);
      }
      setNewPost({ title: "", caption: "", imageUrl: "" });
      getFeedPosts();
      getMyPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting post");
    }
  };

  // -------- Edit & Delete --------
  const handleEdit = (post) => {
    setNewPost({
      title: post.title,
      caption: post.caption,
      imageUrl: post.imageUrl,
    });
    setEditingPost(post);
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/posts/${postId}`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      getFeedPosts();
      getMyPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting post");
    }
  };

  // -------- Like Post --------
  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/like/post/${postId}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message);
      getFeedPosts();
      getMyPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error liking post");
    }
  };

  // -------- Comment Handlers --------
  const openComments = (post) => setSelectedPost(post);
  const closeComments = () => {
    setSelectedPost(null);
    setCommentText("");
    setEditingComment(null);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    try {
      if (editingComment) {
        const res = await axios.put(
          `${BASE_URL}/comment/${editingComment._id}`,
          { text: commentText },
          { withCredentials: true }
        );
        toast.success("Comment updated");
      } else {
        const res = await axios.post(
          `${BASE_URL}/comment/post/${selectedPost._id}`,
          { text: commentText },
          { withCredentials: true }
        );
        toast.success(res.data.message);
      }
      setCommentText("");
      setEditingComment(null);
      getFeedPosts();
      getMyPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await axios.delete(`${BASE_URL}/comment/${commentId}`, {
        withCredentials: true,
      });
      toast.success("Comment deleted");
      getFeedPosts();
      getMyPosts();
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const startEditComment = (comment) => {
    setEditingComment(comment);
    setCommentText(comment.text);
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      getFeedPosts();
      getMyPosts();
    }
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Please log in to view posts.
      </p>
    );
  }

  // ----------- Render Post Card -----------
  const renderPostCard = (post, isMyPost = false) => {
    const postDate = formatDateTime(post?.createdAt);
    return (
      <div key={post._id} className="bg-gray-50 shadow p-4 rounded-xl space-y-2">
        {post.user && (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={post.user?.profilePic || "/default.jpg"}
              alt="user"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{post.user?.username}</p>
              {postDate && (
                <p className="text-xs text-gray-500">{postDate}</p>
              )}
            </div>
          </div>
        )}
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <p className="text-gray-600">{post.caption}</p>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="mt-2 rounded-lg w-full" />
        )}

        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => handleLike(post._id)}
            className="flex items-center gap-1 text-blue-600"
          >
            👍 {post.likes?.length || 0}
          </button>

          <button
            onClick={() => openComments(post)}
            className="flex items-center gap-1 text-gray-600"
          >
            💬 {post.comments?.length || 0}
          </button>
        </div>

        {isMyPost && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => handleEdit(post)}
              className="bg-yellow-500 text-white px-3 py-1 rounded-md"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(post._id)}
              className="bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  // -------- Comment Modal --------
  const CommentModal = () =>
    selectedPost && (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl p-5 w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={closeComments}
            className="absolute right-3 top-3 text-gray-500 hover:text-black"
          >
            <X />
          </button>

          <h3 className="text-lg font-semibold mb-3">
            Comments on {selectedPost.user?.username}'s post
          </h3>

          <div className="space-y-2 mb-4">
            {selectedPost.comments?.length ? (
              selectedPost.comments.map((c) => {
                // Determine commenter object vs id string
                const commenter =
                  c.user && typeof c.user === "object" ? c.user : null;

                // if c.user is just an id string, we don't have user details here
                const commenterName = commenter?.username || "Unknown User";
                const commenterPic = commenter?.profilePic || "/default.jpg";
                const createdAt = c.createdAt
                  ? formatDateTime(c.createdAt)
                  : "";

                // check ownership: handle both object and id string
                const isCommentOwner =
                  (typeof c.user === "string" && c.user === auth.user?._id) ||
                  (c.user && c.user._id && c.user._id === auth.user?._id);

                return (
                  <div
                    key={c._id}
                    className="bg-gray-100 p-3 rounded-lg flex items-start gap-3 justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={commenterPic}
                        alt={commenterName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{commenterName}</div>
                        <div className="text-gray-700">{c.text}</div>
                        {createdAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {createdAt}
                          </div>
                        )}
                      </div>
                    </div>
                    {isCommentOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditComment(c)}
                          className="text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center">No comments yet.</p>
            )}
          </div>

          {/* Add/Edit comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                editingComment ? "Edit your comment..." : "Add a comment..."
              }
              className="border p-2 rounded-lg w-full"
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
            >
              {editingComment ? "Update" : "Post"}
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* ---------- Create/Edit Post ---------- */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-3">
          {editingPost ? "Edit Post" : "Create New Post"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
          <textarea
            placeholder="Caption"
            value={newPost.caption}
            onChange={(e) =>
              setNewPost({ ...newPost, caption: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newPost.imageUrl}
            onChange={(e) =>
              setNewPost({ ...newPost, imageUrl: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {editingPost ? "Update Post" : "Create Post"}
          </button>
        </form>
      </div>

      {/* ---------- My Posts ---------- */}
      <div>
        <h2 className="text-lg font-semibold mb-3">My Posts</h2>
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <p className="text-gray-500">No posts yet.</p>
          ) : (
            myPosts.map((p) => renderPostCard(p, true))
          )}
        </div>
      </div>

      {/* ---------- Feed Posts ---------- */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Feed</h2>
        <div className="space-y-4">
          {feedPosts.length === 0 ? (
            <p className="text-gray-500">No feed posts available.</p>
          ) : (
            feedPosts.map((p) => renderPostCard(p))
          )}
        </div>
      </div>

      {CommentModal()}
    </div>
  );
};

export default Posts;
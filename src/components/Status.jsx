

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../constant/base";

const Status = () => {
  const [myStatus, setMyStatus] = useState([]);
  const [feedStatus, setFeedStatus] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showInputBox, setShowInputBox] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const x = useSelector((s) => s.auth?.user?._id);

  // ------------ LOAD STATUS ------------
  const loadStatuses = async () => {
    try {
      const me = await axios.get(`${BASE_URL}/status/my`, { withCredentials: true });
      setMyStatus(me.data.statuses || []);
      const feed = await axios.get(`${BASE_URL}/status/status`, { withCredentials: true });
      setFeedStatus(feed.data.statuses || []);
    } catch (error) {
      console.error("Error loading statuses:", error);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  // ------------ ADD STATUS USING URL ------------
  const submitStatus = async () => {
    if (!url.trim()) return alert("Please enter image or video URL!");
    try {
      await axios.post(
        `${BASE_URL}/status/`,
        { imageUrl: url, text },
        { withCredentials: true }
      );
      setShowInputBox(false);
      setUrl("");
      setText("");
      loadStatuses();
    } catch (error) {
      console.error("Error adding status:", error);
      alert("Failed to add status");
    }
  };

  // ------------ OPEN STATUS VIEWER ------------
 // ... inside component
const openStatus = async (status, index) => {
  setCurrentIndex(index);

  try {
    // mark as viewed first (optional; viewStatus also returns viewers)
    await axios.get(`${BASE_URL}/status/view/${status._id}`, { withCredentials: true });

    // fetch the fully populated status (comments.user populated, viewers populated)
    const resp = await axios.get(`${BASE_URL}/status/${status._id}`, { withCredentials: true });

    if (resp.data && resp.data.status) {
      // update feedStatus and selectedStatus with the populated version
      const updatedFeed = [...feedStatus];
      updatedFeed[index] = {
        ...updatedFeed[index],
        ...resp.data.status,
      };
      setFeedStatus(updatedFeed);
      setSelectedStatus(updatedFeed[index]);
    } else {
      // fallback: set the provided status
      setSelectedStatus(status);
    }
  } catch (error) {
    console.error("Error opening status:", error);
    // fallback
    setSelectedStatus(status);
  }
};

  // ------------ NAVIGATE STATUS ------------
  const nextStatus = () => {
    if (currentIndex < feedStatus.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSelectedStatus(feedStatus[next]);
      setShowComments(false);
      setShowViewers(false);
      axios.get(`${BASE_URL}/status/view/${feedStatus[next]._id}`, { withCredentials: true })
        .then((resp) => {
          if (resp.data && resp.data.viewers) {
            const updatedFeed = [...feedStatus];
            updatedFeed[next] = { ...updatedFeed[next], viewers: resp.data.viewers };
            setFeedStatus(updatedFeed);
            setSelectedStatus(updatedFeed[next]);
          }
        })
        .catch((err) => console.error("Error auto-viewing next status:", err));
    } else {
      setSelectedStatus(null);
      setShowComments(false);
      setShowViewers(false);
    }
  };

  const prevStatus = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setSelectedStatus(feedStatus[prev]);
      setShowComments(false);
      setShowViewers(false);
      axios.get(`${BASE_URL}/status/view/${feedStatus[prev]._id}`, { withCredentials: true })
        .then((resp) => {
          if (resp.data && resp.data.viewers) {
            const updatedFeed = [...feedStatus];
            updatedFeed[prev] = { ...updatedFeed[prev], viewers: resp.data.viewers };
            setFeedStatus(updatedFeed);
            setSelectedStatus(updatedFeed[prev]);
          }
        })
        .catch((err) => console.error("Error auto-viewing prev status:", err));
    }
  };

  // ------------ LIKE STATUS ------------
  const likeStatus = async () => {
    if (!selectedStatus) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/like/status/${selectedStatus._id}`,
        {},
        { withCredentials: true }
      );

      const updatedLikes = response.data.likes || [];

      const updatedFeed = [...feedStatus];
      updatedFeed[currentIndex].likes = updatedLikes;

      setFeedStatus(updatedFeed);
      setSelectedStatus(updatedFeed[currentIndex]);
    } catch (error) {
      console.error("Error liking status:", error);
      alert("Failed to like status");
    }
  };

  // ------------ COMMENT STATUS ------------
  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/comment/status/${selectedStatus._id}`,
        { text: commentText },
        { withCredentials: true }
      );

      // Backend now returns all populated comments as response.data.comments
      const updatedComments = response.data.comments || [];

      const updatedFeed = [...feedStatus];
      updatedFeed[currentIndex].comments = updatedComments;

      setFeedStatus(updatedFeed);
      setSelectedStatus(updatedFeed[currentIndex]);
      setCommentText("");
    } catch (error) {
      console.error("Error commenting status:", error);
      alert("Failed to add comment");
    }
  };

  // ------------ VIEW VIEWERS ------------
  const fetchViewers = async () => {
    if (!selectedStatus) return;

    try {
      // endpoint added on backend: GET /status/viewers/:id
      const response = await axios.get(
        `${BASE_URL}/status/viewers/${selectedStatus._id}`,
        { withCredentials: true }
      );

      setViewers(response.data.viewers || []);
      setShowViewers(true);
    } catch (error) {
      console.error("Error fetching viewers:", error);
      alert("Failed to fetch viewers");
    }
  };

  // ------------ DELETE STATUS ------------
  const deleteStatus = async (statusId) => {
    if (!window.confirm("Are you sure you want to delete this status?")) return;

    try {
      await axios.delete(`${BASE_URL}/status/${statusId}`, { withCredentials: true });

      // Remove from local state
      setMyStatus(myStatus.filter((s) => s._id !== statusId));
      setFeedStatus(feedStatus.filter((s) => s._id !== statusId));
      setSelectedStatus(null);
      setShowComments(false);
      setShowViewers(false);
      alert("Status deleted successfully");
    } catch (error) {
      console.error("Error deleting status:", error);
      alert("Failed to delete status");
    }
  };

  // Check if current user liked the status
  const isLiked = selectedStatus?.likes?.some((like) => like === x || like._id === x);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 shadow-md">
        <h2 className="text-xl font-semibold">Status</h2>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto bg-white">
        {/* My Status Section */}
        <div className="p-4 border-b">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
            onClick={() => setShowInputBox(true)}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                {myStatus[0] ? (
                  <img
                    src={myStatus[0].imageUrl}
                    alt="My status"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">+</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">My Status</p>
              <p className="text-sm text-gray-500">
                {myStatus[0] ? "Tap to view" : "Tap to add status update"}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Updates Section */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Recent Updates
          </h3>
          <div className="space-y-2">
            {feedStatus.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No status updates yet</p>
            ) : (
              feedStatus.map((s, index) => (
                <div
                  key={s._id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                  onClick={() => openStatus(s, index)}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-teal-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-white p-0.5">
                        <img
                          src={s.user.profilePic}
                          alt={s.user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{s.user.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status Viewer Modal */}
      {selectedStatus && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => {
                  setSelectedStatus(null);
                  setShowComments(false);
                  setShowViewers(false);
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <img
                src={selectedStatus.user.profilePic}
                alt={selectedStatus.user.username}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="flex-1">
                <p className="text-white font-semibold">{selectedStatus.user.username}</p>
                <p className="text-white/80 text-sm">
                  {new Date(selectedStatus.createdAt).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              {/* Delete button - only show if it's user's own status */}
              {(selectedStatus.user._id === x || selectedStatus.user === x) && (
                <button
                  onClick={() => deleteStatus(selectedStatus._id)}
                  className="text-white hover:bg-red-500/30 rounded-full p-2 transition"
                  title="Delete status"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Progress bars */}
          <div className="flex gap-1 px-4 pb-2">
            {feedStatus.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    index === currentIndex ? "w-full" : index < currentIndex ? "w-full" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Navigation Areas */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
              onClick={prevStatus}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
              onClick={nextStatus}
            />

            {/* Media */}
            {selectedStatus.imageUrl && selectedStatus.imageUrl.endsWith?.(".mp4") ? (
              <video
                src={selectedStatus.imageUrl}
                autoPlay
                controls
                className="max-h-[80vh] w-auto object-contain"
              />
            ) : (
              <img
                src={selectedStatus.imageUrl}
                alt="Status"
                className="max-h-[80vh] w-auto object-contain"
              />
            )}

            {/* Text overlay */}
            {selectedStatus.text && (
              <div className="absolute bottom-32 left-0 right-0 px-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-lg mx-auto">
                  <p className="text-white text-center text-lg">{selectedStatus.text}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* View Count */}
              <button
                onClick={fetchViewers}
                className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-full transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-sm font-medium">{selectedStatus.viewers?.length || 0}</span>
              </button>

              {/* Like Button */}
              <button
                onClick={likeStatus}
                className="flex items-center gap-2 text-white hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <svg
                  className={`w-6 h-6 ${isLiked ? "fill-red-500" : "fill-none"}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {selectedStatus.likes?.length > 0 ? selectedStatus.likes.length : "Like"}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-white hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {selectedStatus.comments?.length > 0 ? selectedStatus.comments.length : "Reply"}
                </span>
              </button>

              {/* Share Button */}
              <button className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md max-h-96 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Comments</h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {selectedStatus.comments?.length > 0 ? (
                    selectedStatus.comments.map((comment, idx) => (
                      <div key={comment._id || idx} className="flex gap-3">
                        <img
                          src={comment.user?.profilePic || "/default-avatar.png"}
                          alt={comment.user?.username || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {comment.user?.username || "Unknown User"}
                          </p>
                          <p className="text-white/80 text-sm">{comment.text}</p>
                          <p className="text-white/50 text-xs mt-1">
                            {new Date(comment.createdAt).toLocaleString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/50 text-center py-4">No comments yet</p>
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/10 text-white placeholder-white/50 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={addComment}
                    className="bg-teal-600 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-700 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Viewers Modal */}
          {showViewers && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-white font-semibold">Viewed by {viewers.length}</h3>
                  <button onClick={() => setShowViewers(false)} className="text-white/70 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto max-h-80">
                  {viewers.length > 0 ? (
                    viewers?.map((viewer) => (
                      <div
                        key={viewer._id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-800 transition"
                      >
                        <img
                          src={viewer.profilePic || "/default-avatar.png"}
                          alt={viewer.username || "User"}
                          className="w-12 h-12 rounded-full"
                        />
                        <p className="text-white font-medium">{viewer.username || "Unknown User"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/50 text-center py-8">No viewers yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Status Modal */}
      {showInputBox && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Add Status</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image or Video URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption (Optional)
                  </label>
                  <textarea
                    placeholder="Add a caption..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={submitStatus}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition shadow-lg"
                >
                  Post Status
                </button>
                <button
                  onClick={() => {
                    setShowInputBox(false);
                    setUrl("");
                    setText("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;
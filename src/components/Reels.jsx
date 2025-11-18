import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant/base";
import { Heart, MessageCircle, Share2, X } from "lucide-react";
import { CommentItem } from "./CommentItem";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [currentReel, setCurrentReel] = useState(null);
  const [commentText, setCommentText] = useState("");
  const videosRef = useRef([]);
  const observerRef = useRef(null);
  const auth = useSelector((state) => state.auth);

  const userId = auth?.user?._id || null;

  const formatDateTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const isLikedByUser = (likes, uid) => {
    if (!likes || !uid) return false;
    return likes.some((l) => {
      if (!l) return false;
      if (typeof l === "string") return l === uid;
      if (typeof l === "object") return String(l._id || l) === String(uid);
      return false;
    });
  };

  // -------- Fetch Reels from Backend --------
  const getReels = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reels/myreels`, { withCredentials: true });
      setReels(res.data.reels || []);
      if (currentReel) {
        const updated = (res.data.reels || []).find((r) => r._id === currentReel._id);
        if (updated) setCurrentReel(updated);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading reels");
    }
  };

  // -------- Like Reel --------
  const handleLike = async (reelId) => {
    try {
      const res = await axios.post(`${BASE_URL}/like/reel/${reelId}`, {}, { withCredentials: true });
      toast.success(res.data.message || "Liked!");
      if (res.data.likes) {
        setReels((prev) => prev.map((r) => (r._id === reelId ? { ...r, likes: res.data.likes } : r)));
        if (currentReel && currentReel._id === reelId) setCurrentReel((cr) => ({ ...cr, likes: res.data.likes }));
      } else {
        getReels();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error liking reel");
    }
  };

  // -------- Comment on Reel --------
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    if (!currentReel) return toast.error("No reel selected");

    try {
      const res = await axios.post(
        `${BASE_URL}/comment/reel/${currentReel._id}`,
        { text: commentText },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Comment added");

      // If backend returns populated comments, use them; otherwise refetch
      if (res.data.comments) {
        const updatedComments = res.data.comments;
        setReels((prev) => prev.map((r) => (r._id === currentReel._id ? { ...r, comments: updatedComments } : r)));
        setCurrentReel((cr) => ({ ...cr, comments: updatedComments }));
      } else if (res.data.comment) {
        setReels((prev) =>
          prev.map((r) =>
            r._id === currentReel._id ? { ...r, comments: [...(r.comments || []), res.data.comment] } : r
          )
        );
        setCurrentReel((cr) => ({ ...cr, comments: [...(cr.comments || []), res.data.comment] }));
      } else {
        await getReels();
      }

      setCommentText("");
      setShowCommentBox(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error posting comment");
      console.log(error?.response?.data || error);
    }
  };

  // -------- IntersectionObserver for AutoPlay --------
  useEffect(() => {
    if (!reels || reels.length === 0) return;

    // disconnect previous observer if any
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // do not change playback while comment modal is open (avoid focus loss / re-renders)
        if (showCommentBox) {
          entries.forEach((entry) => {
            try {
              entry.target.pause();
            } catch {}
          });
          return;
        }

        entries.forEach((entry) => {
          const video = entry.target;
          if (!video) return;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setActiveIndex(Number(video.dataset.index));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.65 }
    );

    observerRef.current = observer;

    videosRef.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [reels, showCommentBox]);

  useEffect(() => {
    getReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth?.isAuthenticated) {
    return <p className="text-center text-gray-500 mt-10">Please log in to view reels.</p>;
  }

  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-auto bg-black text-white">
      {reels.map((reel, i) => (
        <section key={reel._id} className="relative snap-start w-full h-screen flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-[720px] h-[85vh] sm:h-[92vh] flex items-center justify-center">
              <video
                ref={(el) => (videosRef.current[i] = el)}
                data-index={i}
                src={reel.videoUrl}
                className="rounded-xl max-h-full w-auto object-contain"
                loop
                playsInline
                controls
              />
            </div>
          </div>

          <div className="absolute left-4 bottom-8 z-20 max-w-[60%] sm:max-w-[50%]">
            <h3 className="font-semibold text-base">{reel.user?.username || "Unknown"}</h3>
            <p className="text-sm text-gray-200 break-words whitespace-pre-wrap">{reel.caption}</p>
            {reel.createdAt && <p className="text-xs text-gray-400 mt-2">{formatDateTime(reel.createdAt)}</p>}
          </div>

          <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 z-20">
            <button onClick={() => handleLike(reel._id)} className="flex flex-col items-center hover:scale-110 transition" aria-label="like">
              <Heart className={`w-7 h-7 ${isLikedByUser(reel.likes, userId) ? "fill-red-500 text-red-500" : "text-white"}`} />
              <span className="text-xs">{reel.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => {
                setShowCommentBox(true);
                setCurrentReel(reel);
                // clear previous input for a fresh start
                setCommentText("");
                // ensure videos stop reacting while modal open (observer respects showCommentBox via deps)
              }}
              className="flex flex-col items-center hover:scale-110 transition"
              aria-label="comments"
            >
              <MessageCircle className="w-7 h-7" />
              <span className="text-xs">{reel.comments?.length || 0}</span>
            </button>

            <button className="flex flex-col items-center hover:scale-110 transition" aria-label="share">
              <Share2 className="w-7 h-7" />
              <span className="text-xs">Share</span>
            </button>
          </div>
        </section>
      ))}

      {/* Comment Modal */}
      {showCommentBox && currentReel && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowCommentBox(false)} className="absolute right-3 top-3 text-gray-500 hover:text-black">
              <X />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img src={currentReel.user?.profilePic || "/default-avatar.png"} alt={currentReel.user?.username || "User"} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="text-lg font-semibold text-pink-800">Comments on {currentReel.user?.username || "Unknown"}'s reel</h3>
                {currentReel.createdAt && <p className="text-sm text-gray-500">{formatDateTime(currentReel.createdAt)}</p>}
              </div>
            </div>

            <div className="space-y-4 mb-4">
              {currentReel.comments?.length ? (
                currentReel.comments.map((comment) => {
                  const commenter = comment.user && typeof comment.user === "object" ? comment.user : null;
                  const commenterName = commenter?.username || (comment.user === userId ? auth.user?.username : "Unknown User");
                  return (
                    <div key={comment._id} className="flex items-start gap-3 bg-gray-100 p-3 rounded-lg text-red-500">
                      <img src={commenter?.profilePic || "/default-avatar.png"} alt={commenterName} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm text-blue-500">{commenterName}</div>
                          {comment.createdAt && <div className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</div>}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">{comment.text}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center">No comments yet</p>
              )}
            </div>

            <form onSubmit={handleComment} className="mt-4 space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  // debug log — remove when stable
                  // console.log("typing:", e.target.value);
                }}
                autoFocus
                placeholder="Add a comment..."
                className="w-full border rounded-lg p-3 resize-none min-h-[70px] text-gray-900 bg-white"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700">
                Post Comment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;
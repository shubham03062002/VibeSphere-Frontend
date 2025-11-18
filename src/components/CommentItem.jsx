import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../constant/base";


export const  CommentItem = ({ comment, auth, getReels, setCurrentReel }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
  
    const handleUpdate = async () => {
      try {
        const res = await axios.put(
          `${BASE_URL}/comment/${comment._id}`,
          { text: editText },
          { withCredentials: true }
        );
        toast.success(res.data.message || "Comment updated");
        setIsEditing(false);
        getReels();
        // Refresh current reel’s data to reflect updated text
        setCurrentReel((prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            c._id === comment._id ? { ...c, text: editText } : c
          ),
        }));
      } catch (error) {
        toast.error(error.response?.data?.message || "Error updating comment");
      }
    };
  
    const handleDelete = async () => {
      if (!window.confirm("Delete this comment?")) return;
      try {
        const res = await axios.delete(`${BASE_URL}/comment/${comment._id}`,{
          withCredentials: true,
        });
        toast.success(res.data.message || "Comment deleted");
        getReels();
        setCurrentReel((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c._id !== comment._id),
        }));
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting comment");
        console.log(error)
      }
    };
  
    return (
      <div className="flex items-start gap-3 border-b pb-2">
        <img
          src={comment.user?.profilePic || "/default-avatar.png"}
          alt={comment.user?.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm">{comment.user?.username}</p>
  
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border rounded-lg p-1 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="text-blue-600 text-sm font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">{comment.text}</p>
          )}
        </div>
  
        {/* Edit/Delete for own comments */}
        {comment.user?._id === auth.user?._id && !isEditing && (
          <div className="flex gap-2 text-xs text-gray-500">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
    );
  };
  
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaCommentDots, FaUserPlus } from "react-icons/fa";
import { BASE_URL } from "../constant/base";
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notification/`, {
        withCredentials: true,
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.log("Error fetching notifications:", err.message);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${BASE_URL}/notification/${id}/read`, {}, { withCredentials: true });

      // Update UI instantly
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log("Error marking as read:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderIcon = (type) => {
    if (type === "like") return <FaHeart className="text-red-500" />;
    if (type === "comment") return <FaCommentDots className="text-blue-500" />;
    if (type === "follow") return <FaUserPlus className="text-green-500" />;

    return <FaUserPlus />;
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-gray-400 text-center">No notifications yet.</p>
      )}

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            onClick={() => markRead(notif._id)}
            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition
            ${notif.isRead ? "bg-gray-200/60" : "bg-blue-100"}
          `}
          >
            {/* Profile Icon */}
            <img
              src={notif.sender?.profilePic}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold">{notif.sender?.username}</span>{" "}
                {notif.type === "like" && "liked your post"}
                {notif.type === "comment" && "commented on your post"}
                {notif.type === "follow" && "started following you"}
              </p>

              {/* Optional comment text */}
              {notif.text && (
                <p className="text-gray-600 text-xs mt-1">{notif.text}</p>
              )}

              <p className="text-[11px] text-gray-500 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Thumbnail Preview (Post or Reel) */}
            {notif.post && (
              <img
                src={notif.post.imageUrl}
                alt="post"
                className="w-12 h-12 rounded object-cover"
              />
            )}

            {notif.reel && (
              <video
                src={notif.reel.videoUrl}
                className="w-12 h-12 rounded object-cover"
                muted
              />
            )}

            {/* Type Icon */}
            <div>{renderIcon(notif.type)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;

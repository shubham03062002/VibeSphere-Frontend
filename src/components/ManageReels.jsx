import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant/base";
import { useSelector } from "react-redux";
import { Edit3, Trash2, PlusCircle } from "lucide-react";

const ManageReels = () => {
  const { user } = useSelector((state) => state.auth);

  const [reels, setReels] = useState([]);
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [editId, setEditId] = useState(null);
  const [editCaption, setEditCaption] = useState("");

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

  // ---------------- FETCH MY REELS ----------------
  const getMyReels = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reels/my`, {
        withCredentials:true
      });
      setReels(res.data.reels || []);
    } catch (error) {
      toast.error("Failed to load reels");
    }
  };

  // ---------------- CREATE REEL ----------------
  const handleAddReel = async (e) => {
    e.preventDefault();
    if (!videoUrl) return toast.error("Video URL is required");

    try {
      const res = await axios.post(
        `${BASE_URL}/reels/`,
        { videoUrl, caption },
        { withCredentials:true }
      );
      toast.success("Reel added");
      setVideoUrl("");
      setCaption("");
      // backend should return populated newReel or at least createdAt
      setReels((prev) => [res.data.newReel || res.data.reel || {}, ...prev]);
      getMyReels();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create reel");
    }
  };

  // ---------------- EDIT REEL ----------------
  const handleEdit = async (id) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/reels/${id}`,
        { caption: editCaption },
       {withCredentials:true}
      );

      toast.success("Reel updated");
      setReels((prev) => prev.map((r) => (r._id === id ? { ...r, caption: editCaption } : r)));
      setEditId(null);
      setEditCaption("");
      getMyReels();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // ---------------- DELETE REEL ----------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/reels/${id}`,{ withCredentials:true });
      toast.success("Reel deleted");
      setReels((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    getMyReels();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 mt-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">My Reels</h2>

      {/* ADD / EDIT FORM */}
      <form onSubmit={handleAddReel} className="space-y-4 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900"
          >
            <PlusCircle /> Upload
          </button>
        </div>
      </form>

      {/* REELS LIST */}
      <div className="mt-6 space-y-4">
        {reels.length === 0 ? (
          <p className="text-gray-500 text-center">No reels yet.</p>
        ) : (
          reels.map((reel) => (
            <div key={reel._id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <video
                  src={reel.videoUrl}
                  controls
                  className="w-full h-48 sm:h-36 object-cover rounded-lg"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">@{reel.user?.username}</p>
                    {reel.createdAt && (
                      <p className="text-xs text-gray-500">{formatDateTime(reel.createdAt)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditId(reel._id);
                        setEditCaption(reel.caption || "");
                      }}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Edit3 />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reel._id)}
                      className="text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  {editId === reel._id ? (
                    <>
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-2"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(reel._id)} className="bg-green-600 text-white px-3 py-1 rounded">
                          Save
                        </button>
                        <button onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700">{reel.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageReels;
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant/base";

const FollowersModal = ({ open, onClose, userId, type }) => {
  const [list, setList] = useState([]);



  useEffect(() => {
    if (!open) return;

    const fetchList = async () => {
      const url =
        type === "followers"
          ? `${BASE_URL}/follow_unfollow/${userId}/followers`
          : `${BASE_URL}/follow_unfollow/${userId}/following`;

      const res = await axios.get(url, { withCredentials: true });
      setList(type === "followers" ? res.data.followers : res.data.following);
    };

    fetchList();
  }, [open, type, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold mb-3 capitalize">{type}</h2>

        <div className="max-h-[300px] overflow-y-auto">
          {list.map((u) => (
            <div key={u._id} className="flex justify-between items-center p-2 border-b">
              <div className="flex gap-3 items-center">
                <img
                  src={u.profilePic}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-500 text-sm">@{u.username}</p>
                </div>
              </div>

              {/* UNFOLLOW BUTTON */}
              {type === "following" && (
                <button
                  onClick={async () => {
                    await axios.put(`${BASE_URL}/follow_unfollow/${u._id}`, {}, { withCredentials: true });
                    setList(list.filter((i) => i._id !== u._id));
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                >
                  Unfollow
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          className="w-full mt-4 py-2 bg-gray-800 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FollowersModal;

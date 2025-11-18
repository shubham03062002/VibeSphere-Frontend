import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant/base";
import { useSelector } from "react-redux";

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  const searchUser = async () => {
    if (!query.trim()) return;

    const res = await axios.get(`${BASE_URL}/user/search?query=${query}`, {
      withCredentials:true
    });

    setUsers(res.data.users);
  };

  const follow = async (id) => {
    await axios.put(`${BASE_URL}/follow_unfollow/${id}`, {}, {
      withCredentials:true
    });
    searchUser();
  };

  const unfollow = async (id) => {
    await axios.put(`${BASE_URL}/follow_unfollow/${id}`, {}, {
      withCredentials:true
    });
    searchUser();
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white shadow rounded-lg">
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Search username, name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 rounded" onClick={searchUser}>
          Search
        </button>
      </div>

      <div className="mt-5">
        {users.map((u) => (
          <div key={u._id} className="flex justify-between items-center p-2 border-b">
            <div className="flex items-center gap-3">
              <img src={u.profilePic || "/default.png"} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold">{u.firstName} {u.lastName}</p>
                <p className="text-gray-500 text-sm">@{u.username}</p>
              </div>
            </div>

            {u.isFollowing ? (
              <button
                className="px-3 py-1 border border-red-500 text-red-500 rounded"
                onClick={() => unfollow(u._id)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => follow(u._id)}
              >
                Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUsers;

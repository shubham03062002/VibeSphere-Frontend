import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant/base";
import ManageReels from "./ManageReels";
import FollowersModal from "./FollowersModal";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "followers" or "following"

  // Load my info
  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/userinfo`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.log(err));
  }, []);

  // Load suggested users
  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/suggesteduser`, { withCredentials: true })
      .then((res) => setSuggested(res.data.suggestions))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;

    const res = await axios.get(`${BASE_URL}/user/search?query=${search}`, {
      withCredentials: true,
    });
    setResults(res.data.users);
  };

  const followToggle = async (id) => {
    await axios.put(
      `${BASE_URL}/follow_unfollow/${id}`,
      {},
      { withCredentials: true }
    );
    // Refresh suggested + user
    window.location.reload();
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    await axios.put(
      `${BASE_URL}/user/userupdate`,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
      },
      { withCredentials: true }
    );

    alert("Profile updated!");
  };

  return (
    <div className="w-[90%] mx-auto py-10">
      {/* PROFILE INFO */}
      {user && (
        <div className="p-5 shadow-md rounded-xl bg-white">
          <div className="flex gap-4 items-center">
            <img
              src={user.profilePic || "https://via.placeholder.com/100"}
              className="w-24 h-24 rounded-full object-cover border"
            />

            <div>
              <h2 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-500">@{user.username}</p>
              <p>{user.bio || "No bio added"}</p>
            </div>
          </div>

          <div className="flex gap-10 mt-5">
            <div>{user.posts.length} Posts</div>
            <div>{user.reels.length} Reels</div>
            <div
              className="cursor-pointer hover:underline"
              onClick={() => {
                setModalType("followers");
                setModalOpen(true);
              }}
            >
              {user.followers.length} Followers
            </div>

            <div
              className="cursor-pointer hover:underline"
              onClick={() => {
                setModalType("following");
                setModalOpen(true);
              }}
            >
              {user.following.length} Following
            </div>
          </div>

          {/* UPDATE PROFILE FORM */}
          <form onSubmit={updateProfile} className="mt-6 grid gap-4">
            <input
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              className="border p-2 rounded"
              placeholder="First Name"
            />

            <input
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              className="border p-2 rounded"
              placeholder="Last Name"
            />

            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="border p-2 rounded"
              placeholder="Username"
            />

            <textarea
              value={user.bio || ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              className="border p-2 rounded"
              placeholder="Bio"
            />

            <input
              value={user.profilePic || ""}
              onChange={(e) => setUser({ ...user, profilePic: e.target.value })}
              className="border p-2 rounded"
              placeholder="Profile Image URL"
            />

            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Update Profile
            </button>
          </form>
        </div>
      )}

      {/* SEARCH */}
      <div className="mt-10 p-5 bg-white shadow rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Search Users</h3>
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or username..."
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Search
          </button>
        </div>

        {/* SEARCH RESULTS */}
        {results.length > 0 ? (
          <div className="mt-4">
            {results.map((u) => (
              <div key={u._id} className="flex justify-between p-2 border-b">
                <span>
                  {u.firstName} {u.lastName} (@{u.username})
                </span>
                <button
                  onClick={() => followToggle(u._id)}
                  className={`px-3 py-1 rounded text-white ${
                    u.isFollowing ? "bg-red-500" : "bg-blue-500"
                  }`}
                >
                  {u.isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          "No results found"
        )}
      </div>

      {/* SUGGESTED USERS */}
      <div className="mt-10 p-5 bg-white shadow rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Suggested Users</h3>

        {suggested.map((u) => (
          <div key={u._id} className="flex justify-between p-2 border-b">
            <span>@{u.username}</span>

            <button
              onClick={() => followToggle(u._id)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
      <ManageReels />

      <FollowersModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={user?._id}
        type={modalType}
      />
    </div>
  );
};

export default Profile;

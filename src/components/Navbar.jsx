import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Image, Video, Eye, Bell, User, LogOut, Info, Sparkles } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant/base";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/logout`, { 
        withCredentials: true 
      });
      toast.success(res.data.message);
      toast.success("Come Back Again!");
      navigate("/login");
      dispatch(logout());
      localStorage.clear();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Logout failed ❌");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/posts", label: "Posts", icon: <Image className="w-5 h-5" /> },
    { path: "/status", label: "Status", icon: <Eye className="w-5 h-5" /> },
    { path: "/reels", label: "Reels", icon: <Video className="w-5 h-5" /> },
    { path: "/notification", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
    { path: "/about", label: "About", icon: <Info className="w-5 h-5" /> },
  ];

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg fixed top-0 left-0 w-full z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold hidden sm:block">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Vibe
                </span>
                <span className="text-gray-800">Sphere</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive(link.path)
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.icon}
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Login
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Profile Button */}
                  <Link
                    to="/me"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      isActive("/me")
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <img
                      src={user?.profilePic || "/default-avatar.png"}
                      alt="profile"
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                    <span className="font-medium text-sm hidden xl:inline">
                      {user?.username || "User"}
                    </span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all hover:shadow-md"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-md"
              >
                Login
              </Link>
            ) : (
              <>
                {/* Profile Card - Mobile */}
                <Link
                  to="/me"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all"
                >
                  <img
                    src={user?.profilePic || "/default-avatar.png"}
                    alt="profile"
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user?.username || "User"}</p>
                    <p className="text-xs text-gray-600">View Profile</p>
                  </div>
                </Link>

                {/* Navigation Links - Mobile */}
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive(link.path)
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* Logout Button - Mobile */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
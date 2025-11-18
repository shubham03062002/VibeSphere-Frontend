import React, { useState } from "react";
import { Mail, Github, Phone, Globe, MessageCircle, Image, Video, Users, Heart, Share2, Eye, Trash2, Code, Database, Layout, Server } from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState("about");

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Live Chat",
      description: "Real-time messaging with instant notifications",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Posts",
      description: "Share photos and thoughts with your followers",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Reels",
      description: "Create and watch short-form video content",
      color: "from-pink-400 to-pink-600"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Status Updates",
      description: "24-hour stories that disappear automatically",
      color: "from-teal-400 to-teal-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Profiles",
      description: "Customizable bio section and profile pages",
      color: "from-orange-400 to-orange-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Interactions",
      description: "Like, comment, and share content seamlessly",
      color: "from-red-400 to-red-600"
    }
  ];

  const techStack = [
    {
      category: "Frontend",
      icon: <Layout className="w-6 h-6" />,
      technologies: ["React.js", "Redux", "Tailwind CSS", "Axios"],
      color: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      category: "Backend",
      icon: <Server className="w-6 h-6" />,
      technologies: ["Node.js", "Express.js", "Socket.io", "JWT"],
      color: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      category: "Database",
      icon: <Database className="w-6 h-6" />,
      technologies: ["MongoDB", "Mongoose"],
      color: "bg-gradient-to-br from-green-600 to-lime-600"
    },
    {
      category: "Tools",
      icon: <Code className="w-6 h-6" />,
      technologies: ["Git", "Postman", "VS Code", "Vercel"],
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-pulse">
            VibeSphere
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-light">
            A Modern Social Media Experience
          </p>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Connect, Share, and Engage with friends through posts, reels, status updates, and live chat
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "about"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:shadow-md"
            }`}
          >
            About Project
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "features"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:shadow-md"
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab("tech")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "tech"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:shadow-md"
            }`}
          >
            Tech Stack
          </button>
          <button
            onClick={() => setActiveTab("developer")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "developer"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:shadow-md"
            }`}
          >
            Developer
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* About Section */}
        {activeTab === "about" && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                About VibeSphere
              </h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p>
                  <strong className="text-purple-600">VibeSphere</strong> is a full-stack social media web application inspired by Instagram, designed to provide users with a seamless and engaging social networking experience.
                </p>
                <p>
                  Built with modern web technologies, VibeSphere combines the best features of popular social platforms into one cohesive application. Users can share their moments through posts and reels, stay connected with real-time chat, and express themselves through temporary status updates.
                </p>
                <p>
                  The platform emphasizes user experience with a clean, intuitive interface powered by React and Tailwind CSS, while maintaining robust backend functionality through Node.js and MongoDB for data persistence and scalability.
                </p>
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mt-8">
                  <h3 className="text-2xl font-bold mb-4 text-purple-700">Project Highlights</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Real-time communication using Socket.io
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Secure authentication with JWT tokens
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Responsive design for all devices
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Interactive UI with smooth animations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {activeTab === "features" && (
          <div className="animate-fadeIn">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-2 duration-300"
                >
                  <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack Section */}
        {activeTab === "tech" && (
          <div className="animate-fadeIn">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techStack.map((stack, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`${stack.color} w-14 h-14 rounded-xl flex items-center justify-center text-white`}>
                      {stack.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{stack.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {stack.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developer Section */}
        {activeTab === "developer" && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  SA
                </div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Shubham Asawale
                </h2>
                <p className="text-xl text-gray-600">Full Stack Developer</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6 text-gray-700 text-lg">
                <p className="text-center">
                  Passionate about creating elegant and user-friendly web applications with modern technologies. VibeSphere represents my vision of combining powerful backend functionality with beautiful, responsive frontend design.
                </p>

                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold mb-4 text-purple-700 text-center">Skills & Expertise</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {["React.js", "Node.js", "MongoDB", "Express.js", "Tailwind CSS", "Socket.io", "Redux", "RESTful APIs"].map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-purple-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Connect With Me</h3>
                  <div className="flex justify-center items-center gap-6 flex-wrap">
                    <a
                      href="https://wa.me/7887764390"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
                    >
                      <Phone className="w-5 h-5" />
                      WhatsApp
                    </a>
                    <a
                      href="mailto:shubhamasawale9@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </a>
                    <a
                      href="https://github.com/shubham03062002"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                    </a>
                    <a
                      href="https://shubham-portfolio-pied.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
                    >
                      <Globe className="w-5 h-5" />
                      Portfolio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-100 to-purple-100 text-gray-800 py-8 mt-12 shadow-inner">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-lg font-semibold">
            Designed & Developed by{" "}
            <span className="text-pink-600 font-bold">Shubham Asawale</span>
          </p>
          <p className="text-sm text-gray-600">
            Built with <span className="text-pink-500 font-medium">React.js</span>,{" "}
            <span className="text-green-600 font-medium">MongoDB</span>,{" "}
            <span className="text-blue-500 font-medium">Tailwind CSS</span>, and{" "}
            <span className="text-green-600 font-medium">Express.js</span>
          </p>
          <div className="flex justify-center items-center space-x-6">
            <a
              href="https://wa.me/7887764390"
              className="hover:text-pink-600 transition"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone />
            </a>
            <a
              href="mailto:shubhamasawale9@gmail.com"
              className="hover:text-pink-600 transition"
              aria-label="Gmail"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail />
            </a>
            <a
              href="https://github.com/shubham03062002"
              className="hover:text-pink-600 transition"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
            <a
              href="https://shubham-portfolio-pied.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Portfolio"
              className="hover:text-pink-600 transition"
            >
              <Globe />
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} VibeSphere. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
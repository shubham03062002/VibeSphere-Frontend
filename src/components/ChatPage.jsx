
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Circle, Search, MessageCircle, Menu, X } from 'lucide-react';

// ==================== CONFIGURATION ====================
const BASE_URL = 'https://vibe-spheres-chi.vercel.app/api';
const SOCKET_URL = 'https://vibe-spheres-chi.vercel.app/';

// ==================== SOCKET.IO CLIENT ====================
// You need to install: npm install socket.io-client
// Then uncomment this import and comment out the createSocket function:
import { io } from 'socket.io-client';
const socket = io(SOCKET_URL, { withCredentials: true, autoConnect: true });



// ==================== REDUX STATE MANAGEMENT ====================
const useAppState = () => {
  const [state, setState] = useState({
    auth: {
      isAuthenticated: false,
      user: null
    },
    chat: {
      chats: [],
      activeChat: null,
      messages: []
    }
  });

  const actions = {
    setChats: (chats) => setState(prev => ({
      ...prev,
      chat: { ...prev.chat, chats }
    })),
    
    setActiveChat: (chat) => setState(prev => ({
      ...prev,
      chat: { ...prev.chat, activeChat: chat }
    })),
    
    setMessages: (messages) => setState(prev => ({
      ...prev,
      chat: { ...prev.chat, messages }
    })),
    
    addMessage: (message) => setState(prev => ({
      ...prev,
      chat: { ...prev.chat, messages: [...prev.chat.messages, message] }
    })),
    
    loginSuccess: (user) => setState(prev => ({
      ...prev,
      auth: { isAuthenticated: true, user }
    }))
  };

  return { state, actions };
};

// ==================== API FUNCTIONS ====================
const api = {
  getAllUsers: async () => {
    const response = await fetch(`${BASE_URL}/user/all`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return { data };
  },

  getChats: async () => {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch chats');
    const data = await response.json();
    return { data };
  },

  openChat: async (userId) => {
    const response = await fetch(`${BASE_URL}/chat/open`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) throw new Error('Failed to open chat');
    const data = await response.json();
    return { data };
  },

  getMessages: async (chatId) => {
    const response = await fetch(`${BASE_URL}/chat/message/${chatId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return { data };
  },

  sendMessage: async (messageData) => {
    const response = await fetch(`${BASE_URL}/chat/message`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return { data };
  }
};

// ==================== CHAT LIST COMPONENT ====================
const ChatList = ({ users, onSelectChat, activeChat, chats }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <MessageCircle size={24} className="text-blue-500" />
          Messages
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => {
            const existingChat = chats.find(chat =>
              chat.members?.some(m => m._id === user._id)
            );
            const isActive = activeChat?.members?.some(m => m._id === user._id);

            return (
              <div
                key={user._id}
                onClick={() => onSelectChat(user)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-l-4 ${
                  isActive
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`;
                    }}
                  />
                  <Circle
                    className="absolute bottom-0 right-0 text-green-500 fill-green-500"
                    size={12}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate text-sm">
                    {user.username}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {existingChat?.lastMessage?.text || user.email || 'Start conversation'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ==================== CHAT WINDOW COMPONENT ====================
const ChatWindow = ({ activeChat, messages, currentUser, onSendMessage }) => {
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Please log in
          </h2>
          <p className="text-gray-500">
            You need to be logged in to use chat
          </p>
        </div>
      </div>
    );
  }

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Welcome to Chat App
          </h2>
          <p className="text-gray-500">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const otherUser = activeChat.members?.find(m => m._id !== currentUser?._id) || activeChat.otherUser;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.username || 'User')}&background=random`}
              alt={otherUser?.username}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.username || 'User')}&background=0D8ABC&color=fff`;
              }}
            />
            <Circle
              className="absolute bottom-0 right-0 text-green-500 fill-green-500"
              size={12}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {otherUser?.username || 'Unknown User'}
            </h3>
            <p className="text-sm text-green-600">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const senderId = msg.sender?._id || msg.sender;
              const myId = currentUser?._id;
              const isMine = senderId === myId;
              
              return (
                <div
                  key={msg._id || index}
                  className={`flex gap-2 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <img
                    src={
                      isMine
                        ? (currentUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'You')}&background=random`)
                        : (msg.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.username || 'User')}&background=random`)
                    }
                    alt={isMine ? 'You' : msg.sender?.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isMine ? currentUser?.username : msg.sender?.username || 'User')}&background=0D8ABC&color=fff`;
                    }}
                  />
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                      isMine
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMine ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
const ChatApp = () => {
  const { state, actions } = useAppState();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentUser = state.auth.user;
  const { chats, activeChat, messages } = state.chat;

  // Load current user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        actions.loginSuccess(userData);
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser?._id) return;

    // Join socket room
    socket.emit('join', currentUser._id);

    return () => {
    };
  }, [currentUser]);

  // Socket listener for new messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      
      // Add message if it's for the active chat
      if (activeChat && msg.chatId === activeChat._id) {
        actions.addMessage(msg);
      }
      
      // Refresh chats list
      api.getChats().then(res => {
        actions.setChats(res.data.chats || res.data || []);
      }).catch(err => console.error('Failed to refresh chats:', err));
    };

    // Listen for 'newMessage' event (matching backend)
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [activeChat]);

  // Load users
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.getAllUsers();
        setUsers(res.data.users || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Load chats
  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      try {
        const res = await api.getChats();
        actions.setChats(res.data.chats || res.data || []);
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };

    fetchChats();
  }, [currentUser]);

  const handleSelectChat = async (user) => {
    try {
      const chatRes = await api.openChat(user._id);
      const chat = chatRes.data.chat || chatRes.data;

      actions.setActiveChat(chat);

      const msgRes = await api.getMessages(chat._id);
      actions.setMessages(msgRes.data.messages || msgRes.data || []);

      const chatsRes = await api.getChats();
      actions.setChats(chatsRes.data.chats || chatsRes.data || []);

      setSidebarOpen(false);
    } catch (err) {
      console.error('Error opening chat:', err);
      setError('Failed to open chat');
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !activeChat) return;

    try {
      const messageData = {
        chatId: activeChat._id,
        text: text
      };

      const res = await api.sendMessage(messageData);
      const newMessage = res.data.message || res.data;

      actions.addMessage(newMessage);

      // Get the other user (receiver)
      const otherUser = activeChat.members?.find(m => m._id !== currentUser?._id);

      if (socket && otherUser) {
        // Send with correct event name and structure matching backend
        socket.emit('sendMessage', {
          receiverId: otherUser._id,
          message: newMessage
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
     
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <User size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Not Logged In</h2>
          <p className="text-gray-600 mb-4">Please log in to use the chat application.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-left">
            <p className="font-semibold text-yellow-800 mb-2">💡 Setup Instructions:</p>
            <p className="text-yellow-700 mb-2">After login, save user to localStorage:</p>
            <code className="block bg-yellow-100 p-2 rounded text-xs">
              localStorage.setItem('user', JSON.stringify(userData));
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-left space-y-2">
            <p className="text-gray-700">
              <strong>Backend:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{BASE_URL}</code>
            </p>
            <p className="text-gray-700">
              <strong>Socket:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{SOCKET_URL}</code>
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-80 h-full transition-transform duration-300 ease-in-out z-40 shadow-lg`}
      >
        <ChatList
          users={users}
          chats={chats}
          onSelectChat={handleSelectChat}
          activeChat={activeChat}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Window */}
      <div className="flex-1 h-full">
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
    
  );
};

export default ChatApp;
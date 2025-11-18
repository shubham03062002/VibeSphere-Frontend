import { useSelector, useDispatch } from "react-redux";
import { sendMessageApi } from "./chatApi";
import { addMessage } from "../redux/chatSlice";
import { useState, useEffect, useRef } from "react";
import "../../public/Chat.css";
import socket from "./Socket";

const ChatWindow = () => {
  const dispatch = useDispatch();

  const { activeChat, messages } = useSelector((s) => s.chat);
  const me = useSelector((s) => s.auth.user);

  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const send = async () => {
    if (!text.trim()) return;
  
    const data = { chatId: activeChat._id, text };
    const res = await sendMessageApi(data);
  
    dispatch(addMessage(res.data.message));
  
    socket.emit("send-message", res.data.message);
  
    setText("");
  };
  

  // --- ALL USEEFFECTS MUST ALWAYS COME BEFORE ANY RETURN ---
  useEffect(() => {
    if (activeChat?._id) {
      socket.emit("join-chat", activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    const handler = (msg) => dispatch(addMessage(msg));
    socket.on("new-message", handler);
    return () => socket.off("new-message", handler);
  }, [dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------------- NOW RETURNS ARE ALLOWED ----------------------

  if (!me) {
    return <div className="no-chat">Loading user...</div>;
  }

  if (!activeChat) {
    return <div className="no-chat">Select a chat to start messaging</div>;
  }

  // -------------- UI --------------
  return (
    <div className="chat-window">

      <div className="chat-header">
        <img src={activeChat.otherUser?.profilePic} />
        <h3>{activeChat.otherUser?.username}</h3>
      </div>

      <div className="messages">
        {messages.map((m) => {
          const isMine = m.sender?._id === me?._id;
          return (
            <div key={m._id} className={`msg ${isMine ? "mine" : "their"}`}>
              <p className="msg-text">{m.text}</p>
              <span className="msg-time">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      <div className="input-bar">
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>

    </div>
  );
};

export default ChatWindow;
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getChats, openChat, getMessages } from "./chatApi";
import { setChats, setActiveChat, setMessages } from "../redux/chatSlice";
import "../../public/Chat.css";

const ChatList = ({ users }) => {
  const dispatch = useDispatch();
  const { chats } = useSelector((s) => s.chat);
  const myId = useSelector((s) => s.auth.user?._id);

  // Load chat list
  useEffect(() => {
    getChats().then((res) => {
      dispatch(setChats(res.data.chats || res.data));
    });
  }, []);

  const handleSelectChat = async (u) => {
    try {
      // Create or open chat
      const chatRes = await openChat(u._id);
      const chat = chatRes.data.chat || chatRes.data;

      dispatch(setActiveChat(chat));

      // Load messages
      const msgRes = await getMessages(chat._id);
      dispatch(setMessages(msgRes.data.messages || msgRes.data));

      // Refresh chats
      getChats().then((res) =>
        dispatch(setChats(res.data.chats || res.data))
      );
    } catch (err) {
      console.error("Chat open failed:", err);
    }
  };

  return (
    <div className="chat-list-container">
      <h2 className="chat-list-title">Chats</h2>

      <div className="chat-list">
        {users?.map((u) => (
          <div
            key={u._id}
            className="chat-item"
            onClick={() => handleSelectChat(u)}
          >
            <img src={u.profilePic} alt="" />

            <div className="chat-info">
              <h4>{u.username}</h4>
              <p>Start conversation</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;

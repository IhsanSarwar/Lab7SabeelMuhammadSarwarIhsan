import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Room() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState("");

  // NEW: we need to know WHO the logged in user is
  // so we can show edit/delete only on their messages
  const [currentUser, setCurrentUser] = useState("");

  // NEW: track which message is being edited, and the new text
  const [editId, setEditId] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {
    // On load: find out who's logged in, then load messages
    loadCurrentUser();
    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, []);

  /** Asks the backend who the current session user is */
  async function loadCurrentUser() {
    const response = await fetch("http://localhost:8080/me", {
      credentials: "include",
    });
    const data = await response.json();
    if (data.username) setCurrentUser(data.username);
  }

  async function loadMessages() {
    const response = await fetch("http://localhost:8080/messages/" + roomId, {
      credentials: "include",
    });
    const data = await response.json();
    if (Array.isArray(data)) setMessages(data);
    else setMessages([]);
  }

  async function sendMessage(event) {
    event.preventDefault();
    await fetch("http://localhost:8080/send-message", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, text }),
    });
    setText("");
    loadMessages();
  }

  async function sendReply(messageId) {
    await fetch("http://localhost:8080/reply/" + messageId, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: replyText }),
    });
    setReplyText("");
    setReplyId("");
    loadMessages();
  }

  /** NEW: saves an edited message to the backend */
  async function saveEdit(messageId) {
    await fetch("http://localhost:8080/messages/" + messageId, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    });
    setEditId(""); // exit edit mode
    setEditText("");
    loadMessages();
  }

  /** NEW: deletes a message */
  async function deleteMessage(messageId) {
    await fetch("http://localhost:8080/messages/" + messageId, {
      method: "DELETE",
      credentials: "include",
    });
    loadMessages();
  }

  /** NEW: sends a thumbs up to the backend */
  async function thumbsUp(messageId) {
    await fetch("http://localhost:8080/messages/" + messageId + "/thumbsUp", {
      method: "POST",
      credentials: "include",
    });
    loadMessages();
  }

  /** NEW: sends a thumbs down to the backend */
  async function thumbsDown(messageId) {
    await fetch("http://localhost:8080/messages/" + messageId + "/thumbsDown", {
      method: "POST",
      credentials: "include",
    });
    loadMessages();
  }

  /** NEW: logs the user out and sends them to login page */
  async function logout() {
    await fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  }

  return (
    <div>
      <h1>Room {roomId}</h1>

      {/* NEW: logout button */}
      <button onClick={logout}>Logout</button>

      {messages.map((message) => (
        <div className="message" key={message._id}>
          {/* Show author name and formatted timestamp */}
          <b>{message.username}</b>
          <span style={{ fontSize: "0.8em", color: "#888", marginLeft: "8px" }}>
            {new Date(message.createdAt).toLocaleString()}
          </span>

          {/* If this message is being edited, show an input instead of the text */}
          {editId === message._id ? (
            <div>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <button onClick={() => saveEdit(message._id)}>Save</button>
              <button onClick={() => setEditId("")}>Cancel</button>
            </div>
          ) : (
            <p>{message.text}</p>
          )}

          {/* Thumbs up/down — anyone can click these */}
          <button onClick={() => thumbsUp(message._id)}>
            👍 {message.thumbsUp}
          </button>
          <button onClick={() => thumbsDown(message._id)}>
            👎 {message.thumbsDown}
          </button>

          {/* Edit/Delete — ONLY show if this message belongs to the current user */}
          {message.username === currentUser && (
            <span>
              <button
                onClick={() => {
                  setEditId(message._id);
                  setEditText(message.text);
                }}
              >
                Edit
              </button>
              <button onClick={() => deleteMessage(message._id)}>Delete</button>
            </span>
          )}

          {/* Replies */}
          {message.replies.map((reply, index) => (
            <div className="reply" key={index}>
              <b>{reply.username}</b>
              <p>{reply.text}</p>
            </div>
          ))}

          {/* Reply input toggle */}
          {replyId === message._id ? (
            <div>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button onClick={() => sendReply(message._id)}>Reply</button>
            </div>
          ) : (
            <button onClick={() => setReplyId(message._id)}>Reply</button>
          )}
        </div>
      ))}

      <form onSubmit={sendMessage}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button>Send</button>
      </form>
    </div>
  );
}

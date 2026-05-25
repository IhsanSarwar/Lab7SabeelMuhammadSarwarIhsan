
import {
  useEffect,
  useState
} from 'react';

import { useParams }
from 'react-router-dom';

export default function Room() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyId, setReplyId] = useState('');

  useEffect(() => { // load messages upon page load
    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, []);

  async function loadMessages() {
    const response = await fetch('http://localhost:8080/messages/' +
      roomId, { credentials: 'include'} // make request to backend and send session info
    );
    const data = await response.json();
    if (Array.isArray(data)) { setMessages(data);
    } else {  setMessages([]); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    await fetch(
      'http://localhost:8080/send-message',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: roomId,
          text: text
        })
      }
    );

    setText('');
    loadMessages();
  }

  async function sendReply(messageId) {

    await fetch(
      'http://localhost:8080/reply/' +
      messageId,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: replyText
        })
      }
    );

    setReplyText('');
    setReplyId('');
    loadMessages();

  }

  return (
    <div>

      <h1>Room {roomId}</h1>

      {
        messages.map((message) => (
          <div className="message" key={message._id} >
            <b>{message.username}</b>
            <p>{message.text}</p>
            {
              message.replies.map( (reply, index) => (
                <div className="reply" key={index} >
                  <b>{reply.username}</b>
                  <p>{reply.text}</p>
                </div>
              ))
            }

            {
              replyId === message._id ? (

                <div>
                  <input value={replyText} onChange={(event) => { setReplyText( event.target.value ); }} />
                  <button onClick={() => { sendReply(message._id); }} > Reply </button>
                </div>

              ) : (

                <button  onClick={() => {setReplyId(message._id); }} > Reply </button>

              )
            }

          </div>

        ))
      }

      <form onSubmit={sendMessage}>
        <input value={text} onChange={(event) => {setText( event.target.value  ); }} />
        <button>  Send </button>
      </form>

    </div>
  );
}

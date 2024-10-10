import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io("https://chat-ae-server.vercel.app", {
  transports: ['websocket', 'polling'], // Use WebSocket with fallback to polling
});

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleReceiveMessage = (data) => {
      const { user, message } = data;
      const msg = `${user} sent: ${message}`;
      setMessages(prevState => [msg, ...prevState]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_msg', handleReceiveMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_msg', handleReceiveMessage);
    };
  }, []);

  const handleEnterChatRoom = () => {
    if (user && room) {
      setChatIsVisible(true);
      socket.emit('join_room', { user, room });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsgData = {
        room: room,
        user: user,
        message: newMessage
      };
      socket.emit('send_msg', newMsgData, (error) => {
        if (error) {
          console.error('Error sending message:', error);
        } else {
          const msg = `${user} sent: ${newMessage}`;
          setMessages(prevState => [msg, ...prevState]);
          setNewMessage(""); // Clear input after successfully sending
        }
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!chatIsVisible ? (
        <>
          <input
            type="text"
            placeholder="user"
            value={user}
            onChange={e => setUser(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="room"
            value={room}
            onChange={e => setRoom(e.target.value)}
          />
          <br />
          <button onClick={handleEnterChatRoom}>Enter</button>
        </>
      ) : (
        <>
          <h5>Room: {room} | User: {user}</h5>
          <div
            style={{
              height: 200,
              width: 250,
              border: '1px solid #000',
              overflowY: 'scroll',
              marginBottom: 10,
              padding: 18
            }}
          >
            {messages.map((msg, index) => (
              <div key={index}>{msg}</div> // Using index as a key
            ))}
          </div>
          <input
            type="text"
            placeholder="message"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </>
      )}
    </div>
  );
}

export default App;

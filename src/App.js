import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://chat-ae-server.vercel.app", {
  transports: ['websocket', 'polling'],
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
      const newMsgData = { room, user, message: newMessage };
      socket.emit('send_msg', newMsgData, (error) => {
        if (error) {
          console.error('Error sending message:', error);
        } else {
          const msg = `${user} sent: ${newMessage}`;
          setMessages(prevState => [msg, ...prevState]);
          setNewMessage(""); // Clear input after sending
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      {!chatIsVisible ? (
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg text-center w-full max-w-sm">
          <h2 className="text-purple-400 text-2xl mb-6 font-bold">Join a Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-2 mb-4 text-white bg-gray-800 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={user}
            onChange={e => setUser(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room name"
            className="w-full p-2 mb-6 text-white bg-gray-800 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={room}
            onChange={e => setRoom(e.target.value)}
          />
          <button 
            className="w-full p-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition duration-200"
            onClick={handleEnterChatRoom}
          >
            Enter Room
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-white text-xl font-semibold">Room: {room} | User: {user}</h5>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="bg-gray-800 h-64 mb-4 p-4 overflow-y-scroll rounded-lg shadow-inner text-white">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <span className="text-purple-400 font-semibold">{msg}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full p-2 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button 
              className="p-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition duration-200"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

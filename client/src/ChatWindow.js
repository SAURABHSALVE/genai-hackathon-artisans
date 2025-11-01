// // src/ChatWindow.js
// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const ChatWindow = ({ receiverName, socket, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [currentMessage, setCurrentMessage] = useState('');
//   const messagesEndRef = useRef(null);
//   const username = localStorage.getItem('username') || 'Buyer';

//   // Join the chat room on mount
//   useEffect(() => {
//     if (socket) {
//       // Create a unique room name based on both users
//       const roomName = [username, receiverName].sort().join('-');
//       socket.emit('join', { room: roomName });

//       // Add listener for incoming messages
//       const messageListener = (message) => {
//         setMessages((prevMessages) => [...prevMessages, message]);
//       };
//       socket.on('receive_message', messageListener);

//       // Add a simulated artisan response for demo
//       setTimeout(() => {
//         socket.emit('send_message', {
//           room: roomName,
//           text: `Hi ${username}, this is ${receiverName}. How can I help you with my craft?`,
//           sender: receiverName,
//         });
//       }, 2000);

//       // Cleanup on unmount
//       return () => {
//         socket.off('receive_message', messageListener);
//       };
//     }
//   }, [socket, receiverName, username]);

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (currentMessage.trim() && socket) {
//       const roomName = [username, receiverName].sort().join('-');
//       const messageData = {
//         room: roomName,
//         text: currentMessage,
//         sender: username,
//       };
//       socket.emit('send_message', messageData);
//       setMessages((prevMessages) => [...prevMessages, messageData]);
//       setCurrentMessage('');
//     }
//   };

//   return (
//     <motion.div
//       className="chat-window"
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: 50 }}
//     >
//       <div className="chat-header">
//         <h4>Chat with {receiverName}</h4>
//         <button className="chat-close" onClick={onClose}>✕</button>
//       </div>
//       <div className="chat-messages">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`chat-message ${msg.sender === username ? 'sent' : 'received'}`}
//           >
//             <div className="message-bubble">
//               <span className="message-sender">{msg.sender}</span>
//               <p>{msg.text}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       <form className="chat-input-form" onSubmit={handleSendMessage}>
//         <input
//           type="text"
//           className="chat-input"
//           placeholder="Type your message..."
//           value={currentMessage}
//           onChange={(e) => setCurrentMessage(e.target.value)}
//         />
//         <button type="submit" className="chat-send-btn">Send</button>
//       </form>
//     </motion.div>
//   );
// };

// export default ChatWindow;


// src/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/*
  UPDATED:
  - Now accepts `senderName` as a prop.
  - No longer relies on localStorage.getItem('username').
  - This makes the component correct and reusable.
*/
const ChatWindow = ({ receiverName, senderName, socket, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Join the chat room on mount
  useEffect(() => {
    if (socket && senderName) { // Only join if we have a sender name
      // Create a unique room name based on both users
      const roomName = [senderName, receiverName].sort().join('-');
      socket.emit('join', { room: roomName });

      // Add listener for incoming messages
      const messageListener = (message) => {
        // Only add message if it's not already in the list (prevents duplicates)
        setMessages((prevMessages) => {
          if (!prevMessages.find(m => m.text === message.text && m.sender === message.sender)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      };
      socket.on('receive_message', messageListener);

      // Add a simulated artisan response for demo
      const welcomeMessage = `Hi ${senderName}, this is ${receiverName}. How can I help you with my craft?`;
      
      // Use a timeout to simulate the artisan typing
      const timer = setTimeout(() => {
        const welcomeMessageData = {
          room: roomName,
          text: welcomeMessage,
          sender: receiverName,
        };
        // Emit the message so the server can broadcast it (if logic exists)
        // and also add it locally for instant feedback
        socket.emit('send_message', welcomeMessageData);

      }, 1500);

      // Cleanup on unmount
      return () => {
        clearTimeout(timer);
        socket.off('receive_message', messageListener);
      };
    }
  }, [socket, receiverName, senderName]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() && socket && senderName) {
      const roomName = [senderName, receiverName].sort().join('-');
      const messageData = {
        room: roomName,
        text: currentMessage,
        sender: senderName, // Use the prop
      };
      socket.emit('send_message', messageData);
      
      // Add locally immediately
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setCurrentMessage('');
    }
  };

  return (
    <motion.div
      className="chat-window"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div className="chat-header">
        <h4>Chat with {receiverName}</h4>
        <button className="chat-close" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`chat-message ${msg.sender === senderName ? 'sent' : 'received'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="message-bubble">
              {/* Only show sender name if it's from the artisan */}
              {msg.sender !== senderName && (
                <span className="message-sender">{msg.sender}</span>
              )}
              <p>{msg.text}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">Send</button>
      </form>
    </motion.div>
  );
};

export default ChatWindow;

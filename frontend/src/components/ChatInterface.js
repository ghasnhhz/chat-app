import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socket';
import api from '../services/api';

const ChatInterface = ({ room }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and setup socket when room changes
  useEffect(() => {
    const loadMessagesAndConnect = async () => {
      setLoading(true);
      setMessages([]);

      try {
        // Load old messages from database
        const data = await api.getMessages(room._id);
        setMessages(data.messages);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }

      // Connect to socket
      socketService.connect();

      // Join the room
      socketService.joinRoom(room._id);

      // Listen for new messages
      socketService.onReceiveMessage((newMessage) => {
        console.log('Received message:', newMessage);
        setMessages((prev) => {
          // Check if message already exists (prevent duplicates)
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });
      });

      // Listen for errors
      socketService.onMessageError((error) => {
        console.error('Message error:', error);
        alert('Failed to send message');
      });
    };

    loadMessagesAndConnect();

    // Cleanup when leaving room
    return () => {
      socketService.leaveRoom(room._id);
      socketService.offReceiveMessage();
    };
  }, [room._id]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      roomId: room._id,
      text: message.trim(),
      userId: user._id,
      username: user.username
    };

    // Send via Socket.io - server will broadcast back
    socketService.sendMessage(messageData);
    
    // Clear input immediately
    setMessage('');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.userId._id === user._id ? 'justify-end' : 'justify-start'
                } animate-slideUp`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-md ${
                    msg.userId._id === user._id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.userId.username}
                  </p>
                  <p className="break-words">{msg.text}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSend} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="Type a message..."
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
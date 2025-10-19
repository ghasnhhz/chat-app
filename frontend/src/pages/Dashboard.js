import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Link2, LogOut, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateRoomModal from '../components/CreateRoomModal';
import RoomInfo from '../components/RoomInfo';
import ChatInterface from '../components/ChatInterface';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rooms, setRooms] = useState({ rooms: [] });
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await api.getMyRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = async (room) => {
    await loadRooms();
    setActiveRoom(room);
    setShowCreateModal(false);
  };

  const handleRoomClick = async (room) => {
    setActiveRoom(room);
    setShowRoomInfo(false);
  };

  const handleRoomInfoClick = async (room, e) => {
    e.stopPropagation();
    try {
      const details = await api.getRoomById(room._id);
      setRoomDetails(details);
      setShowRoomInfo(true);
    } catch (err) {
      console.error('Failed to load room details:', err);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await api.leaveRoom(roomId);
      await loadRooms();
      if (activeRoom?._id === roomId) {
        setActiveRoom(null);
      }
      setShowRoomInfo(false);
    } catch (err) {
      console.error('Failed to leave room:', err);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await api.deleteRoom(roomId);
      await loadRooms();
      if (activeRoom?._id === roomId) {
        setActiveRoom(null);
      }
      setShowRoomInfo(false);
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${activeRoom.inviteToken}`;
    navigator.clipboard.writeText(link);
    
    setShowCopiedToast(true);
    setTimeout(() => {
      setShowCopiedToast(false);
    }, 2000);
  };

  const createdRooms = rooms.rooms?.filter(room => room.createdBy._id === user._id) || [];
  const joinedRooms = rooms.rooms?.filter(room => room.createdBy._id !== user._id) || [];
  const hasRooms = rooms.rooms?.length > 0;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden shadow-lg`}
      >
        <div className="h-full flex flex-col">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{user?.username}</h3>
                <p className="text-sm text-gray-600">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white rounded-lg transition group"
                title="Logout"
              >
                <LogOut size={20} className="text-gray-600 group-hover:text-red-600 transition" />
              </button>
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Created Rooms */}
            {createdRooms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  My Rooms
                </h4>
                <div className="space-y-2">
                  {createdRooms.map((room) => (
                    <div
                      key={room._id}
                      className={`flex items-center rounded-xl overflow-hidden cursor-pointer transition-all ${
                        activeRoom?._id === room._id
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={(e) => handleRoomInfoClick(room, e)}
                        className="p-3 hover:bg-gray-200 transition"
                        title="Room Info"
                      >
                        <Users size={20} className="text-indigo-600" />
                      </button>
                      <div
                        onClick={() => handleRoomClick(room)}
                        className="flex-1 p-3"
                      >
                        <p className="font-semibold text-gray-800">{room.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Joined Rooms */}
            {joinedRooms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Joined Rooms
                </h4>
                <div className="space-y-2">
                  {joinedRooms.map((room) => (
                    <div
                      key={room._id}
                      className={`flex items-center rounded-xl overflow-hidden cursor-pointer transition-all ${
                        activeRoom?._id === room._id
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={(e) => handleRoomInfoClick(room, e)}
                        className="p-3 hover:bg-gray-200 transition"
                        title="Room Info"
                      >
                        <Users size={20} className="text-purple-600" />
                      </button>
                      <div
                        onClick={() => handleRoomClick(room)}
                        className="flex-1 p-3"
                      >
                        <p className="font-semibold text-gray-800">{room.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Room Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Plus size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-indigo-600 font-semibold">Create New Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
          </button>

          {activeRoom && !showRoomInfo && (
            <>
              <h2 className="text-xl font-bold text-gray-800 flex-1">
                {activeRoom.name}
              </h2>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Link2 size={20} />
                <span className="font-semibold">Share Link</span>
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {!hasRooms && !activeRoom ? (
            <div className="h-full flex items-center justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex flex-col items-center space-y-6 p-12 hover:bg-white rounded-3xl transition-all group"
              >
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all shadow-xl group-hover:shadow-2xl">
                  <Plus size={80} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800 mb-2">Create Your First Room</p>
                  <p className="text-gray-600">Start collaborating with your team today</p>
                </div>
              </button>
            </div>
          ) : activeRoom && !showRoomInfo ? (
            <ChatInterface room={activeRoom} />
          ) : showRoomInfo && roomDetails ? (
            <RoomInfo
              room={roomDetails}
              onClose={() => setShowRoomInfo(false)}
              onLeave={handleLeaveRoom}
              onDelete={handleDeleteRoom}
              isOwner={roomDetails.room.createdBy._id === user._id}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl">🡸</span>
              </div>
              <p className="text-lg font-medium">Select a room to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Copied Toast Notification */}
      {showCopiedToast && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-slideDown z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">Link copied to clipboard!</span>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
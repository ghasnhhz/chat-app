import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const JoinRoom = () => {
  const { inviteToken } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      joinRoomAutomatically();
    } else if (!loading && !user) {
      // Store invite token and redirect to login
      localStorage.setItem('pendingInvite', inviteToken);
      navigate('/login', { state: { from: `/join/${inviteToken}` } });
    }
  }, [user, loading]);

  const joinRoomAutomatically = async () => {
    setJoining(true);
    try {
      await api.joinRoom(inviteToken);
      localStorage.removeItem('pendingInvite');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  if (loading || joining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">
            {joining ? 'Joining room...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Join Room</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default JoinRoom;
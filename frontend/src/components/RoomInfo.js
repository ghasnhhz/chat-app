import React from 'react';
import { X, Trash2, DoorOpen, Crown } from 'lucide-react';

const RoomInfo = ({ room, onClose, onLeave, onDelete, isOwner }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{room.room.name}</h2>
            <p className="text-gray-600 mt-1">
              {room.membersLength} {room.membersLength === 1 ? 'member' : 'members'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Members</h3>
        <div className="space-y-3">
          {room.room.members.map((member) => (
            <div
              key={member._id}
              className="flex items-center space-x-3 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {member.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-800">{member.username}</p>
                  {member._id === room.room.createdBy._id && (
                    <Crown size={16} className="text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{member.role}</p>
                <p className="text-xs text-gray-400">{member.age} years old</p>
              </div>
              {member._id === room.room.createdBy._id && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-semibold shadow">
                  Owner
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-white">
        {isOwner ? (
          <button
            onClick={() => onDelete(room.room._id)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Trash2 size={20} />
            <span>Delete Room</span>
          </button>
        ) : (
          <button
            onClick={() => onLeave(room.room._id)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <DoorOpen size={20} />
            <span>Leave Room</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomInfo;
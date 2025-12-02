import React from 'react';
import { X, UserPlus, UserMinus } from 'lucide-react';

interface FriendRequest {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mutualFriends: number;
}

interface FriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export default function FriendRequestModal({
  isOpen,
  onClose,
  requests,
  onAccept,
  onReject
}: FriendRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Friend Requests</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-88px)]">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <UserPlus className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">No pending requests</p>
              <p className="text-slate-500 text-sm mt-2">Check back later for new friend requests</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={request.avatar}
                        alt={request.displayName}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {request.displayName}
                      </h3>
                      <p className="text-slate-400 text-sm">@{request.username}</p>
                      {request.mutualFriends > 0 && (
                        <p className="text-slate-500 text-xs mt-1">
                          {request.mutualFriends} mutual friend{request.mutualFriends !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onAccept(request.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(request.id)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
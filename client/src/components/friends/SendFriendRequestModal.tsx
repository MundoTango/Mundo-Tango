import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface SendFriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  onSubmit: (data: FriendRequestData) => void;
}

export interface FriendRequestData {
  message: string;
  metBefore: boolean;
  location?: string;
  memory?: string;
  media?: File[];
}

export default function SendFriendRequestModal({
  isOpen,
  onClose,
  recipientName,
  onSubmit
}: SendFriendRequestModalProps) {
  const [message, setMessage] = useState('');
  const [metBefore, setMetBefore] = useState(false);
  const [location, setLocation] = useState('');
  const [memory, setMemory] = useState('');
  const [media, setMedia] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      message,
      metBefore,
      location: metBefore ? location : undefined,
      memory: metBefore ? memory : undefined,
      media: media.length > 0 ? media : undefined
    });
    // Reset form
    setMessage('');
    setMetBefore(false);
    setLocation('');
    setMemory('');
    setMedia([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMedia(prev => [...prev, ...files].slice(0, 10)); // Max 10 files
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-2xl font-bold text-cyan-400">Send Friend Request to {recipientName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Message */}
          <div>
            <label className="block text-white font-medium mb-2">
              Personal Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to connect..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* We've met checkbox */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={metBefore}
                onChange={(e) => setMetBefore(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span className="text-white font-medium">We've met! 💃🕺</span>
            </label>
          </div>

          {/* Conditional fields shown when "We've met" is checked */}
          {metBefore && (
            <>
              {/* Where did we dance? */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Where did we dance?
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Salon Canning, Buenos Aires"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Share the memory */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Share the memory
                </label>
                <textarea
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="Tell them about your dance together..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Upload Photos/Videos */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Upload Photos/Videos from the Event
                  <span className="text-slate-500 text-sm font-normal ml-2">(Max 10 files, 10MB each)</span>
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="w-12 h-12 text-cyan-500" />
                    <p className="text-slate-400">Click to upload images or videos</p>
                  </label>
                  {media.length > 0 && (
                    <div className="mt-4 text-left">
                      <p className="text-sm text-slate-400 mb-2">{media.length} file(s) selected:</p>
                      <ul className="text-sm text-slate-500 space-y-1">
                        {media.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700 sticky bottom-0 bg-slate-900">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

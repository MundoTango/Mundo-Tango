import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Video, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'mrblue';
  timestamp: Date;
  videoUrl?: string;
}

export default function MrBlueChat() {
  const { t } = useTranslation(["pages", "common"]);
  const [location] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use apiRequest to include JWT authentication for god-level VibeCoding tools
      // Pass current page context so Mr. Blue knows where the user is
      const data = await apiRequest('/api/mrblue/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          context: {
            currentPage: location,
            pageTitle: document.title
          }
        }),
      });

      const mrBlueMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'I received your message!',
        sender: 'mrblue',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, mrBlueMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'mrblue',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async (prompt: string) => {
    setIsGeneratingVideo(true);
    try {
      const response = await fetch('/api/mrblue/luma/text-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();

      // Add video message
      const videoMessage: Message = {
        id: Date.now().toString(),
        content: 'Video generated successfully!',
        sender: 'mrblue',
        timestamp: new Date(),
        videoUrl: data.videoUrl,
      };

      setMessages(prev => [...prev, videoMessage]);
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            MB
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('pages:mrblue.chat.title', 'Mr Blue')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('pages:mrblue.chat.subtitle', 'Your AI Assistant')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-lg font-medium">{t('pages:mrblue.chat.welcome', 'Welcome to Mr Blue!')}</p>
            <p className="text-sm mt-2">{t('pages:mrblue.chat.getStarted', 'Send a message to get started.')}</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.videoUrl && (
                <div className="mt-2">
                  <video
                    src={message.videoUrl}
                    controls
                    className="w-full rounded"
                  />
                </div>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('pages:mrblue.chat.placeholder', 'Type your message...')}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => generateVideo(input)}
            disabled={!input.trim() || isGeneratingVideo}
            className="bg-purple-500 text-white rounded-lg p-3 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('pages:mrblue.chat.generateVideo', 'Generate Video')}
          >
            {isGeneratingVideo ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

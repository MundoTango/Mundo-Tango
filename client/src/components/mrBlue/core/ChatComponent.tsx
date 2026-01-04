import { useState } from 'react';
import { mrBlueApi, TextToVideoRequest, VideoGenerationResponse } from '../../services/mrBlueApi';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';

interface Message {
  id: string;
  type: 'user' | 'system' | 'error';
  content: string;
  timestamp: Date;
  videoUrl?: string;
  retryAttempt?: number;
}

export function MrBlueChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('unknown');

  // Check health on mount
  useState(() => {
    checkServiceHealth();
  });

  const checkServiceHealth = async () => {
    const health = await mrBlueApi.checkHealth();
    setHealthStatus(health.status);
    if (health.status === 'down') {
      addSystemMessage('Mr Blue service is currently unavailable. Please try again later.');
    }
  };

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    }]);
  };

  const addErrorMessage = (content: string, retryAttempt?: number) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'error',
      content,
      timestamp: new Date(),
      retryAttempt
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const request: TextToVideoRequest = {
        prompt: inputValue,
        aspectRatio: '16:9'
      };

      const response: VideoGenerationResponse = await mrBlueApi.generateTextToVideo(request);

      if (response.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: 'Video generation started successfully!',
          timestamp: new Date(),
          videoUrl: response.videoUrl,
          retryAttempt: response.retryAttempt
        }]);
      } else {
        addErrorMessage(
          response.error || 'Failed to generate video',
          response.retryAttempt
        );
      }
    } catch (error) {
      addErrorMessage('Unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold">Mr Blue AI Assistant</h2>
          <div className={`px-3 py-1 rounded-full text-sm ${
            healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
            healthStatus === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {healthStatus === 'healthy' ? '✓ Online' : '✗ Offline'}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' ? 'bg-blue-500 text-white' :
                message.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <p>{message.content}</p>
                {message.retryAttempt && message.retryAttempt > 1 && (
                  <p className="text-xs mt-1 opacity-75">
                    Retry {message.retryAttempt}/3
                  </p>
                )}
                {message.videoUrl && (
                  <video src={message.videoUrl} controls className="mt-2 rounded" />
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-gray-600">Generating video...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe the video you want to create..."
            disabled={isProcessing || healthStatus === 'down'}
            className="flex-1"
          />
          <Button type="submit" disabled={isProcessing || healthStatus === 'down'}>
            {isProcessing ? 'Generating...' : 'Send'}
          </Button>
        </form>
      </div>
    </Card>
  );
}

export default MrBlueChatComponent;

        import { useEffect, useRef, useState } from 'react';
        import { useAuth } from '../../context/AuthContext';
        import { getSocket } from '../../lib/api';
        import { Card, CardContent } from '../Card';

        interface Message {
          id: string;
          content: string;
          createdAt: string;
          user: {
            id: string;
            username: string;
            email: string;
          };
          isSystem?: boolean;
        }

        export function MessageList({ roomId }: { roomId: string }) {
          const { token, user } = useAuth();
          const [messages, setMessages] = useState<Message[]>([]);
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState<string | null>(null);
          const messagesEndRef = useRef<HTMLDivElement>(null);
          const messagesContainerRef = useRef<HTMLDivElement>(null);

          useEffect(() => {
            if (!token || !roomId) return;

            const socket = getSocket(token);

            setLoading(true);
            setError(null);

            socket.emit('joinRoom', { roomId }, (response: any) => {
              if (!response.success) {
                console.error('Failed to join room:', response.error);
                setError(response.error || 'Failed to join room');
                setLoading(false);
              }
            });

            const handleMessages = (initialMessages: Message[]) => {
              setMessages(initialMessages);
              setLoading(false);
            };

            const handleMessage = (newMessage: Message) => {
              setMessages((prev) => [...prev, newMessage]);
            };

            const handleUserJoined = (data: { user: any; roomId: string }) => {
              const systemMessage: Message = {
                id: Date.now().toString(),
                content: `${data.user.username} joined the room`,
                createdAt: new Date().toISOString(),
                user: { id: 'system', username: 'System', email: '' },
                isSystem: true,
              };
              setMessages((prev) => [...prev, systemMessage]);
            };

            const handleUserLeft = (data: { user: any; roomId: string }) => {
              const systemMessage: Message = {
                id: Date.now().toString(),
                content: `${data.user.username} left the room`,
                createdAt: new Date().toISOString(),
                user: { id: 'system', username: 'System', email: '' },
                isSystem: true,
              };
              setMessages((prev) => [...prev, systemMessage]);
            };

            const handleError = (error: { message: string }) => {
              console.error('Socket error in MessageList:', error);
              setError(error.message);
              setLoading(false);
            };

            socket.on('messages', handleMessages);
            socket.on('message', handleMessage);
            socket.on('userJoined', handleUserJoined);
            socket.on('userLeft', handleUserLeft);
            socket.on('error', handleError);

            return () => {
              socket.emit('leaveRoom', { roomId }, (response: any) => {
                if (!response.success) {
                  console.error('Failed to leave room:', response.error);
                }
              });
              socket.off('messages', handleMessages);
              socket.off('message', handleMessage);
              socket.off('userJoined', handleUserJoined);
              socket.off('userLeft', handleUserLeft);
              socket.off('error', handleError);
            };
          }, [roomId, token, user]);

          useEffect(() => {
            const container = messagesContainerRef.current;
            if (container) {
              const isNearBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 100;

              if (isNearBottom) {
                messagesEndRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
              }
            }
          }, [messages]);

          const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          };

          if (loading) {
            return (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-4 h-full flex flex-col min-h-0">
                  <div className="text-muted-foreground">Loading messages...</div>
                </CardContent>
              </Card>
            );
          }

          if (error) {
            return (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-4 h-full flex flex-col min-h-0">
                  <div className="text-red-600 text-center">
                    <div>Error loading messages</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardContent className="p-4 h-full flex flex-col min-h-0">
                {/* Messages container - scrollable area */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        currentUserId={user?.id}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button - fixed position within container */}
                {messages.length > 10 && (
                  <div className="flex-shrink-0 sticky bottom-0 pt-2 flex justify-center">
                    <button
                      onClick={scrollToBottom}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      Scroll to bottom
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }

        function MessageBubble({
          message,
          currentUserId,
        }: {
          message: Message;
          currentUserId: string | undefined;
        }) {
          const isOwn = message.user.id === currentUserId;
          const isSystem = message.isSystem || message.user.id === 'system';
          const time = new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          if (isSystem) {
            return (
              <div className="flex justify-center">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <div className="text-xs text-muted-foreground mb-1 px-2">
                    {message.user.username}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  <div className="break-words">{message.content}</div>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {time}
                </div>
              </div>
            </div>
          );
        } 
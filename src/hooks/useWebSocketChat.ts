import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import Swal from 'sweetalert2';
import { springApi } from '../api';
import { useAuthStore, useProfileStore } from '../hooks';

interface ChatMessage {
  email: string;
  content: string;
  timestamp?: string;
  boardId?: number;
  profileImageBase64?: string;
  profileImage?: string;
}

export const useWebSocketChat = (boardId: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { user } = useAuthStore() as { user: { id: number; username: string; email: string; profileImageBase64?: string } };
  const { profile } = useProfileStore();
  const baseURL = springApi.defaults.baseURL || '';

  useEffect(() => {
    springApi.get(`/api/chat/${boardId}/messages`)
      .then(res => {
        setMessages(res.data || []);
      })
      .catch(() => setMessages([]));

    const socket = new SockJS('/ws');
    const client = Stomp.over(socket);
    (client as any).debug = () => {};

    client.connect({}, () => {
      client.subscribe(`/topic/board.${boardId}`, (msg) => {
        const receivedMessage: ChatMessage = JSON.parse(msg.body);
        setMessages(prev => {
          const exists = prev.some(
            m =>
              m.email === receivedMessage.email &&
              m.content === receivedMessage.content &&
              m.timestamp === receivedMessage.timestamp
          );
          if (exists) return prev;
          return [...prev, receivedMessage];
        });
      });
    }, () => {
      Swal.fire('Error', 'No se pudo conectar al chat', 'error');
    });

    setStompClient(client);

    return () => {
      if (client && (client as any).connected) {
        client.disconnect(() => {
        });
      }
    };
  }, [boardId, baseURL]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const sendMessage = () => {
    if (message.trim() && stompClient && user) {
      let image = profile?.profileImageBase64 || '';
      if (image && !image.startsWith('data:image')) {
        image = `data:image/png;base64,${image}`;
      }
      const chatMessage: ChatMessage = {
        email: user.email,
        content: message,
        boardId,
        profileImageBase64: image,
      };

      stompClient.send(
        `/app/chat/${boardId}`,
        {},
        JSON.stringify(chatMessage)
      );

      setMessage('');
    }
  };

  return {
    messages,
    message,
    setMessage,
    handleMessageChange,
    sendMessage,
    listRef,
  };
};
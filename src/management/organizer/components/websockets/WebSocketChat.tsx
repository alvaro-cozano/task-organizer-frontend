import React, { useEffect, useRef } from 'react';

import {
  List,
  Avatar,
  TextField,
  Button,
  Typography
} from '@mui/material';

import { useWebSocketChat, useAuthStore } from '../../../../hooks';

import '../../style/WebSocketChat.css'

interface WebSocketChatProps {
  boardId: number;
  onClose?: () => void;
}

const WebSocketChat: React.FC<WebSocketChatProps> = ({ boardId, onClose }) => {
  const {
    messages,
    message,
    handleMessageChange,
    sendMessage,
  } = useWebSocketChat(boardId);

  const { user } = useAuthStore?.() || { user: null };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="websocket-chat-root">
      <div className="websocket-chat-header">
        <Typography variant="h6" className="websocket-chat-title">
          Chat
        </Typography>
        {onClose && (
          <Button onClick={onClose} size="small" color="secondary" className="websocket-chat-close-btn">
            ✕
          </Button>
        )}
      </div>
      <div ref={listRef} className="websocket-chat-list-container">
        <List className="websocket-chat-list">
          {messages.map((msg, index) => {
            const isOwn = user && msg.email === user.email;
            return (
              <div
                key={index}
                className={`websocket-chat-message-row${isOwn ? ' websocket-chat-message-own' : ''}`}
              >
                {!isOwn && (
                  <Avatar
                    src={
                      typeof (msg.profileImage || msg.profileImageBase64) === 'string' &&
                      (msg.profileImage || msg.profileImageBase64)
                        ? (msg.profileImage || msg.profileImageBase64)!.startsWith('data:image')
                          ? (msg.profileImage || msg.profileImageBase64)
                          : `data:image/png;base64,${msg.profileImage || msg.profileImageBase64}`
                        : undefined
                    }
                    className="websocket-chat-avatar"
                  >
                    {!msg.profileImage && !msg.profileImageBase64 && msg.email?.charAt(0).toUpperCase()}
                  </Avatar>
                )}
                <div
                  className={`websocket-chat-bubble${isOwn ? ' websocket-chat-bubble-own' : ''}`}
                >
                  <Typography variant="subtitle2" className="websocket-chat-email">
                    {msg.timestamp && (
                      <span className={`websocket-chat-timestamp${isOwn ? ' websocket-chat-timestamp-own' : ''}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                    {msg.email}
                  </Typography>
                  <Typography variant="body2" className="websocket-chat-content">
                    {msg.content}
                  </Typography>
                </div>
                {isOwn && (
                  <Avatar
                    src={
                      typeof (msg.profileImage || msg.profileImageBase64) === 'string' &&
                      (msg.profileImage || msg.profileImageBase64)
                        ? (msg.profileImage || msg.profileImageBase64)!.startsWith('data:image')
                          ? (msg.profileImage || msg.profileImageBase64)
                          : `data:image/png;base64,${msg.profileImage || msg.profileImageBase64}`
                        : undefined
                    }
                    className="websocket-chat-avatar websocket-chat-avatar-own"
                  >
                    {!msg.profileImage && !msg.profileImageBase64 && msg.email?.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </div>
            );
          })}
        </List>
      </div>
      <div className="websocket-chat-footer">
        <TextField
          label="Escribe un mensaje..."
          variant="outlined"
          value={message}
          onChange={handleMessageChange}
          fullWidth
          size="small"
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!message.trim()}
          className="websocket-chat-send-btn"
        >
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default WebSocketChat;

/**
 * ChatContext - Gestion de l'état du chat
 */

import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [messageLimit, setMessageLimit] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const setWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    setCurrentThread(null); // Reset thread when changing workspace
  };

  const setThread = (thread) => {
    setCurrentThread(thread);
  };

  const incrementMessageCount = () => {
    setMessageCount((prev) => prev + 1);
  };

  const value = {
    currentWorkspace,
    setWorkspace,
    currentThread,
    setThread,
    messages,
    setMessages,
    addMessage,
    updateMessage,
    clearMessages,
    messageCount,
    messageLimit,
    setMessageCount,
    setMessageLimit,
    incrementMessageCount,
    isStreaming,
    setIsStreaming,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export default ChatContext;

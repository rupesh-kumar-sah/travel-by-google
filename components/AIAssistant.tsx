import React, { useState, useRef, useEffect } from 'react';
import { AIAssistantIcon, SendIcon, SparklesIcon } from './Icons';
import { ChatMessage } from '../types';
import { getAiChatResponseStream } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your AI travel assistant for Nepal. I can help you plan the perfect trip based on your interests, budget, and timeline. What kind of experience are you looking for?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Add user message and an empty model message for streaming
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    
    try {
      // FIX: The history should not include the current user message, as it's sent in `sendMessageStream`.
      // The `messages` state variable at this point holds the correct history.
      const historyForApi = messages; 
      const stream = await getAiChatResponseStream(currentInput, historyForApi);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text += chunkText;
            return newMessages;
        });
      }

    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = 'Sorry, I am having trouble connecting. Please try again later.';
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 bg-gradient-to-br from-teal-400 to-cyan-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 z-50 transform hover:scale-110 transition-transform"
      >
        <AIAssistantIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 max-w-md mx-auto z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 h-[85%] bg-gray-50 dark:bg-[#101010] rounded-t-3xl flex flex-col p-4 border-t border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-6 h-6 text-teal-500 dark:text-teal-400"/>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Travel Assistant</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length-1].role === 'user' && ( // show loading dots only if last message is user (before model starts streaming)
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                  </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Nepal..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full py-3 pl-5 pr-14 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 p-2.5 rounded-full disabled:bg-gray-600" disabled={isLoading}>
                <SendIcon className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
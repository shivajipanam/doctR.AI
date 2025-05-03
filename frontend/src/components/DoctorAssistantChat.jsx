import React, { useState } from 'react';

export default function DoctorAssistantChat() {
  const [messages, setMessages] = useState([
    { text: "Hello Doctor, how can I assist you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    // Mock response (replace with backend later)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: `I'm processing your query: "${input}"`,
        sender: "bot"
      }]);
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-md flex flex-col">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg font-semibold text-lg">
        Doctor Assistant
      </div>

      <div className="p-4 h-96 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
              msg.sender === 'user'
                ? 'bg-blue-100 self-end'
                : 'bg-gray-200 self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex border-t border-gray-200">
        <input
          type="text"
          className="flex-1 px-4 py-3 outline-none text-sm"
          placeholder="Ask a question about a patient..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-6 text-sm font-medium hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

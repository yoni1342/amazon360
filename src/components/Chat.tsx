"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";

interface Message {
  text: string;
  isUser: boolean;
  isHtml?: boolean;
  timestamp?: Date;
}

interface WebhookResponse {
  output: string;
  activeQuestion: string;
  data: {
    isFollowup: boolean;
  };
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-3 w-fit">
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  </div>
);

export default function Chat({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chatHistory-${sessionId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      {
        text: "Hello! I'm your AI assistant. How can I help you today?",
        isUser: false,
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { text: inputMessage, isUser: true },
    ]);
    setInputMessage("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout

      const response = await fetch(
        "https://n8n.gradientlogic.ai/webhook/a8123cc8-ac48-4fd4-b133-3a09deff4795/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatInput: inputMessage.replace(/<[^>]*>/g, ""),
            sessionId: sessionId,
            action: "sendMessage",
          }),
          signal: controller.signal,
          keepalive: true // Add keepalive option
        }
      );

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        console.error("Server error:", response.status, await response.text());
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      const data: WebhookResponse = responseText
        ? JSON.parse(responseText)
        : null;

      if (data?.output) {
        setMessages((prev) => [...prev, { text: data.output, isUser: false }]);
      }
    } catch (error) {
      console.error("Error details:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your message. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem(`chatHistory-${sessionId}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sessionId]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
            >
              {message.isUser ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(message.text),
                  }}
                />
              ) : (
                <ReactMarkdown className="prose prose-base max-w-none">
                  {message.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`p-2 rounded-lg ${
              isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

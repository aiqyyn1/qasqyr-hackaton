import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { parser } from "../../utills/parser/parser";

import PassingQuiz from "../modules/PassingQuiz";

// Chat component
function Chat({ messages, onSendMessage }) {
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    onSendMessage(inputMessage);
    setInputMessage('');

    // Scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'
              }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${message.isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200'
                }`}
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
            <div className="text-xs text-gray-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 rounded bg-gray-800 text-white"
            placeholder="Введите сообщение..."
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

const API_URL = 'http://172.20.10.2:8080/api';
const CHAT_API_URL = 'http://localhost:8888';

export default function Topic() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([]);
  const contentRef = useRef(null);
  const explainButtonRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Handle text selection in the content area
  const handleContentSelection = (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      setSelectedText(selectedText);

      // Get the position of the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      // Calculate position relative to the content area
      const x = rect.left - contentRect.left;
      const y = rect.top - contentRect.top - 40; // Position above the selection

      setSelectionPosition({ x, y });
    }
  };

  // Handle sending message to API
  const sendMessageToAPI = async (msg, content) => {
    try {
      const response = await fetch(`${CHAT_API_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msg,
          content: JSON.stringify(content)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      // Format the response text by replacing ** with proper markdown
      const formattedText = data.content[0].text.value
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
      return formattedText;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Произошла ошибка при отправке сообщения';
    }
  };

  // Handle sending message
  const handleSendMessage = async (text) => {
    if (!text) return;

    // Add user message
    const userMessage = {
      text: text,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to API and get response
    const response = await sendMessageToAPI(text, content);

    // Add AI response
    const aiMessage = {
      text: response,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  // Handle explain request
  const handleExplain = async (text) => {
    if (!text) return;

    // Add user message
    const userMessage = {
      text: `Объяснить: ${text}`,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to API and get response
    const response = await sendMessageToAPI(`Объяснить: ${text}`, content);

    // Add AI response
    const aiMessage = {
      text: response,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMessage]);

    // Clear selection
    setSelectedText('');
  };

  // Handle click outside the explain button
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (explainButtonRef.current && !explainButtonRef.current.contains(e.target)) {
        setSelectedText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchTopic() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/modules/topics/${id}`);
        const data = await res.json();
        setContent(data.content);
      } catch (e) {
        setContent(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTopic();
  }, [id]);

  const handleQuizClick = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = () => {
    setShowQuiz(false);
  };

  return (
    <div className="flex h-[100vh] gap-4">
      {showQuiz ? (
        <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto">
          <PassingQuiz 
            quizId={id} 
            onComplete={handleQuizComplete}
          />
        </div>
      ) : (
        <>
          <div
            ref={contentRef}
            className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto text-white relative"
            onMouseUp={handleContentSelection}
          >
            {/* Плавающая кнопка Quiz */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleQuizClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                title="Пройти тест по теме"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

{loading ? "Загрузка..." : content ? parser(content) : "Нет данных"}
            {selectedText && (
              <div
                ref={explainButtonRef}
                className="absolute z-10"
                style={{
                  left: `${selectionPosition.x}px`,
                  top: `${selectionPosition.y}px`,
                }}
              >
                <button
                  onClick={() => handleExplain(selectedText)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
                >
                  Объяснить
                </button>
              </div>
            )}
          </div>
          <div className="w-[400px] min-w-[300px] bg-gray-800 rounded-lg p-2 flex flex-col text-white">
            <Chat messages={messages} onSendMessage={handleSendMessage} />
          </div>
        </>
      )}
    </div>
  );
}
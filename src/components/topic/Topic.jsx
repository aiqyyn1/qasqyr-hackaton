import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { parser } from "../../utills/parser/parser";
import {ArcherContainer} from "react-archer";

// Заглушка для чата
function Chat() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">Чат с ИИ (заглушка)</div>
      <div className="p-2 border-t border-gray-700">
        <input
          className="w-full p-2 rounded bg-gray-800 text-white"
          placeholder="Введите сообщение..."
        />
      </div>
    </div>
  );
}

const API_URL = 'http://172.20.10.2:8080/api';

export default function Topic() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-[80vh] gap-4">
      <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto text-white">
        {loading ? "Загрузка..." : content ? <ArcherContainer>{parser(content)}</ArcherContainer> : "Нет данных"}
      </div>
      <div className="w-[400px] min-w-[300px] bg-gray-800 rounded-lg p-2 flex flex-col">
        <Chat />
      </div>
    </div>
  );
}
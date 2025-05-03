import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ModulesPage() {
  const { tokens } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 1,
    hours: 1,
    duration: 60 // in minutes
  });

  const API_URL = 'http://172.20.10.2:8080/api';

  // Fetch my linked modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/modules/my_linked`, {
          headers: {
            'Authorization': `Bearer ${tokens?.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }

        const data = await response.json();
        setModules(data);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    if (tokens?.access_token) {
      fetchModules();
    }
  }, [tokens?.access_token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'level' || name === 'hours' || name === 'duration' ? parseInt(value) : value
    });
  };

  // Create a new module
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create module');
      }

      // Refresh the modules list
      const refreshResponse = await fetch(`${API_URL}/modules/my_linked`, {
        headers: {
          'Authorization': `Bearer ${tokens?.access_token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setModules(refreshData);
      }

      // Close the modal and reset form
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        level: 1,
        hours: 1,
        duration: 60
      });

    } catch (err) {
      console.error("Error creating module:", err);
      setError('Failed to create module');
    }
  };

  // Render difficulty level as a string
  const getDifficultyText = (level) => {
    switch (level) {
      case 1: return 'Начальный';
      case 2: return 'Средний';
      case 3: return 'Продвинутый';
      default: return 'Неизвестный';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
            Qasqyr AI
          </Link>
          <h1 className="text-2xl font-medium">Мои Модули</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Создать модуль
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Module Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl h-full flex flex-col items-center justify-center p-6 cursor-pointer group hover:bg-gray-700/60 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 flex items-center justify-center mb-4 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-center">Создать новый модуль</h3>
            <p className="text-gray-400 text-center mt-2">Добавьте собственный учебный модуль</p>
          </div>

          {/* Module Cards */}
          {modules.map(module => (
            <div key={module.id} className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl h-full flex flex-col">
              <div className="h-48 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-t-xl flex items-center justify-center p-4">
                {module.imageUrl ? (
                  <img
                    src={module.imageUrl}
                    alt={module.name}
                    className="h-full object-contain rounded"
                  />
                ) : (
                  <span className="text-2xl font-bold text-center">{module.name}</span>
                )}
              </div>

              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold mb-2">{module.name}</h3>
                <p className="text-gray-300 mb-4 line-clamp-3">{module.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700/40 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Сложность</div>
                    <div className="font-medium">
                      {getDifficultyText(module.difficulty)}
                    </div>
                  </div>

                  <div className="bg-gray-700/40 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Вопросов</div>
                    <div className="font-medium">{module.questionNumbers}</div>
                  </div>

                  <div className="bg-gray-700/40 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Длительность</div>
                    <div className="font-medium">{module.duration} мин</div>
                  </div>

                  <div className="bg-gray-700/40 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Прошло</div>
                    <div className="font-medium">{module.passedUsersCount} чел.</div>
                  </div>
                </div>

                {module.topics && module.topics.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Темы</div>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map(topic => (
                        <span
                          key={topic.topicId}
                          className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full"
                        >
                          {topic.topicName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <Link
                  to={`/modules/${module.id}`}
                  className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-center py-2 rounded-lg font-medium transition-all"
                >
                  Открыть модуль
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-6">Создать новый модуль</h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Название
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                    placeholder="Название модуля"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                    placeholder="Описание модуля"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Уровень сложности
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                  >
                    <option value={1}>Начальный</option>
                    <option value={2}>Средний</option>
                    <option value={3}>Продвинутый</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Часы
                    </label>
                    <input
                      type="number"
                      name="hours"
                      min="1"
                      max="100"
                      value={formData.hours}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Длительность (мин)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      min="10"
                      max="500"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-all"
                >
                  Создать модуль
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
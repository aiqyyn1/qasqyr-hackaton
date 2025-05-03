import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Sample course data - will be replaced with actual API data when available
const SAMPLE_COURSES = [
  {
    id: '1',
    title: 'Введение в программирование',
    description: 'Основы программирования и алгоритмов',
    progress: 75
  },
  {
    id: '2',
    title: 'Казахский язык',
    description: 'Изучение грамматики и лексики казахского языка',
    progress: 30
  },
  {
    id: '3',
    title: 'Математика',
    description: 'Основы алгебры и геометрии',
    progress: 60
  }
];

export default function ProfilePage() {
  const { currentUser, tokens } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);

  const API_URL = 'http://172.20.10.2:8080/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch user profile using the correct endpoint
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${tokens?.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);

        // Use sample courses data until the actual API is available
        // When the actual API is ready, replace this with:
        /*
        const coursesResponse = await fetch(`${API_URL}/users/courses`, {
          headers: {
            'Authorization': `Bearer ${tokens?.access_token}`
          }
        });

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
        }
        */

        // Using sample data for now
        setCourses(SAMPLE_COURSES);

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (tokens?.access_token) {
      fetchProfile();
    }
  }, [tokens?.access_token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
            Qasqyr AI
          </Link>
          <h1 className="text-2xl font-medium">Мой Профиль</h1>
          <Link
            to="/modules"
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Мои Модули
          </Link>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="col-span-1 bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                  {profile.firstName?.[0] || profile.username?.[0] || '?'}
                </div>

                <h2 className="text-xl font-bold mb-1">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-400 mb-4">@{profile.username}</p>

                <div className="w-full border-t border-gray-700 my-4"></div>

                <div className="w-full space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined:</span>
                    <span>{new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="col-span-2 bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-bold mb-6">Статистика</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{profile.fireDays || 0}</div>
                  <div className="text-sm text-gray-400">Дней подряд</div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{profile.accuracy ? Math.round(profile.accuracy * 100) : 0}%</div>
                  <div className="text-sm text-gray-400">Точность</div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{(profile.score || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Очки</div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{profile.answeredQuestionsCount || 0}</div>
                  <div className="text-sm text-gray-400">Ответов</div>
                </div>
              </div>

              <div className="flex space-x-4 mb-4">
                <div className={`py-2 px-4 rounded-full ${profile.wasPlayedToday ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                  {profile.wasPlayedToday ? '✓ Занимался сегодня' : '✗ Не занимался сегодня'}
                </div>

                <div className={`py-2 px-4 rounded-full ${profile.wasPlayedYesterday ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                  {profile.wasPlayedYesterday ? '✓ Занимался вчера' : '✗ Не занимался вчера'}
                </div>
              </div>
            </div>

            {/* My Courses Section */}
            <div className="col-span-1 md:col-span-3 bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-bold mb-6">Мои Курсы</h2>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-gray-700/50 rounded-lg overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 flex items-center justify-center">
                        <span className="text-xl font-bold">{course.title}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{course.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-300">{course.progress}% завершено</span>
                          <Link
                            to={`/courses/${course.id}`}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                          >
                            Продолжить
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-700/30 rounded-lg p-8 text-center">
                  <h3 className="text-xl font-medium mb-2">У вас пока нет курсов</h3>
                  <p className="text-gray-400 mb-4">Начните свое обучение, записавшись на курс</p>
                  <Link
                    to="/courses"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-all"
                  >
                    Просмотреть доступные курсы
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
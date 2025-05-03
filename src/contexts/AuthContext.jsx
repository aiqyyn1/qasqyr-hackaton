import { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// API base URL
const API_URL = 'http://172.20.10.2:8080/api';

// Hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(() => {
    // Initialize tokens from localStorage if available
    const savedTokens = localStorage.getItem('auth_tokens');
    return savedTokens ? JSON.parse(savedTokens) : null;
  });

  // Register function
  async function signup(username, email, password, confirmPassword) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirm_password: confirmPassword
        }),
      });


    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Login function
  async function login(emailOrUsername, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server returned an error message, throw it
        throw new Error(data.message || data.error || 'Login failed');
      }

      // Save tokens
      setTokens(data);
      localStorage.setItem('auth_tokens', JSON.stringify(data));

      // Fetch user info using the token
      await fetchUserInfo(data.access_token);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Fetch user information using the access token
  async function fetchUserInfo(token) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await response.json();
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Don't throw here to prevent login from failing
    }
  }

  // Logout function
  function logout() {
    setCurrentUser(null);
    setTokens(null);
    localStorage.removeItem('auth_tokens');
  }

  // Check for existing token and fetch user info on load
  useEffect(() => {
    const initAuth = async () => {
      if (tokens?.access_token) {
        try {
          await fetchUserInfo(tokens.access_token);
        } catch (error) {
          // Token might be expired - clear everything
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [tokens?.access_token]);

  const value = {
    currentUser,
    tokens,
    signup,
    login,
    logout,
    isAuthenticated: !!tokens?.access_token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 
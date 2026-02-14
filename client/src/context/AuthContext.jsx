import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api.js';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
  error: null
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'CLEAR_ERRORS';
const LOAD_USER = 'LOAD_USER';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
        error: null
      };
    case AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
        error: null
      };
    case LOAD_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
        isAuthenticated: true
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await api.get('/auth/me');
          dispatch({
            type: LOAD_USER,
            payload: response.data.data.user
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          dispatch({
            type: LOGOUT
          });
        }
      } else {
        dispatch({
          type: LOGOUT
        });
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'CLEAR_ERRORS' });
      const response = await api.post('/auth/register', userData);
      
      const { user, token } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update state
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token }
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: 'CLEAR_ERRORS' });
      const response = await api.post('/auth/login', credentials);
      
      const { user, token } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update state
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token }
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({
      type: LOGOUT
    });
  };

  // Update user data
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_SUCCESS,
      payload: { user: userData, token: localStorage.getItem('token') }
    });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({
      type: 'CLEAR_ERRORS'
    });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateUser,
    clearErrors
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

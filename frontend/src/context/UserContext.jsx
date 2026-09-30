import { createContext, useEffect, useState, useCallback } from 'react';
import axios from "axios";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const serverUrl = "http://localhost:5000";

  const handleCurrentUser = useCallback(async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
      setUserData(result.data);
      return result.data;
    } catch (error) {
      setUserData(null);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUserData(null);
      setFrontendImage(null);
      setBackendImage(null);
      setSelectedImage(null);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, { command }, { withCredentials: true });
      return result.data;
    } catch (error) {
      return null;
    }
  };

  const fetchHistory = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/history`, { withCredentials: true });
      return result.data || [];
    } catch (error) {
      return [];
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete(`${serverUrl}/api/user/history`, { withCredentials: true });
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <userDataContext.Provider value={{
      serverUrl,
      userData,
      setUserData,
      isAuthLoading,
      frontendImage,
      backendImage,
      setFrontendImage,
      setBackendImage,
      selectedImage,
      setSelectedImage,
      handleCurrentUser,
      handleLogout,
      getGeminiResponse,
      fetchHistory,
      clearHistory
    }}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
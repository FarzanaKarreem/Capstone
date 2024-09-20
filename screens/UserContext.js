import React, { createContext, useContext, useState } from 'react';

// Create a context for user info
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to update user info
  const updateUser = (userInfo) => {
    setUser(userInfo);
  };

  // Function to clear user info on logout
  const clearUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  return useContext(UserContext);
};

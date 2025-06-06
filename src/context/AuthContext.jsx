import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const baseUrl = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const navigate = useNavigate();

  // Retrieve user tokens from local storage if any, so that
  // the tokens are not lost when refreshing the tab
  useEffect(() => {
    const cacheUser = localStorage.getItem("user");
    const cacheAccessToken = localStorage.getItem("accessToken");
    const cacheRefreshToken = localStorage.getItem("refreshToken");
    if (cacheUser && cacheAccessToken && cacheRefreshToken) {
      setUser(cacheUser);
      setAccessToken(cacheAccessToken);
      setRefreshToken(cacheRefreshToken);
    }
  }, [])

  // A convenient function that returns user login status
  const isLoggedIn = () => {
    return user && accessToken && refreshToken;
  }
  
  // Log in the user given username and password
  const loginUser = (username, password) => {
    fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
      .then(response => {
        response.json().then(data => {
          if (!response.ok) {
            alert(data.error);
            return;
          }
          // Update states and local storage
          setUser(data.username);
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          localStorage.setItem("user", data.username);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          navigate("/");
        })
      })
      .catch(error => {
        console.error('Error: ', error);
      });
  };

  // Log out the user
  const logoutUser = () => {
    fetch(`${baseUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    }).then(response => {
      response.json().then(data => {
        if (!response.ok) {
          alert(data.error);
          return;
        }
        // Clear states and local storage
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      }).catch(error => {
        console.error('Error: ', error);
      });
    })
    return;
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, loginUser, logoutUser, isLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};

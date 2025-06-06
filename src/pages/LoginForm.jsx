import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate('/');
    }
  });

  const login = (e) => {
    e.preventDefault();
    auth.loginUser(username, password);
  }

  return (
    <>
      <form onSubmit={login}>
        <h2>OmniChart</h2>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log in</button>
      </form>
      <div>
        <p>Do not have an account? <a href="/signup">Sign up</a></p>
      </div>
    </>
  )
}

export default LoginForm;

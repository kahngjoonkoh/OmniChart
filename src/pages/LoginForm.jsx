import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate('/');
    }
  }, [auth, navigate]);

  const login = (e) => {
    e.preventDefault();
    auth.loginUser(username, password);
  };

  return (
    <div className="flex items-center justify-center mt-0 md:mt-[10%] px-4 ">
      <form
        onSubmit={login}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-blue-600 text-center">OmniChart</h2>

        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Log in
        </button>

        <p className="text-center text-gray-600">
          Do not have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;

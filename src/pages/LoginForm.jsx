import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, useAuth } from '../context/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate('/');
    }
  }, [auth, navigate]);

  // Log in the user given username and password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      var { data, error } = await supabase
        .from("profiles")
        .select('email')
        .eq('username', username)
        .single();
      if (error) {
        if (error.details == "The result contains 0 rows") {
          setError("Invalid username or password");
        } else {
          setError(error.details);
        }
        return;
      }
      const { email } = data;
      ({ error } = await supabase.auth.signInWithPassword({
        'email': email,
        'password': password,
      }))
      if (error) {
        if (error.message == "Invalid login credentials") {
          setError("Invalid username or password");
        } else {
          setError(error.message);
        }
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-0 md:mt-[10%] px-4 ">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-blue-600 text-center">OmniChart</h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

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
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-semibold rounded ${loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transition'
            }`}
        >
          {loading ? 'Logging in...' : 'Log in'}
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

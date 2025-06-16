import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isLoggedIn } from '../client/Auth';
import { useAlert } from '../components/AlertBox';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addAlert } = useAlert();

  useEffect(() => {
    isLoggedIn().then((state) => {
      if (state) {
        navigate('/');
      }
    });
  }, [navigate]);

  // Log in the user given username and password
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      try {
        var { data, error } = await supabase
        .from("profiles")
        .select('email')
        .eq('username', username)
        .single();
      } catch (err) {
        addAlert("Failed to log in", "error");
        return;
      }
      
      if (error) {
        if (error.details == "The result contains 0 rows") {
          addAlert("Invalid username or password", "error");
        } else {
          addAlert(error.details);
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
          addAlert("Invalid username or password", "error");
        } else {
          addAlert(error.message, "error");
        }
        return;
      }
      navigate('/');
      addAlert("Successfully logged in", "success");
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

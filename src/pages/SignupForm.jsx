import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isLoggedIn } from '../client/Auth';
import { useAlert } from '../components/AlertBox';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addAlert } = useAlert();

  const navigate = useNavigate();

  useEffect(() => {
    isLoggedIn().then((state) => {
      if (state) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          }
        }
      })
      if (error) {
        if (error.message == "User already registered") {
          addAlert("Email already registered", "error");
        } else if (error.message == "Database error saving new user") {
          addAlert("Username already registered", "error");
        } else {
          addAlert(error.message, "error");
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      addAlert("Failed to sign up", "error");
      return;
    }
    setLoading(false);
    navigate('/');
    addAlert("Successfully signed up", "success");
  };

  return (
    <div className="flex items-center justify-center mt-0 md:mt-[10%] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Sign up for OmniChart</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;

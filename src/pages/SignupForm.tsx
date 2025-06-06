import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AuthContextType } from '../context/AuthContext.tsx';

const baseUrl = import.meta.env.VITE_API_URL;

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const auth: AuthContextType = useAuth();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate('/');
    }
  })

  // Handler for sign up
  const signup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch(`${baseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        password: password,
        email: email
      })
    })
      .then(response => {
        response.json().then((data => {
          if (!response.ok) {
            alert(data.error);
            return;
          }
          navigate('/');
        }))
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <>
      <form onSubmit={signup}>
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
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign up</button>
      </form>
      <div>
        <p>Already have an account? <a href="/login">Log in</a></p>
      </div>
    </>
  );
}

export default SignupForm;

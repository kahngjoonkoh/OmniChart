import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = (e) => {
    // Call APIs from backend to validate user
    e.preventDefault();
    console.log("Submitted: ", { username, password });
    navigate("/");
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const signup = (e) => {
    // Call APIs to create new user
    e.preventDefault();
    console.log("Submitted: ", { username, password, email });
    navigate('/');
  }

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
  )
}

export default SignupForm;

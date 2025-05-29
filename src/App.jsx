import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import LoginForm from './pages/login';
import SignupForm from './pages/signup';

function App() {

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </Router>
  )
}

export default App;

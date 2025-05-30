import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import LoginForm from './pages/LoginForm';
import SignupForm from './pages/SignupForm';
import Header from './components/Header';

function App() {

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/" element={<Header isLoggedIn={true} />} />
      </Routes>
    </Router>
  )
}

export default App;

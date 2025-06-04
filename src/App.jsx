import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import LoginForm from './pages/LoginForm';
import SignupForm from './pages/SignupForm';
import ChartDisplay from './pages/ChartDisplay';
import SearchResult from './pages/SearchResult';
import Header from './components/Header';

function App() {

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/stocks/NVDA">View NVDA Chart</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/search" element={<SearchResult />} />
        <Route path="/stocks/:ticker" element={<ChartDisplay />} />
        <Route path="/" element={<Header isLoggedIn={true} />} />
      </Routes>
    </Router>
  )
}

export default App;

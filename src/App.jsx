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
import AuthProvider from './context/AuthContext';

function App() {

  return (
    <Router>
      <AuthProvider>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/stocks/NVDA">View NVDA Chart</Link>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/stocks/:ticker" element={<ChartDisplay />} />
          <Route path="/" element={<Header />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;

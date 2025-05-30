import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import LoginForm from './pages/LoginForm';
import SignupForm from './pages/SignupForm';
import ChartDisplay from './pages/ChartDisplay';

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
        <Route path="/stocks/:symbol" element={<ChartDisplay />} />
      </Routes>
    </Router>
  )
}

export default App;

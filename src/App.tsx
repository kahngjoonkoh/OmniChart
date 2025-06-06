import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import LoginForm from './pages/LoginForm.tsx';
import SignupForm from './pages/SignupForm.tsx';
import ChartDisplay from './pages/ChartDisplay.tsx';
import SearchResult from './pages/SearchResult.tsx';
import Header from './components/Header.tsx';
import AuthProvider from './context/AuthContext.tsx';

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/stocks/:ticker" element={<ChartDisplay />} />
          {/* <Route path="*" element={<NotFound />} /> // TODO*/}
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;

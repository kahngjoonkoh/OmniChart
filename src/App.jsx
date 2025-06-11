import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Home from './pages/Home';
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
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <main className="flex-grow w-full max-w-screen-xl pt-0 mx-auto mt-4 md:mt-6">

            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/stocks/:ticker" element={<ChartDisplay />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <footer className="py-6 bg-white dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            © {new Date().getFullYear()} OmniChart. All rights reserved.
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

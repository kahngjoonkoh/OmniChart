import { useNavigate, Link } from 'react-router-dom'; // Import Link
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';

const Header = ({ initialQuery = "" }) => {
  const navigate = useNavigate();
  const auth = useAuth();

  // Common button styles for consistency
  const buttonBaseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
  const primaryButtonStyles = `${buttonBaseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
  const secondaryButtonStyles = `${buttonBaseStyles} bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500`;

  return (
    // Main header container: uses flexbox to align items, adds padding, background, and a shadow
    <div className="bg-white dark:bg-gray-800 p-4 shadow-md flex items-center justify-between space-x-4">

      {/* It's better to wrap your site title in a Link component */}
      <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white flex-shrink-0">
        OmniChart
      </Link>

      {/* SearchBar wrapper: allows the search bar to grow */}
      <div className="flex-grow flex justify-center px-4">
        <SearchBar initialQuery={initialQuery} />
      </div>

      {/* Auth buttons container: uses flexbox to space out the buttons */}
      <div className="flex items-center space-x-2">
        {auth.isLoggedIn() ? (
          <button onClick={auth.logoutUser} className={secondaryButtonStyles}>
            Log out
          </button>
        ) : (
          <>
            <button onClick={() => navigate("/signup")} className={primaryButtonStyles}>
              Sign up
            </button>
            <button onClick={() => navigate("/login")} className={secondaryButtonStyles}>
              Log in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;

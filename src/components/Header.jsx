import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import { useAuth } from '../context/AuthContext'

const Header = ({ initialQuery = "" }) => {
  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <div>
      <h5>OmniChart</h5>
      <SearchBar initialQuery={initialQuery} />
      <div>
        {auth.isLoggedIn() ? (
          <button onClick={auth.logoutUser}>Log out</button>
        ) : (
          <>
            <button onClick={(e) => navigate("/signup")}>Sign up</button>
            <button onClick={(e) => navigate("/login")}>Log in</button>
          </>
        )}
      </div>
    </div>
  )
}

export default Header;

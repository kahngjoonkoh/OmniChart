import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

const Header = ({ isLoggedIn, initialQuery = "" }) => {
  const navigate = useNavigate();

  const logout = (e) => {
    console.log("Log out");
  }

  return (
    <div>
      <h5>OmniChart with Jamie</h5>
      <SearchBar initialQuery={initialQuery} />
      <div>
        {isLoggedIn ? (
          <button onClick={logout}>Log out</button>
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

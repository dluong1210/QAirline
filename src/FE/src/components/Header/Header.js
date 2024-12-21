import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { FaBell } from 'react-icons/fa';
import './Header.css';

const Notification = () => {
  const [ notifications, setNotifications ] = useState([]);
  const [ unreadCount, setUnreadCount ] = useState(0);
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
  const [ error, setError ] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const url = 'https://qairline.onrender.com/api/user/getNotification';

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setNotifications(data.reverse());
          const unread = data.filter((notification) => notification.unRead).length;
          setUnreadCount(unread);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      }
    };

    fetchNotifications();
  }, []);


  return (
    <div className="notification-container">
      <div className="notification-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <div
          className="chuong"
        >
          <FaBell className="icon-chuong" />
          {unreadCount > 0 && (
            <span
              className="notification-count"

            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {isDropdownOpen && (<div className="notification-dropdown">
        {error ? (
          <p className="error-message" style={{ color: 'red' }}>
            Error: {error}
          </p>
        ) : notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={index}
              className={`notification-item ${notification.unRead ? 'unread' : ''}`}
            >
              <p>{notification.content}</p>
              <span className="notification-time">
                {new Date(notification.create_at).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications</p>
        )}
      </div>
      )
      }
    </div>
  );
};

const UserDropdown = ({ avatar, setAvatar }) => {
  const { user, logout } = useAuth();
  const [ showDropdown, setShowDropdown ] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowDropdown(false);
    logout().then(success => {
      if (success) {
        navigate('/');
      }
    })
  };

  return (
    <div className="dropdown-container">
      {/* Avatar */}
      <img
        src={avatar || "img/default_avatar.png"}  // Cập nhật avatar khi có thay đổi
        alt="User Avatar"
        className="user-avatar"
        onClick={() => setShowDropdown(!showDropdown)}
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="dropdown-menu">
          {/* Header Info */}
          <div className="dropdown-header">
            <img src={avatar || "img/default_avatar.png"} alt="Avatar" className="dropdown-avatar" />
            <div className="dropdown-user-info">
              <span className="dropdown-name">{user.username || 'Hoàng Vũ Lê'}</span>
              <span className="dropdown-username">@{user.username.toLowerCase().replace(/\s+/g, '') || 'example'}</span>
            </div>
          </div>

          {/* Links */}
          <ul className="dropdown-links">
            <li>
              <Link to="/profile" onClick={() => setShowDropdown(false)}>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/write-blog" onClick={() => setShowDropdown(false)}>
                Write Blogs
              </Link>
            </li>
            <li>
              <Link to="/my-posts" onClick={() => setShowDropdown(false)}>
                My Blogs
              </Link>
            </li>
            <li>
              <Link to="/settings" onClick={() => setShowDropdown(false)}>
                Settings
              </Link>
            </li>
            <li onClick={handleLogout} className="logout">
              Sign out
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { user } = useAuth();
  const [ avatar, setAvatar ] = useState('img/default_avatar.png');  // Thêm state avatar

  const openSignin = () => {
    document.querySelector('.overlay').style.display = 'block';
    const signinForm = document.querySelector('.signin-form');
    signinForm.style.display = 'flex';
    setTimeout(() => signinForm.classList.add('showSign'), 10);
    document.body.classList.add('no-scroll');
  };

  const openSignup = () => {
    document.querySelector('.overlay').style.display = 'block';
    const signupForm = document.querySelector('.signup-form');
    signupForm.style.display = 'flex';
    setTimeout(() => signupForm.classList.add('showSign'), 10);
    document.body.classList.add('no-scroll');
  };

  return (
    <header className="fixed-header">
      <div className="content">
        <nav className="navbar">
          <label htmlFor="menu-checkbox" className="toggle-menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"
              />
            </svg>
          </label>
          {/* Logo */}
          <Link to="/">
            <img className="logo" src="img/LOGO.png" alt="Logo" />
          </Link>

          {/* Navigation Links */}
          <ul id="pc-nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/myflights">My Flights</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
            <li>
              <Link to="/destination">Destinations</Link>
            </li>
          </ul>

          {/* Actions */}
          <div className="actions">
            {user ? (
              <>
                <Notification />
                <UserDropdown avatar={avatar} setAvatar={setAvatar} />
              </>
            ) : (
              <>
                <button className="action-link" onClick={openSignup}>
                  Sign up
                </button>
                <button className="btn action-btn" onClick={openSignin}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

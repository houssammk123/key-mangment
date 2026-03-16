import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineKey,
  HiOutlineArchive,
  HiOutlineSwitchHorizontal,
  HiOutlineCollection,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { to: '/admin/generate', label: 'Generate Keys', icon: HiOutlineKey },
  { to: '/admin/stock', label: 'Manage Stock', icon: HiOutlineArchive },
  { to: '/admin/unbind', label: 'Unbind Requests', icon: HiOutlineSwitchHorizontal },
  { to: '/admin/keys', label: 'All Keys', icon: HiOutlineCollection },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white min-h-screen flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <img src="/logo.png" alt="Spotify Gold" className="h-20 w-auto" />
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 px-6 mt-1">Admin Panel</p>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <NavLink
            to="/admin/settings"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <HiOutlineCog className="w-5 h-5" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

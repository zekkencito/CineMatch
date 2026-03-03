import { useState } from 'react'
import { LogOut, Menu } from 'lucide-react'

export default function Header({ sidebarOpen, setSidebarOpen, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="top-bar">
      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
      </button>

      <div className="top-bar-actions">
        <div className="user-profile-container">
          <button
            className="user-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="avatar">👤</div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">Administrador</div>
            </div>
          </button>
          {showProfileMenu && (
            <div className="profile-menu">
              <button className="profile-menu-item logout-option" onClick={onLogout}>
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

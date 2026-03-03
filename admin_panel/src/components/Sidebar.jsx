import { Link } from 'react-router-dom'

export default function Sidebar({ sidebarOpen, menuItems }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CineMatch" className="sidebar-logo" />
        <span className="sidebar-brand-name">CineMatch</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
            onClick={(e) => {
              if (item.path === '#') e.preventDefault();
            }}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Film,
  Users,
  Heart,
  Flame,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Star,
  Gift,
  DollarSign,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../services/api';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [usersPeriod, setUsersPeriod] = useState('monthly'); // 'daily', 'weekly', 'monthly'

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Cargando datos del dashboard...');
      
      const [statsData, chartsDataResult] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardCharts()
      ]);
      
      console.log('📈 Stats recibidos:', statsData);
      console.log('📉 Charts recibidos:', chartsDataResult);
      
      setDashboardStats(statsData);
      setChartsData(chartsDataResult);
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError('Este información se actualizará cuando la base de datos se sincronice');
    } finally {
      setLoading(false);
    }
  };

  // Datos por defecto mientras cargan
  const revenueData = chartsData ? (() => {
    if (revenuePeriod === 'daily' && chartsData?.revenuePerDay?.length > 0) {
      return chartsData.revenuePerDay.map(m => ({ month: m.name, revenue: m.revenue, subscriptions: 100 }));
    } else if (revenuePeriod === 'weekly' && chartsData?.revenuePerWeek?.length > 0) {
      return chartsData.revenuePerWeek.map(m => ({ month: m.name, revenue: m.revenue, subscriptions: 100 }));
    } else if (chartsData?.revenuePerMonth?.length > 0) {
      return chartsData.revenuePerMonth.map(m => ({ month: m.name, revenue: m.revenue, subscriptions: 100 }));
    }
    return [];
  })() : [];

  const usersData = chartsData ? (() => {
    if (usersPeriod === 'daily' && chartsData?.usersPerDay?.length > 0) {
      return chartsData.usersPerDay.map((u, i) => ({ week: u.name, newUsers: u.users, activeUsers: u.users * 1.5 }));
    } else if (usersPeriod === 'weekly' && chartsData?.usersPerWeek?.length > 0) {
      return chartsData.usersPerWeek.map((u, i) => ({ week: u.name, newUsers: u.users, activeUsers: u.users * 1.5 }));
    } else if (chartsData?.usersPerMonth?.length > 0) {
      return chartsData.usersPerMonth.map((u, i) => ({ week: `Sem ${i + 1}`, newUsers: u.users, activeUsers: u.users * 1.5 }));
    }
    return [];
  })() : [];

  const statsCards = (dashboardStats?.stats && dashboardStats.stats.length > 0) 
    ? dashboardStats.stats.map((stat, idx) => ({
        ...stat,
        id: stat.id || idx + 1,
        icon: [Users, Star, Gift, DollarSign][idx] || Users,
        bgColor: stat.bgColor || '#ffd700',
      }))
    : [];

  const topMovies = (dashboardStats?.topMovies && dashboardStats.topMovies.length > 0) ? dashboardStats.topMovies.map((m, i) => ({
    id: `movie-${i}-${m.tmdb_movie_id || 'unknown'}`,
    title: m.title || 'N/A',
    genre: 'Popular',
    matches: m.matches || 0,
    trend: true
  })) : [];

  const topCustomers = (dashboardStats?.topUsers && dashboardStats.topUsers.length > 0) ? dashboardStats.topUsers.map((u, i) => ({
    id: `user-${i}-${u.name || 'unknown'}`,
    name: u.name || 'Usuario',
    matches: `${u.matches || 0} matches`,
    trend: true
  })) : [];

  const userInsights = (dashboardStats?.stats && dashboardStats.stats.length > 0) 
    ? dashboardStats.stats.slice(0, 3).map((stat, idx) => ({
        label: stat.title,
        value: stat.value,
        icon: [Users, Star, Gift][idx] || Users
      }))
    : [];

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: Film, active: true, path: '/' },
    { id: 3, label: 'Usuarios', icon: Heart, path: '/users' },
    { id: 4, label: 'Suscripciones', icon: CreditCard, path: '/subscriptions' },
  ];

  const handleLogout = () => {
    window.location.href = '/login'
  }

  return (
    <div className="dashboard-container">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="main-content">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout} 
        />

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Bienvenido de vuelta. Aquí está lo que sucede en CineMatch hoy.</p>
          </div>
        </div>

        {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Cargando datos...</div>}
        {error && <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>{error}</div>}

        {/* Stats Cards */}
        <div className="stats-cards">
          {statsCards.map((card) => (
            <div key={card.id} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon" style={{ backgroundColor: card.bgColor }}>
                  {card.icon && <card.icon size={24} color="#000" />}
                </div>
                <div className={`stat-badge ${card.isPositive ? 'positive' : 'negative'}`}>
                  {card.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span>{card.change}</span>
                </div>
              </div>
              <div className="stat-card-body">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Revenue Chart */}
            <div className="card">
              <div className="card-header">
                <h2>Ingresos y Suscripciones</h2>
                <div className="time-filters">
                  <button 
                    className={revenuePeriod === 'daily' ? 'active' : ''}
                    onClick={() => setRevenuePeriod('daily')}
                  >
                    Diario
                  </button>
                  <button 
                    className={revenuePeriod === 'weekly' ? 'active' : ''}
                    onClick={() => setRevenuePeriod('weekly')}
                  >
                    Semanal
                  </button>
                  <button 
                    className={revenuePeriod === 'monthly' ? 'active' : ''}
                    onClick={() => setRevenuePeriod('monthly')}
                  >
                    Mensual
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4caf50" 
                      strokeWidth={2}
                      name="Ingresos ($)"
                      dot={{ fill: '#4caf50', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="subscriptions" 
                      stroke="#2196f3" 
                      strokeWidth={2}
                      name="Suscripciones"
                      dot={{ fill: '#2196f3', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Users Chart */}
            <div className="card">
              <div className="card-header">
                <h2>Usuarios Nuevos vs Activos</h2>
                <div className="time-filters">
                  <button 
                    className={usersPeriod === 'daily' ? 'active' : ''}
                    onClick={() => setUsersPeriod('daily')}
                  >
                    Diario
                  </button>
                  <button 
                    className={usersPeriod === 'weekly' ? 'active' : ''}
                    onClick={() => setUsersPeriod('weekly')}
                  >
                    Semanal
                  </button>
                  <button 
                    className={usersPeriod === 'monthly' ? 'active' : ''}
                    onClick={() => setUsersPeriod('monthly')}
                  >
                    Mensual
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="newUsers" 
                      stroke="#ff9800" 
                      strokeWidth={2}
                      name="Usuarios Nuevos"
                      dot={{ fill: '#ff9800', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="#9c27b0" 
                      strokeWidth={2}
                      name="Usuarios Activos"
                      dot={{ fill: '#9c27b0', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* User Insights */}
            <div className="card">
              <div className="card-header">
                <h3>Usuarios Principales</h3>
                <a href="/users" className="view-all">Ver todos →</a>
              </div>
              <div className="customers-list">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="customer-item">
                    <div className="customer-rank">
                      <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                    </div>
                    <div className="customer-details">
                      <div className="customer-name">{customer.name}</div>
                      <div className="customer-spent">Más activo</div>
                    </div>
                    <div className="customer-spent-amount">
                      {customer.matches}
                    </div>
                    <div className="customer-stats">
                      <Heart size={14} color="#ffd700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Movies */}
            <div className="card">
              <div className="card-header">
                <h2>Películas Populares</h2>
              </div>
              <div className="movies-list">
                {topMovies.map((movie, index) => (
                  <div key={movie.id} className="movie-item">
                    <div className="movie-rank">
                      <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                    </div>
                    <div className="movie-details">
                      <div className="movie-title">{movie.title}</div>
                      <div className="movie-genre">{movie.genre}</div>
                    </div>
                    <div className="movie-stats">
                      <Heart size={14} color="#ffd700" />
                      <span>{movie.matches}</span>
                    </div>
                    <div className={`movie-trend ${movie.trend ? 'up' : 'down'}`}>
                      {movie.trend ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

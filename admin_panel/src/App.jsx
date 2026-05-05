import './App.css'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import SubscriptionPlans from './components/SubscriptionPlans'
import Users from './components/Users'
import Email from './components/Email'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscriptions" 
          element={
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/emails" 
          element={
            <ProtectedRoute>
              <Email />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

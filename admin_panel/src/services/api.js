// Configuración de la API - Usa variable de entorno o detecta automáticamente
const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.origin + '/api');

console.log('🚀 API conectando a:', API_BASE_URL);

// Clase para manejar todas las llamadas a la API
class ApiService {
  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  // Obtener headers con autenticación
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log(`📡 Llamada API: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error ${response.status}:`, errorText);
        
        if (response.status === 401) {
          // Token expirado o no autorizado
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Respuesta exitosa:`, data);
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      throw error;
    }
  }

  // ============ AUTENTICACIÓN ============
  async login(email, password) {
    const data = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('admin_token', data.token);
    }
    
    return data;
  }

  async logout() {
    await this.request('/admin/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  // ============ DASHBOARD ============
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getDashboardCharts() {
    return this.request('/admin/dashboard/charts');
  }

  // ============ USUARIOS ============
  async getUsers(page = 1, perPage = 100, search = '') {
    let endpoint = `/admin/users?page=${page}&per_page=${perPage}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    return this.request(endpoint);
  }

  async getUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async getUserStatistics() {
    return this.request('/admin/users/statistics/summary');
  }

  // ============ SUSCRIPCIONES ============
  async getSubscriptionPlans() {
    return this.request('/admin/subscription-plans');
  }

  async getSubscriptionPlan(id) {
    return this.request(`/admin/subscription-plans/${id}`);
  }

  async createSubscriptionPlan(planData) {
    return this.request('/admin/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateSubscriptionPlan(id, planData) {
    return this.request(`/admin/subscription-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deleteSubscriptionPlan(id) {
    return this.request(`/admin/subscription-plans/${id}`, { method: 'DELETE' });
  }

  async getSubscriptionStatistics() {
    return this.request('/admin/subscriptions/statistics');
  }

  async getUserSubscriptions(userId) {
    return this.request(`/admin/users/${userId}/subscriptions`);
  }

  // ============ PELÍCULAS ============
  async getMovies(page = 1, perPage = 20) {
    return this.request(`/admin/movies?page=${page}&per_page=${perPage}`);
  }

  async getMovie(id) {
    return this.request(`/admin/movies/${id}`);
  }

  async getTopMovies(limit = 10) {
    return this.request(`/admin/movies/top-rated?limit=${limit}`);
  }

  // ============ GÉNEROS ============
  async getGenres() {
    return this.request('/admin/genres');
  }

  // ============ MATCHES ============
  async getMatchesStatistics() {
    return this.request('/admin/matches/statistics');
  }

  // ============ MENSAJES ============
  async getMessagesStatistics() {
    return this.request('/admin/messages/statistics');
  }
}

// Crear instancia única del servicio
export const api = new ApiService();

export default api;

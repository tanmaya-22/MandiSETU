import api from './client'

// ─── Module 1: Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)     => api.post('/auth/register', data),
  login: (data)        => api.post('/auth/login', data),
  getMe: ()            => api.get('/auth/me'),
  listUsers: ()        => api.get('/auth/users'),
  verifyUser: (id)     => api.patch(`/auth/users/${id}/verify`),
}

// ─── Module 2: Prices ────────────────────────────────────────────────────────
export const pricesAPI = {
  getLive: (commodity, state, limit) =>
    api.get('/prices/live', { params: { commodity, state, limit } }),
  getHistory: (commodity, mandi_name, days) =>
    api.get('/prices/history', { params: { commodity, mandi_name, days } }),
  getTrend: (commodity, mandi_name, horizon_days) =>
    api.get('/prices/trend', { params: { commodity, mandi_name, horizon_days } }),
  getTopMarkets: (commodity, state) =>
    api.get('/prices/markets', { params: { commodity, state } }),
}

// ─── Module 3: Net-Realization ────────────────────────────────────────────────
export const calcAPI = {
  calculate: (data) => api.post('/calculator/net-realization', data),
  freightEstimate: (distance_km, quantity_kg) =>
    api.get('/calculator/freight-estimate', { params: { distance_km, quantity_kg } }),
}

// ─── Module 4: Listings ───────────────────────────────────────────────────────
export const listingsAPI = {
  create: (data)        => api.post('/listings/lots', data),
  getAll: (params)      => api.get('/listings/lots', { params }),
  getOne: (id)          => api.get(`/listings/lots/${id}`),
  activate: (id)        => api.patch(`/listings/lots/${id}/activate`),
  close: (id)           => api.delete(`/listings/lots/${id}`),
}

// ─── Module 5: Offers ────────────────────────────────────────────────────────
export const offersAPI = {
  create: (data)        => api.post('/offers', data),
  getForLot: (lot_id)   => api.get(`/offers/lot/${lot_id}`),
  accept: (offer_id)    => api.patch(`/offers/${offer_id}/accept`),
  reject: (offer_id)    => api.patch(`/offers/${offer_id}/reject`),
}

// ─── Module 6: Transactions ───────────────────────────────────────────────────
export const transactionsAPI = {
  getAll: ()            => api.get('/transactions'),
  getOne: (id)          => api.get(`/transactions/${id}`),
  updateStatus: (id, data) => api.patch(`/transactions/${id}/status`, data),
  updateLogistics: (id, provider, tracking) =>
    api.patch(`/transactions/${id}/logistics`, null, { params: { logistics_provider: provider, tracking_id: tracking } }),
}

// ─── Module 7: Sale Window ────────────────────────────────────────────────────
export const saleWindowAPI = {
  recommend: (data) => api.post('/sale-window/recommend', data),
}

// ─── Module 8: Buyers ────────────────────────────────────────────────────────
export const buyersAPI = {
  getScore: (buyer_id) => api.get(`/buyers/${buyer_id}/score`),
  listVerified: (commodity) => api.get('/buyers', { params: { commodity } }),
}

// ─── Module 8b: Logistics ─────────────────────────────────────────────────────
export const logisticsAPI = {
  estimate: (data) => api.post('/logistics/estimate', data),
}

// ─── Module 9: Disputes ───────────────────────────────────────────────────────
export const disputesAPI = {
  create: (data)    => api.post('/disputes', data),
  getAll: ()        => api.get('/disputes'),
  resolve: (id, resolution, admin_notes) =>
    api.patch(`/disputes/${id}/resolve`, null, { params: { resolution, admin_notes } }),
}

// ─── Module 10: Grading ───────────────────────────────────────────────────────
export const gradingAPI = {
  grade: (lot_id, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/grading/grade?lot_id=${lot_id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── Module 11: Weather ───────────────────────────────────────────────────────
export const weatherAPI = {
  getRisk: (lat, lng, commodity) =>
    api.get('/weather/risk', { params: { lat, lng, commodity } }),
}

// ─── Module 12: Analytics ─────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
}

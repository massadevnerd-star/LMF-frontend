import axios from "axios";

// ── Determinato al BUILD TIME, non a runtime
// mobile:build → NEXT_PUBLIC_BUILD_TARGET=mobile → usa URL assoluto del backend
// npm run dev  → non definito               → usa empty baseURL (proxy Next.js)
const IS_MOBILE_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.103:8000';

console.log('[MOBILE-DEBUG] API Config:', { IS_MOBILE_BUILD, BACKEND_URL });

const api = axios.create({
  baseURL: IS_MOBILE_BUILD ? BACKEND_URL : '',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: !IS_MOBILE_BUILD, // i cookie CORS non funzionano su native
});

api.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log(`[MOBILE-DEBUG] API Request: ${config.method?.toUpperCase()} ${fullUrl} (Base: ${config.baseURL})`);

  if (!IS_MOBILE_BUILD && typeof document !== 'undefined') {
    // 1. XSRF token for cookie-based auth (email/password login)
    const xsrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
  }

  // 2. Bearer token for token-based auth (Google OAuth login)
  if (typeof localStorage !== 'undefined') {
    const bearerToken = localStorage.getItem('auth_token');
    if (bearerToken) {
      config.headers['Authorization'] = `Bearer ${bearerToken}`;
      console.log('[MOBILE-DEBUG] Auth Token added to request');
    } else {
      console.log('[MOBILE-DEBUG] No Auth Token found in localStorage');
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[MOBILE-DEBUG] API Response Success: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    const errorData = {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      code: error.code
    };

    console.error(`[MOBILE-DEBUG] API Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]: ${JSON.stringify(errorData)}`);

    if (error.message === 'Network Error') {
      console.error('[MOBILE-DEBUG] CONNECTION FAILED! Check if Laravel is running with --host=0.0.0.0 and if IP 192.168.8.103 is correct.');
    }

    return Promise.reject(error);
  },
);

export const getCsrfToken = () => api.get("/sanctum/csrf-cookie");

// File Upload Helper
export const uploadFile = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    if (!IS_MOBILE_BUILD) await getCsrfToken();
    const response = await api.post('/api/auth/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (e) {
    console.error("Upload failed", e);
    return null;
  }
}

// Save New Story (Draft or Published)
export const saveStory = async (data: any) => {
  await getCsrfToken();
  return api.post('/api/auth/create-story', data);
};

// Update Existing Story (Draft or Publish)
export const updateStory = async (id: number | string, data: any) => {
  await getCsrfToken();
  return api.put(`/api/auth/stories/${id}`, data);
};

export const deleteStory = async (id: number | string) => {
  await getCsrfToken();
  return api.delete(`/api/auth/stories/${id}`);
};

// PIN Management Services
export const pinService = {
  changePin: async (oldPin: string, newPin: string) => {
    if (!IS_MOBILE_BUILD) await getCsrfToken();
    return api.post('/api/auth/pin/change', {
      old_pin: oldPin,
      new_pin: newPin,
      new_pin_confirmation: newPin
    });
  },

  verifyPin: async (pin: string) => {
    if (!IS_MOBILE_BUILD) await getCsrfToken();
    return api.post('/api/auth/pin/verify-current', { pin });
  },

  requestReset: async (email: string) => {
    if (!IS_MOBILE_BUILD) await getCsrfToken();
    return api.post('/api/auth/pin/reset/request', { email });
  },

  verifyResetAndSetPin: async (email: string, code: string, newPin: string) => {
    if (!IS_MOBILE_BUILD) await getCsrfToken();
    return api.post('/api/auth/pin/reset/verify', {
      email,
      reset_code: code,
      new_pin: newPin,
      new_pin_confirmation: newPin
    });
  }
};

// AI Services (Migrated to Backend)
export const generateAiStory = async (data: any) => {
  if (!IS_MOBILE_BUILD) await getCsrfToken();
  return api.post('/api/ai/story', data);
};

export const generateAiImage = async (prompt: string) => {
  if (!IS_MOBILE_BUILD) await getCsrfToken();
  return api.post('/api/ai/image', { prompt });
};

export default api;

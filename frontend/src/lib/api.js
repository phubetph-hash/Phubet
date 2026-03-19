/**
 * API Client for Student Advisor System
 * Handles all API communication with error handling and response formatting
 */

const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost/project-advisor-system4/backend';
  }

  return `${window.location.protocol}//${window.location.hostname}/project-advisor-system4/backend`;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || getDefaultApiBaseUrl();

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfToken = null;
    this.csrfPromise = null;
  }

  isStateChangingMethod(method = 'GET') {
    const normalized = String(method || 'GET').toUpperCase();
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalized);
  }

  async getCsrfToken(forceRefresh = false) {
    if (!forceRefresh && this.csrfToken) {
      return this.csrfToken;
    }

    if (!forceRefresh && this.csrfPromise) {
      return this.csrfPromise;
    }

    this.csrfPromise = (async () => {
      const response = await fetch(`${this.baseURL}/api/auth/csrf-token.php`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const payload = await response.json();
      const token = payload?.data?.token || null;

      if (!token) {
        throw new ApiError('Unable to initialize CSRF token', response.status || 0, payload);
      }

      this.csrfToken = token;
      return this.csrfToken;
    })();

    try {
      return await this.csrfPromise;
    } finally {
      this.csrfPromise = null;
    }
  }

  /**
   * Get full URL for an endpoint
   */
  getFullUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include', // Include cookies for session management
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (this.isStateChangingMethod(config.method)) {
      const csrfToken = await this.getCsrfToken();
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Remove Content-Type header if body is FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);

      const rawText = await response.text();
      const data = this.parseResponseBody(rawText);

      if (!response.ok) {
        const errorCode = data?.error_code || null;
        const canRetryCsrf =
          this.isStateChangingMethod(config.method) &&
          !options._csrfRetried &&
          response.status === 403 &&
          (errorCode === 'CSRF_TOKEN_INVALID' || errorCode === 'CSRF_TOKEN_MISSING');

        if (canRetryCsrf) {
          this.csrfToken = null;
          await this.getCsrfToken(true);
          return this.request(endpoint, {
            ...options,
            _csrfRetried: true,
          });
        }

        throw new ApiError(
          data?.message || data || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error.message || 'Network error occurred',
        0,
        null
      );
    }
  }

  parseResponseBody(rawText = '') {
    if (!rawText) {
      return null;
    }

    const normalizedText = String(rawText).replace(/^\uFEFF/, '').trim();

    if (!normalizedText) {
      return null;
    }

    try {
      return JSON.parse(normalizedText);
    } catch (_) {
      const jsonStart = normalizedText.search(/[\[{]/);
      const objectEnd = normalizedText.lastIndexOf('}');
      const arrayEnd = normalizedText.lastIndexOf(']');
      const jsonEnd = Math.max(objectEnd, arrayEnd);

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const candidate = normalizedText.slice(jsonStart, jsonEnd + 1);

        try {
          return JSON.parse(candidate);
        } catch {
          return normalizedText;
        }
      }

      return normalizedText;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    console.log('API POST Request:', {
      endpoint,
      data: { ...data, password: data.password ? '********' : undefined }
    });
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, data = null) {
    const config = {
      method: 'DELETE',
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, config);
  }

  /**
   * File upload request
   */
  async uploadFile(endpoint, file, additionalData = {}, fieldName = 'file') {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        // Remove Content-Type to allow browser to set multipart boundary
      },
      body: formData,
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export both the class and instance
export { ApiClient, ApiError };
export default apiClient;

/**
 * Fetch API with Bearer Token
 * ใช้สำหรับเรียก API ที่ต้องการ token
 */
export async function fetchWithToken(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('fetchWithToken error:', error);
    return { success: false, message: error.message };
  }
}

class RetryableError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "RetryableError";
    this.statusCode = statusCode;
    this.retryable = true;
  }
}

class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "";
    this.defaultHeaders = options.headers || {};
    this.timeout = options.timeout || 30000;

    this.retryConfig = {
      maxAttempts: options.maxAttempts ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 10000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      retryableStatuses: options.retryableStatuses || [
        408, 429, 500, 502, 503, 504,
      ],
    };

    this.logger = options.logger || console;
    this._requestInterceptors = [];
    this._responseInterceptors = [];
  }

  addRequestInterceptor(fn) {
    this._requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn) {
    this._responseInterceptors.push(fn);
  }

  async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async _calculateDelay(attempt) {
    const delay =
      this.retryConfig.initialDelay *
      Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  async _makeRequest(url, options, attempt = 1) {
    let requestOptions = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    for (const interceptor of this._requestInterceptors) {
      requestOptions = await interceptor(requestOptions);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      for (const interceptor of this._responseInterceptors) {
        await interceptor(response, data);
      }

      if (
        !response.ok &&
        this.retryConfig.retryableStatuses.includes(response.status)
      ) {
        throw new RetryableError(
          `Request failed with status ${response.status}`,
          response.status,
        );
      }

      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }

      if (
        error instanceof RetryableError &&
        attempt < this.retryConfig.maxAttempts
      ) {
        const delay = await this._calculateDelay(attempt);
        this.logger.debug(
          `Retryable error: ${error.message}. Retrying in ${delay}ms (attempt ${attempt}/${this.retryConfig.maxAttempts})`,
        );
        await this._sleep(delay);
        return this._makeRequest(url, options, attempt + 1);
      }

      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;
    return this._makeRequest(url, options);
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(body),
    });
  }
}

function createApiClient(options) {
  return new ApiClient(options);
}

export { ApiClient, RetryableError, createApiClient };
export default { ApiClient, RetryableError, createApiClient };

import { readFile } from "fs/promises";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

class ConfigLoader {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.configName = options.configName || "agent.config.json";
    this.encoding = options.encoding || "utf-8";
    this._cache = new Map();
  }

  async load(configPath = null) {
    const path = configPath || join(this.baseDir, this.configName);

    if (this._cache.has(path)) {
      return this._cache.get(path);
    }

    try {
      const content = await readFile(path, this.encoding);
      const config = JSON.parse(content);
      this._cache.set(path, config);
      return config;
    } catch (error) {
      if (error.code === "ENOENT") {
        return this._getDefaultConfig();
      }
      throw new Error(`Failed to load config from ${path}: ${error.message}`);
    }
  }

  async loadWithDefaults(defaults, configPath = null) {
    const loaded = await this.load(configPath);
    return this._mergeDeep(defaults, loaded);
  }

  _getDefaultConfig() {
    return {
      agent: {
        name: "UnnamedAgent",
        version: "1.0.0",
      },
      logging: {
        level: "info",
        format: "json",
      },
      retry: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      },
      discovery: {
        enabled: true,
        interval: 30000,
      },
    };
  }

  _mergeDeep(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = this._mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  clearCache() {
    this._cache.clear();
  }
}

function createConfigLoader(options) {
  return new ConfigLoader(options);
}

export { ConfigLoader, createConfigLoader };
export default { ConfigLoader, createConfigLoader };

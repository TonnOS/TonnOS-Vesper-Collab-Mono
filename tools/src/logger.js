const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

const LEVEL_NAMES = {
  [LOG_LEVELS.ERROR]: "ERROR",
  [LOG_LEVELS.WARN]: "WARN",
  [LOG_LEVELS.INFO]: "INFO",
  [LOG_LEVELS.DEBUG]: "DEBUG",
  [LOG_LEVELS.TRACE]: "TRACE",
};

class Logger {
  constructor(options = {}) {
    this.agentName = options.agentName || "Agent";
    this.level = options.level || LOG_LEVELS.INFO;
    this.output = options.output || process.stdout;
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeAgent = options.includeAgent ?? true;
    this.format = options.format || "json";
  }

  _shouldLog(level) {
    return level <= this.level;
  }

  _formatMessage(level, message, data) {
    const timestamp = this.includeTimestamp ? new Date().toISOString() : null;
    const agent = this.includeAgent ? this.agentName : null;

    if (this.format === "json") {
      const logEntry = {
        timestamp,
        level: LEVEL_NAMES[level],
        agent,
        message,
        ...(data && { data }),
      };
      return JSON.stringify(logEntry);
    }

    const parts = [];
    if (timestamp) parts.push(`[${timestamp}]`);
    parts.push(`[${LEVEL_NAMES[level]}]`);
    if (agent) parts.push(`[${agent}]`);
    parts.push(message);
    if (data) parts.push(JSON.stringify(data));
    return parts.join(" ");
  }

  _log(level, message, data) {
    if (!this._shouldLog(level)) return;
    this.output.write(this._formatMessage(level, message, data) + "\n");
  }

  error(message, data) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  trace(message, data) {
    this._log(LOG_LEVELS.TRACE, message, data);
  }

  child(options) {
    return new Logger({
      ...{
        agentName: this.agentName,
        level: this.level,
        output: this.output,
        includeTimestamp: this.includeTimestamp,
        includeAgent: this.includeAgent,
        format: this.format,
      },
      ...options,
    });
  }

  setLevel(level) {
    if (typeof level === "string") {
      this.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
    } else {
      this.level = level;
    }
  }
}

function createLogger(options) {
  return new Logger(options);
}

export { Logger, createLogger, LOG_LEVELS };
export default { Logger, createLogger, LOG_LEVELS };

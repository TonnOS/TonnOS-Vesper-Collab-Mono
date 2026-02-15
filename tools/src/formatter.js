const MESSAGE_TYPES = {
  DISCOVERY: "discovery",
  HANDSHAKE: "handshake",
  TASK_REQUEST: "task_request",
  TASK_RESPONSE: "task_response",
  HEARTBEAT: "heartbeat",
  ERROR: "error",
  CUSTOM: "custom",
};

const MESSAGE_PRIORITIES = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
};

class MessageFormatter {
  constructor(options = {}) {
    this.agentName = options.agentName || "Unknown";
    this.includeMetadata = options.includeMetadata ?? true;
    this.template = options.template || null;
  }

  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _createMessage(type, payload, options = {}) {
    const message = {
      id: options.id || this._generateId(),
      type,
      sender: options.sender || this.agentName,
      timestamp: new Date().toISOString(),
      payload,
    };

    if (options.replyTo) {
      message.replyTo = options.replyTo;
    }

    if (options.priority) {
      message.priority = options.priority;
    }

    if (options.correlationId) {
      message.correlationId = options.correlationId;
    }

    return message;
  }

  formatDiscovery(capabilities = [], options = {}) {
    return this._createMessage(
      MESSAGE_TYPES.DISCOVERY,
      {
        version: "1.0.0",
        capabilities,
        status: "online",
      },
      options,
    );
  }

  formatHandshake(agentInfo, options = {}) {
    return this._createMessage(
      MESSAGE_TYPES.HANDSHAKE,
      {
        agent: agentInfo.name,
        version: agentInfo.version,
        capabilities: agentInfo.capabilities || [],
        protocol: "v1",
      },
      options,
    );
  }

  formatTaskRequest(task, options = {}) {
    return this._createMessage(
      MESSAGE_TYPES.TASK_REQUEST,
      {
        task: {
          id: task.id || this._generateId(),
          type: task.type,
          description: task.description,
          input: task.input || {},
          constraints: task.constraints || {},
        },
      },
      options,
    );
  }

  formatTaskResponse(taskId, result, options = {}) {
    return this._createMessage(
      MESSAGE_TYPES.TASK_RESPONSE,
      {
        taskId,
        result,
        status: options.status || "completed",
      },
      options,
    );
  }

  formatError(error, context = {}, options = {}) {
    return this._createMessage(
      MESSAGE_TYPES.ERROR,
      {
        error: {
          name: error.name || "Error",
          message: error.message,
          stack: error.stack,
        },
        context,
      },
      options,
    );
  }

  formatHeartbeat(status = {}, options = {}) {
    return this._createMessage(
      MESSAGE_TYPES.HEARTBEAT,
      {
        status,
        uptime: process.uptime?.() || 0,
      },
      options,
    );
  }

  formatCustom(type, payload, options = {}) {
    return this._createMessage(type, payload, options);
  }

  formatForHuman(message, options = {}) {
    const indent = options.indent || "  ";
    let output = "";

    output += `[${message.type.toUpperCase()}] `;
    output += `From: ${message.sender} `;
    output += `At: ${message.timestamp}\n`;

    if (message.payload) {
      output += `${indent}Payload:\n`;
      output += this._formatObject(message.payload, indent + indent);
    }

    if (message.priority) {
      output += `${indent}Priority: ${message.priority}\n`;
    }

    return output;
  }

  _formatObject(obj, indent, depth = 0) {
    if (depth > 3) return JSON.stringify(obj);

    const lines = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        lines.push(`${indent}${key}:`);
        lines.push(this._formatObject(value, indent, depth + 1));
      } else {
        lines.push(`${indent}${key}: ${JSON.stringify(value)}`);
      }
    }
    return lines.join("\n");
  }

  parse(rawMessage) {
    try {
      const parsed =
        typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;

      return {
        valid: true,
        message: parsed,
        error: null,
      };
    } catch (error) {
      return {
        valid: false,
        message: null,
        error: error.message,
      };
    }
  }
}

function createFormatter(options) {
  return new MessageFormatter(options);
}

export { MessageFormatter, createFormatter, MESSAGE_TYPES, MESSAGE_PRIORITIES };
export default {
  MessageFormatter,
  createFormatter,
  MESSAGE_TYPES,
  MESSAGE_PRIORITIES,
};

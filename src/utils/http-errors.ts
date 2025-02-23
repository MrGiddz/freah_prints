interface HTTPErrorInterface {
  statusCode: number;
  code?: string;
  message: string;
  cause?: unknown;
  name?: string;
}

export class HTTPError extends Error {
  public statusCode: number;
  public code?: string;
  public cause?: unknown;

  constructor({ statusCode, message, cause, name, code }: HTTPErrorInterface) {
    super(message);
    this.statusCode = statusCode;
    this.cause = cause;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTTPError);
    }

    this.name = name ?? this.constructor.name;
  }

  toJson() {
    return {
      code: this.code,
      cause: this.cause,
      statusCode: this.statusCode,
      name: this.name,
      message: this.message,
    };
  }
}

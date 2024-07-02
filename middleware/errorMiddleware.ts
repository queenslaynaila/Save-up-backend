type ErrorData = {
  [key: string]: unknown;
};

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly errorData: ErrorData;

  constructor(statusCode: number, errorType: string, errorData: ErrorData = {}) {
    super();
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errorData = errorData;
  }
}

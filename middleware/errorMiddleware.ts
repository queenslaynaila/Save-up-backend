export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly errorData: Record<string, unknown>;

  constructor(statusCode: number, errorType: string, errorData: Record<string, unknown> = {}) {
    super();
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errorData = errorData;
  }
}
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errorData: Record<string, unknown>;

  constructor(statusCode: number, errorData: Record<string, unknown> = {}) {
    super();
    this.statusCode = statusCode;
    this.errorData = errorData;
  }
}
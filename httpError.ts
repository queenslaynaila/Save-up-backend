export default class HttpError extends Error {
  public readonly status: number;

  public readonly errors: Record<string, unknown> | Record<string, unknown>[];

  constructor(status: number, errors: Record<string, unknown> | Record<string, unknown>[] = {}) {
    super();
    this.status = status;
    this.errors = errors;
  }
}
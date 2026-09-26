export type ProblemDetails = {
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    public readonly title: string,
    public readonly detail?: string,
    public readonly fieldErrors?: Record<string, string[]>,
    public readonly traceId?: string,
  ) {
    super(detail ?? title);
    this.name = "ApiError";
  }
}

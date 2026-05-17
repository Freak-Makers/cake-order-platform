export interface SuccessResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details?: {
    field?: string;
    reason: string;
  }[];
  timestamp: string;
}
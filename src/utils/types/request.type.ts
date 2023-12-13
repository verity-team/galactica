export class PaginationRequestDTO {
  offset: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

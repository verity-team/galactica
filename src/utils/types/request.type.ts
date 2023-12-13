import { IsPositive } from "class-validator";

export class PaginationRequestDTO {
  @IsPositive()
  offset: number;

  @IsPositive()
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

export class paginatedResponseDto<T> {
  data: T[];
  totalCount: number;
  recordNumStart: number;
  recordNumEnd: number;
}

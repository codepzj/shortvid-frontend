export type ApiResponse<T> = {
  success: boolean;
  code: number;
  msg: string;
  data: T;
};

import request from "@/utils/request";
import type { ApiResponse } from "./types";

export type GetUploadSessionRequest = {
  vgroup: string;
};

export type GetUploadSessionResponse = {
  access_key: string;
  secret_key: string;
  token: string;
  bucket: string;
  path: string;
};

export const getUploadSessionAPI = async (
  dto: GetUploadSessionRequest,
): Promise<ApiResponse<GetUploadSessionResponse>> => {
  return request.post<ApiResponse<GetUploadSessionResponse>, ApiResponse<GetUploadSessionResponse>>(
    "/api/v1/upload/session",
    dto,
  );
};

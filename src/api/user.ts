import request from "@/utils/request";
import type { ApiResponse } from "./types";

// Firebase登录请求接口
export interface LoginFirebaseRequest {
  id_token: string;
}

// Firebase登录响应接口
export interface LoginFirebaseResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

// github登录请求接口
export interface GithubLoginRequest {
  code: string;
}

// github登录响应接口
export interface LoginGithubResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

// gitee登录请求接口
export interface GiteeLoginRequest {
  code: string;
}

// gitee登录响应接口
export interface LoginGiteeResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

// 用户资料接口
export interface UserProfile {
  id: number;
  uid: number;
  nickname: string;
  avatar: string;
  email: string;
  provider: string;
  provider_uid: string;
}

// 获取用户信息请求接口
export interface GetUserProfileRequest {
  uid: number;
}

// 获取用户信息响应接口
export interface GetUserProfileResponse {
  user: UserProfile;
}

// firebase登录接口
export const firebaseLoginAPI = async (dto: LoginFirebaseRequest): Promise<ApiResponse<LoginFirebaseResponse>> => {
  return request.post<ApiResponse<LoginFirebaseResponse>, ApiResponse<LoginFirebaseResponse>>("/api/v1/user/firebase/login", dto);
};

// github登录接口
export const githubLoginAPI = async (dto: GithubLoginRequest): Promise<ApiResponse<LoginGithubResponse>> => {
  return request.post<ApiResponse<LoginGithubResponse>, ApiResponse<LoginGithubResponse>>("/api/v1/user/github/login", dto);
};

// gitee登录接口
export const giteeLoginAPI = async (dto: GiteeLoginRequest): Promise<ApiResponse<LoginGiteeResponse>> => {
  return request.post<ApiResponse<LoginGiteeResponse>, ApiResponse<LoginGiteeResponse>>("/api/v1/user/gitee/login", dto);
};

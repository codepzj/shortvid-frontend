import request from "@/utils/request";

// Firebase登录请求接口
export interface LoginFirebaseRequest {
  idToken: string;
}

// Firebase登录响应接口
export type LoginFirebaseResponse = Record<string, never>;

// 获取用户信息请求接口
export interface GetUserRequest {
  id: number;
}

// 获取用户信息响应接口
export interface GetUserResponse {
  nickname: string;
  avatar?: string;
  email?: string;
  provider: string;
  providerUid: string;
}

export const loginWithFirebase = (idToken: string): Promise<LoginFirebaseResponse> => {
  return request.post('/login/firebase', {idToken});
};
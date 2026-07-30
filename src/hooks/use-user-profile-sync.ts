import { useEffect } from "react";

import { getUserProfileAPI, type GetUserProfileResponse } from "@/api";
import { useUserStore } from "@/store/user";

type UserProfileResponse = GetUserProfileResponse["user"];

const profileRequests = new Map<string, Promise<UserProfileResponse>>();

function requestUserProfile(accessToken: string) {
  const existingRequest = profileRequests.get(accessToken);
  if (existingRequest) return existingRequest;

  const request = getUserProfileAPI(accessToken)
    .then(({ data }) => data.user)
    .finally(() => {
      profileRequests.delete(accessToken);
    });

  profileRequests.set(accessToken, request);
  return request;
}

export function useUserProfileSync(hydrated: boolean) {
  const uid = useUserStore((state) => state.user?.uid ?? null);
  const accessToken = useUserStore((state) => state.access_token);

  useEffect(() => {
    if (!hydrated || uid === null || !accessToken) return;

    let active = true;
    void requestUserProfile(accessToken)
      .then((profile) => {
        if (!active) return;
        useUserStore.getState().updateProfile(profile);
      })
      .catch(() => {
        // 请求失败时保留上一次缓存的用户资料。
      });

    return () => {
      active = false;
    };
  }, [accessToken, hydrated, uid]);
}

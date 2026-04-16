export type AuthMode = "guest" | "user";

export type UserProfile = {
  id: string;
  email?: string;
  name: string;
  avatarIndex?: number;
};

export type AuthTokenPayload = {
  accessToken: string;
  refreshToken?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type GuestAuthRequest = {
  nickname?: string;
};

export type UpdateMeRequest = {
  name?: string;
  avatarIndex?: number;
};

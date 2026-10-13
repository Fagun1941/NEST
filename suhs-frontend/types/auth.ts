export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  className: string;
  rollNumber: string;
  division: string;
  studentGroup: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser & {
    createdAt: string;
  };
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
}

export interface HomeResponse {
  message: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

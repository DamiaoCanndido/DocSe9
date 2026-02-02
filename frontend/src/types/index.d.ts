declare interface TownResProps {
  id: string;
  imageUrl: string;
  name: string;
  uf: string;
}

declare interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

declare interface LoginRequest {
  email: string;
  password: string;
}

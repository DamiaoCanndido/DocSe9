declare interface TownResProps {
  id: string;
  imageUrl: string;
  name: string;
  uf: string;
}

declare interface RoleResProps {
  roleId: number;
  name: string;
}

declare interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

declare interface LoginRequest {
  email: string;
  password: string;
}

declare interface UserResProps {
  userId: string;
  username: string;
  email: string;
  role: RoleResProps;
  town: TownResProps;
  createdAt: string;
}

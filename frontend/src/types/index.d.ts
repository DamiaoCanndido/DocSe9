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

declare interface LoginReqProps {
  email: string;
  password: string;
}

declare interface ChangePasswordReqProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

declare interface UserReqProps {
  username: string;
  email: string;
  role: 'basic' | 'manager' | 'admin';
  townId: string | null;
  password?: string;
  confirmPassword?: string;
}

declare interface UserResProps {
  userId: string;
  username: string;
  email: string;
  role: RoleResProps;
  town: TownResProps | null;
  createdAt: string;
}

declare interface NodeResProps {
  id: string;
  name: string;
  nodeType: 'file' | 'folder';
  favorite: boolean;
  parentId: string | null;
  townId: string;
  createdBy: string;
  createdByName: string;
  updatedBy: string | null;
  updatedByName: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  restoredBy: string | null;
  restoredByName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contentType: string | null;
  size: number | null;
  objectKey: string | null;
  lastSeen: string | null;
}

declare interface TownReqProps {
  name: string;
  uf: string;
  imageUrl: string;
}

declare interface TownResProps {
  townId: string;
  name: string;
  uf: string;
  imageUrl: string;
  totalUsers: number;
}

declare interface FolderReqProps {
  name: string;
  parentId: string | null;
}

declare interface PaginatedResponse<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

declare interface SearchResults {
  folders: NodeResProps[];
  files: NodeResProps[];
}

declare interface ApiResponse<T> {
  data: PaginatedResponse<T>;
}

declare interface SearchParamProps {
  params?: Promise<SegmentParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface DocsQueries {
  id?: string;
  name?: string;
  page?: string;
  size?: string;
  sort?: string;
}

declare interface UsersQueries {
  name?: string;
  role?: string;
  town?: string;
  page?: string;
  size?: string;
  sort?: string;
}

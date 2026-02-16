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
  town: TownResProps | null;
  createdAt: string;
}

declare interface FolderResProps {
  folderId: string;
  name: string;
  parentId: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FileResProps {
  fileId: string;
  name: string;
  size: number;
  contentType: string;
  objectKey: string;
  favorite: boolean;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  folderId: string;
  uploadedBy: string | null;
}

interface PaginatedResponse<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface SearchResults {
  folders: FolderResProps[];
  files: FileResProps[];
}

interface ApiResponse {
  folders: PaginatedResponse<FolderResProps>;
  files: PaginatedResponse<FileResProps>;
}

declare interface SearchParamProps {
  params?: Promise<SegmentParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface DocsGetInput {
  name?: string;
  page?: string;
  size?: string;
  sort?: string;
}

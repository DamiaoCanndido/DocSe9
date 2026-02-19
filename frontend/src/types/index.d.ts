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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contentType: string | null;
  size: number | null;
  objectKey: string | null;
  lastSeen: string | null;
}

declare interface PaginatedResponse<T> {
  nodes: T[];
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

declare interface ApiResponse {
  content: PaginatedResponse<NodeResProps>;
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

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  permissions?: string[];
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  permissions?: string[];
  description?: string;
}

# Agent Context - CRM Leads Management

## Project Overview
Full-stack CRM application with JWT auth, MongoDB, React + TypeScript. Features role-based access control (RBAC) with granular permissions, handles large-scale lead data with server-side pagination, sorting, filtering, and global search.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TanStack Table, React Query, TailwindCSS, React Hook Form, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Key File Structure

### Frontend (`client/src/`)
```
api/
  axios.ts          # Axios instance with auth interceptor
  leadApi.ts        # fetchLeads, createLead, updateLead, deleteLead
  userApi.ts        # fetchUsers, createUser, updateUser, deleteUser
  roleApi.ts        # fetchRoles, createRole, updateRole, deleteRole
components/
  DataTable.tsx     # TanStack Table wrapper with sorting
  Dialog.tsx        # Reusable modal component
  LeadModal.tsx     # Modal for add/edit leads
  Navbar.tsx        # Navigation with permission-based menu items
  Pagination.tsx    # Pagination component with debounce
  Select.tsx        # Custom select dropdown
  TextInput.tsx     # Custom text input with form integration
constants/
  permissions.ts    # Centralized permission constants (CRUD for leads, users, roles)
pages/
  LeadsPage.tsx     # Main dashboard with CRUD, filters, pagination
  LoginPage.tsx     # Login form
  RegisterPage.tsx  # Registration form
  RolesPage.tsx     # Role management with permission assignment
  UsersPage.tsx     # User management with role assignment
table/
  columns.tsx       # Column definitions with permission-based actions
types/
  lead.ts           # Lead interface
  user.ts           # User and Role interfaces
  role.ts           # Role interface
utils/
  auth.ts           # Permission helper functions (hasPermission, expandPermissions)
```

### Backend (`server/src/`)
```
config/
  db.js             # MongoDB connection
  permissions.js    # Centralized permission constants with expansion logic
controllers/
  authController.js # register, login (includes permissions in JWT)
  leadController.js # getLeads, createLead, updateLead, deleteLead
  roleController.js # getRoles, createRole, updateRole, deleteRole
  userController.js # getUsers, createUser, updateUser, deleteUser
middleware/
  authMiddleware.js # JWT verification (protect) + permission authorization with expansion
models/
  Lead.js           # Lead schema with indexes
  User.js           # User schema with role reference
  Role.js           # Role schema with permissions array
routes/
  authRoutes.js     # POST /register, /login
  leadRoutes.js     # GET, POST, PUT, DELETE /leads (with granular permissions)
  roleRoutes.js     # GET, POST, PUT, DELETE /roles (with granular permissions)
  userRoutes.js     # GET, POST, PUT, DELETE /users (with granular permissions)
seed/
  seedLeads.js      # Script to seed 10,000 leads
app.js              # Express app setup
```

## Permission System

### Centralized Permission Constants
All permissions are defined in `server/src/config/permissions.js` (server) and `client/src/constants/permissions.ts` (client). Never use hardcoded permission strings.

**Granular Permissions:**
- **Leads**: CREATE_LEAD, READ_LEAD, UPDATE_LEAD, DELETE_LEAD
- **Users**: CREATE_USER, READ_USER, UPDATE_USER, DELETE_USER
- **Roles**: CREATE_ROLE, READ_ROLE, UPDATE_ROLE, DELETE_ROLE

**Super Permissions (backward compatibility):**
- MANAGE_USERS - Grants all user permissions (auto-expands to CREATE_USER, READ_USER, UPDATE_USER, DELETE_USER)
- MANAGE_ROLES - Grants all role permissions (auto-expands to CREATE_ROLE, READ_ROLE, UPDATE_ROLE, DELETE_ROLE)

### Permission Expansion Logic
The `expandPermissions()` function automatically expands super permissions to their granular equivalents:
- If a role has `MANAGE_USERS`, it automatically gets access to all user operations
- This ensures backward compatibility with existing roles
- Implemented in both server middleware and client auth utilities

### Permission Checking
**Server-side** (`middleware/authMiddleware.js`):
```javascript
const authorize = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = expandPermissions(req.user.permissions || []);
    const hasPermission = permissions.every(perm => userPermissions.includes(perm));
    if (!hasPermission) return res.status(403).json({ message: "Not authorized" });
    next();
  };
};
```

**Client-side** (`utils/auth.ts`):
```typescript
export const hasPermission = (permission: string, user: any): boolean => {
  const permissions = user.role?.permissions || [];
  const expandedPermissions = expandPermissions(permissions);
  return expandedPermissions.includes(permission);
};
```

### Adding New Permissions
1. Add permission constant to both `server/src/config/permissions.js` and `client/src/constants/permissions.ts`
2. Add to appropriate PERMISSION_GROUP if applicable
3. Use in route authorization: `authorize(PERMISSIONS.NEW_PERMISSION)`
4. Use in client checks: `hasPermission(PERMISSIONS.NEW_PERMISSION, user)`

## API Endpoints

### Auth (No auth required)
- `POST /api/auth/register` - { name, email, password } → assigns default "user" role
- `POST /api/auth/login` - { email, password } → returns JWT with permissions array

### Leads (JWT required)
- `GET /api/leads` - Query params: page, limit, sortBy, sortOrder, status, owner, search (requires READ_LEAD)
- `POST /api/leads` - { name, email, company, status?, owner } (requires CREATE_LEAD)
- `PUT /api/leads/:id` - { name?, email?, company?, status?, owner? } (requires UPDATE_LEAD)
- `DELETE /api/leads/:id` (requires DELETE_LEAD)

### Users (JWT required)
- `GET /api/users` - Query params: page, limit, search, sortBy, sortOrder (requires READ_USER)
- `POST /api/users` - { name, email, password, role } (requires CREATE_USER)
- `PUT /api/users/:id` - { name?, email?, password?, role? } (requires UPDATE_USER)
- `DELETE /api/users/:id` (requires DELETE_USER)
- `GET /api/users/:id` (requires READ_USER)

### Roles (JWT required)
- `GET /api/roles` - Query params: page, limit, search, sortBy, sortOrder (requires READ_ROLE)
- `POST /api/roles` - { name, permissions[], description? } (requires CREATE_ROLE)
- `PUT /api/roles/:id` - { name?, permissions[], description? } (requires UPDATE_ROLE)
- `DELETE /api/roles/:id` (requires DELETE_ROLE)
- `GET /api/roles/:id` (requires READ_ROLE)

## Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
```

## Key Patterns

### Frontend
- **React Query**: Used for all API calls with 5min staleTime, placeholderData for smooth pagination
- **TanStack Table**: Server-side pagination with memoized columns
- **Debounce**: 500ms on search input to reduce API calls
- **Permission-based UI**: Components check permissions before rendering (Navbar, LeadsPage actions)
- **Centralized Auth**: All permission checks use `hasPermission()` from `utils/auth.ts`
- **Form Handling**: React Hook Form with controlled components
- **Modal Reuse**: Dialog component reused for create/edit modals

### Backend
- **JWT**: Token stored in localStorage, sent as `Bearer <token>` in Authorization header
- **Permission Expansion**: Middleware automatically expands super permissions to granular ones
- **Role-based Access**: Users have roles, roles have permissions array
- **Default Role**: New users get "user" role by default
- **Aggregation Pipeline**: Used in getLeads for efficient filtering/sorting/pagination
- **Indexes**: Lead model has compound indexes on (status, owner, createdAt) and text index on (name, email, company)

## Data Models

### Lead Schema
```javascript
{
  name: String (required),
  email: String (required),
  company: String (required),
  status: enum['New', 'Contacted', 'Qualified', 'Lost'] (default: 'New'),
  owner: String (required),
  timestamps: true
}
```

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: ObjectId (ref: 'Role', default: null),
  timestamps: true
}
```

### Role Schema
```javascript
{
  name: String (required, unique),
  permissions: [String] (default: []),
  description: String,
  timestamps: true
}
```

## Running the Project
```bash
# Backend
cd server
npm install
npm run dev  # http://localhost:5000

# Frontend
cd client
npm install
npm run dev  # http://localhost:5173

# Seed Database (optional)
cd server
node src/seed/seedLeads.js  # Creates 10,000 leads
```

## Development Guidelines

### When Adding New Features
1. **Add Permissions**: Define granular permissions in constants files
2. **Update Routes**: Use `authorize(PERMISSIONS.YOUR_PERMISSION)` in route definitions
3. **Update Client**: Use `hasPermission(PERMISSIONS.YOUR_PERMISSION, user)` for UI checks
4. **Update Types**: Add TypeScript interfaces in types/ directory
5. **Test**: Verify permission checks work on both client and server

### Permission Best Practices
- Always use centralized permission constants, never hardcoded strings
- Use granular permissions for fine-grained control
- Keep super permissions for backward compatibility
- Test permission expansion logic when modifying permissions
- Document new permissions in this agent.md file

# Agent Context - CRM Leads Management

## Project Overview
Full-stack CRM application with JWT auth, MongoDB, React + TypeScript. Handles large-scale lead data with server-side pagination, sorting, filtering, and global search.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TanStack Table, React Query, TailwindCSS
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Key File Structure

### Frontend (`client/src/`)
```
api/
  axios.ts          # Axios instance with auth interceptor
  leadApi.ts        # fetchLeads, createLead, updateLead, deleteLead, globalSearch
components/
  DataTable.tsx     # TanStack Table wrapper
  GlobalSearch.tsx  # Search with 500ms debounce
  LeadModal.tsx     # Modal for add/edit leads
  Navbar.tsx        # Navigation
pages/
  LeadsPage.tsx     # Main dashboard with CRUD, filters, pagination
  LoginPage.tsx     # Login form
  RegisterPage.tsx  # Registration form
table/
  columns.tsx       # Column definitions + createColumns() with actions
types/
  lead.ts           # Lead interface
```

### Backend (`server/src/`)
```
config/
  db.js             # MongoDB connection
controllers/
  authController.js # register, login
  leadController.js # getLeads, createLead, updateLead, deleteLead
  searchController.js # globalSearch
middleware/
  authMiddleware.js # JWT verification (protect)
models/
  Lead.js           # Lead schema with indexes
  User.js           # User schema
routes/
  authRoutes.js     # POST /register, /login
  leadRoutes.js     # GET, POST, PUT, DELETE /leads
  searchRoutes.js   # GET /search/global
app.js              # Express app setup
```

## API Endpoints

### Auth (No auth required)
- `POST /api/auth/register` - { name, email, password }
- `POST /api/auth/login` - { email, password } → returns JWT

### Leads (JWT required)
- `GET /api/leads` - Query params: page, limit, sortBy, sortOrder, status, owner, search
- `POST /api/leads` - { name, email, company, status?, owner }
- `PUT /api/leads/:id` - { name?, email?, company?, status?, owner? }
- `DELETE /api/leads/:id`

### Search (JWT required)
- `GET /api/search/global?query=...`

## Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
```

## Key Patterns

### Frontend
- **React Query**: Used for all API calls with 5min staleTime
- **TanStack Table**: Server-side pagination with memoized columns
- **Debounce**: 500ms on search input to reduce API calls
- **Modal**: LeadModal reused for both create and edit
- **Mutations**: useMutation for create/update/delete with queryClient invalidation

### Backend
- **JWT**: Token stored in localStorage, sent as `Bearer <token>` in Authorization header
- **Aggregation Pipeline**: Used in getLeads for efficient filtering/sorting/pagination
- **Indexes**: Lead model has compound indexes on (status, owner, createdAt) and text index on (name, email, company)
- **Rate Limiting**: 100 requests per 15 minutes per IP

## Lead Schema
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
```

## Recent Changes
- Added full CRUD: createLead, updateLead, deleteLead in backend
- Added LeadModal component for add/edit
- Added action buttons (edit/delete) in table columns
- Added delete confirmation modal
- Added "Add Lead" button in header

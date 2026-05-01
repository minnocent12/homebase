export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: 'ASSOCIATE' | 'MANAGER' | 'ADMIN';
}
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; password: string; role?: string; }
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequestCategory = 'IT' | 'HR' | 'FACILITIES' | 'SUPPLY' | 'OTHER';
export interface Request { id: string; title: string; description: string; status: RequestStatus; priority: RequestPriority; category: RequestCategory; createdById: string; createdByName: string; assignedToId: string | null; assignedToName: string | null; createdAt: string; updatedAt: string; }
export interface CreateRequestPayload { title: string; description?: string; priority?: RequestPriority; category?: RequestCategory; }
export interface UpdateRequestPayload { title?: string; description?: string; status?: RequestStatus; priority?: RequestPriority; category?: RequestCategory; assignedToId?: string; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; first: boolean; last: boolean; }
export interface DashboardSummary { open: number; inProgress: number; resolved: number; total: number; }

export interface Comment { id: string; requestId: string; userId: string; userName: string; userRole: string; body: string; createdAt: string; }

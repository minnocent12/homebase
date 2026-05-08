export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: 'ASSOCIATE' | 'TECHNICIAN' | 'MANAGER' | 'ADMIN';
  teamId: string | null;
  teamName: string | null;
}
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; password: string; role?: string; }
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequestCategory = 'IT' | 'HR' | 'FACILITIES' | 'SUPPLY' | 'OTHER';
export interface Request { id: string; requestNumber: number; title: string; description: string; status: RequestStatus; priority: RequestPriority; category: RequestCategory; createdById: string; createdByName: string; assignedToId: string | null; assignedToName: string | null; teamId: string | null; teamName: string | null; createdAt: string; updatedAt: string; }
export interface CreateRequestPayload { title: string; description?: string; priority?: RequestPriority; category?: RequestCategory; }
export interface UpdateRequestPayload { title?: string; description?: string; status?: RequestStatus; priority?: RequestPriority; category?: RequestCategory; assignedToId?: string; }
export interface CreateUserPayload { fullName: string; email: string; password: string; role?: string; teamId?: string | null; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; first: boolean; last: boolean; }
export interface DashboardSummary { open: number; inProgress: number; resolved: number; total: number; }

export interface UserSummary { id: string; fullName: string; email: string; role: string; teamId: string | null; teamName: string | null; teamCategory: string | null; createdAt: string; active: boolean; }
export interface Team { id: string; name: string; description: string; category: string | null; members: UserSummary[]; }
export interface Comment { id: string; requestId: string; userId: string; userName: string; userRole: string; body: string; createdAt: string; }
export interface StatusHistoryEntry { id: string; oldStatus: string | null; newStatus: string; changedByName: string; changedByRole: string; changedAt: string; }

export interface UpdateUserPayload { fullName?: string; email?: string; role?: string; teamId?: string; }

export interface ChartEntry { name: string; value: number; }
export interface RecentComment { id: string; body: string; requestTitle: string; requestId: string; createdAt: string; }
export interface RecentRequest { id: string; title: string; status: string; priority: string; createdAt: string; }

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  teamId: string | null;
  teamName: string | null;
  teamCategory: string | null;
  createdAt: string;
  active: boolean;
  requestsCreated: number;
  requestsAssigned: number;
  commentsPosted: number;
  avgResolutionHours: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  assignedOpenCount: number;
  assignedInProgressCount: number;
  assignedResolvedCount: number;
  trendData: ChartEntry[];
  assignedTrendData: ChartEntry[];
  comments: RecentComment[];
  submittedRequests: RecentRequest[];
  assignedRequests: RecentRequest[];
}

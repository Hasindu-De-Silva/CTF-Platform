import type {
  User,
  PlayerChallenge,
  AdminChallenge,
  AdminChallengeRequest,
  SubmitFlagResponse,
  ScoreboardEntry,
  SubmissionLog,
  AdminUser,
  UnlockHintResponse,
} from '../types/api';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        errorMessage = errorData;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Check if content-type is json
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as Promise<T>;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { username: string; password: string }): Promise<User> =>
      request<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (credentials: { username: string; password: string }): Promise<string> =>
      request<string>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    logout: (): Promise<string> =>
      request<string>('/auth/logout', {
        method: 'POST',
      }),

    me: (): Promise<User> => request<User>('/auth/me'),
  },

  // Player Challenges
  challenges: {
    list: (): Promise<PlayerChallenge[]> =>
      request<PlayerChallenge[]>('/challenges'),

    getOne: (id: number): Promise<PlayerChallenge> =>
      request<PlayerChallenge>(`/challenges/${id}`),

    submitFlag: (id: number, flag: string): Promise<SubmitFlagResponse> =>
      request<SubmitFlagResponse>(`/challenges/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ flag }),
      }),

    unlockHint: (id: number, tier: number): Promise<UnlockHintResponse> =>
      request<UnlockHintResponse>(`/challenges/${id}/hints/${tier}`, {
        method: 'POST',
      }),
  },

  // Scoreboard
  scoreboard: {
    get: (): Promise<ScoreboardEntry[]> =>
      request<ScoreboardEntry[]>('/scoreboard'),
  },

  // Admin
  admin: {
    listChallenges: (): Promise<AdminChallenge[]> =>
      request<AdminChallenge[]>('/admin/challenges'),

    createChallenge: (data: AdminChallengeRequest): Promise<AdminChallenge> =>
      request<AdminChallenge>('/admin/challenges', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateChallenge: (id: number, data: AdminChallengeRequest): Promise<AdminChallenge> =>
      request<AdminChallenge>(`/admin/challenges/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteChallenge: (id: number): Promise<void> =>
      request<void>(`/admin/challenges/${id}`, {
        method: 'DELETE',
      }),

    getSubmissions: (): Promise<SubmissionLog[]> =>
      request<SubmissionLog[]>('/admin/submissions'),

    listUsers: (): Promise<AdminUser[]> =>
      request<AdminUser[]>('/admin/users'),

    deleteUser: (id: number): Promise<void> =>
      request<void>(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
  },
};

import { API_BASE } from './api';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface User {
  id?: number;
  name: string;
  email: string;
  api_token?: string;
  picture?: string;
  googleId?: string;
}

export interface Question {
  id?: string;
  text?: string;
  marks: number;
  difficulty?: string;
  unit?: string;
  isAIGenerated?: boolean;
  subQuestionsCount?: number;
  subQuestions?: SubQuestion[];
}

export interface SubQuestion {
  id: string;
  text: string;
  marks: number;
}

export interface Section {
  id?: string;
  name: string;
  questions: Question[];
}

export interface PaperHistory {
  objectUrl: string;
  created_at: string;
  subjectName: string;
}

export interface StatsResponse {
  totalPapers: number;
  activeUsers: number;
  avgTime: number;
  satisfaction: number;
}

export interface SupportPayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface Workspace {
  id: number;
  user_id: number;
  name: string;
  institution_name: string | null;
  type: 'university' | 'school' | 'coaching' | 'other';
  logo_url: string | null;
  is_default: boolean;
  created_at: string;
}

export interface PatternSection {
  name: string;
  questionCount: number;
  marksPerQuestion: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  units: string[];
  subQuestionsCount: number;
}

export interface ExamPattern {
  id: number;
  workspace_id: number;
  name: string;
  config: { sections: PatternSection[] };
  created_at: string;
}

export interface StoreMetadataPayload {
  email: string;
  uploadURL: string;
  objectURL: string;
  dateTime: string;
  subjectName: string;
  templateId: number;
}

// ─── Core Request ─────────────────────────────────────────────────────────────

function buildAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('apiToken');
  if (!token) return {};
  return { Authorization: `Bearer ${btoa(token)}` };
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    formData?: FormData;
    params?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);

  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = { ...buildAuthHeader() };
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const res = await fetch(url.toString(), { method, headers, body });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) return res.json() as Promise<T>;
  return res.blob() as unknown as Promise<T>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ message: string; user: User; token: string }>('POST', '/auth/login', {
        body: { email, password },
      }),

    signup: (name: string, email: string, password: string) =>
      request<{ message: string; user: User }>('POST', '/auth/signup', {
        body: { name, email, password },
      }),

    forgotPassword: (email: string) =>
      request<{ message: string }>('POST', '/auth/forgot-password', { body: { email } }),

    resetPassword: (token: string, newPassword: string) =>
      request<{ message: string }>('POST', '/auth/reset-password', {
        body: { token, newPassword },
      }),

    googleLogin: (token: string) =>
      request<{ success: boolean; token: string; user: User }>('POST', '/auth/google', {
        body: { token },
      }),

    googleSignup: (token: string) =>
      request<{ success: boolean; token: string; user: User }>('POST', '/auth/google-signup', {
        body: { token },
      }),
  },

  credits: {
    get: (email: string) =>
      request<{ email: string; credits: number }>('POST', '/get-credits', { body: { email } }),

    deduct: (email: string) =>
      request<{ message: string; credits: number }>('POST', '/deduct-credits', {
        body: { email },
      }),
  },

  papers: {
    generate: (payload: unknown) =>
      request<{ sections: Section[] }>('POST', '/generate-questions', { body: payload }),

    getHistory: (email: string) =>
      request<{ email: string; data: PaperHistory[] }>('POST', '/get-questions-paper-history', {
        body: { email },
      }),

    extractSyllabus: (file: File) => {
      const fd = new FormData();
      fd.append('image', file);
      return request<{ subjectName: string; subjectCode: string; syllabusText: string }>('POST', '/extract-syllabus', {
        formData: fd,
      });
    },

    generateAnswerKey: (questionPaper: unknown) =>
      request<{ answerKey: unknown }>('POST', '/generate-answer-key', {
        body: { questionPaper },
      }),
  },

  storage: {
    getUploadUrl: (filename: string, filetype: string) =>
      request<{ uploadURL: string; objectURL: string }>('GET', '/get-upload-url', {
        params: { filename, filetype },
      }),

    storeMetadata: (data: StoreMetadataPayload) =>
      request<{ message: string }>('POST', '/store-upload-metadata', { body: data }),
  },

  encryptPdf: (pdfBlob: Blob, password: string) => {
    const fd = new FormData();
    fd.append('pdf', pdfBlob, 'paper.pdf');
    fd.append('password', password);
    return request<Blob>('POST', '/encrypt-pdf', { formData: fd });
  },

  sendEmail: (formData: FormData) =>
    request<{ message: string }>('POST', '/send-email', { formData }),

  support: {
    send: (data: SupportPayload) =>
      request<{ message: string }>('POST', '/support', { body: data }),

    slackAlert: (data: SupportPayload) =>
      request<{ ok: boolean }>('POST', '/slack-alert', { body: data }),
  },

  stats: {
    get: () => request<StatsResponse>('GET', '/stats'),
  },

  workspaces: {
    list: () =>
      request<{ workspaces: Workspace[] }>('GET', '/workspaces'),

    create: (data: { name: string; institution_name?: string; type?: string; logo_url?: string }) =>
      request<{ workspace: Workspace }>('POST', '/workspaces', { body: data }),

    update: (id: number, data: { name: string; institution_name?: string; type?: string; logo_url?: string }) =>
      request<{ message: string }>('PUT', `/workspaces/${id}`, { body: data }),

    delete: (id: number) =>
      request<{ message: string }>('DELETE', `/workspaces/${id}`),

    setDefault: (id: number) =>
      request<{ message: string }>('PUT', `/workspaces/${id}/set-default`),

    getPatterns: (workspaceId: number) =>
      request<{ patterns: ExamPattern[] }>('GET', `/workspaces/${workspaceId}/patterns`),

    createPattern: (workspaceId: number, data: { name: string; config: { sections: PatternSection[] } }) =>
      request<{ pattern: ExamPattern }>('POST', `/workspaces/${workspaceId}/patterns`, { body: data }),

    updatePattern: (workspaceId: number, patternId: number, data: { name: string; config: { sections: PatternSection[] } }) =>
      request<{ message: string }>('PUT', `/workspaces/${workspaceId}/patterns/${patternId}`, { body: data }),

    deletePattern: (workspaceId: number, patternId: number) =>
      request<{ message: string }>('DELETE', `/workspaces/${workspaceId}/patterns/${patternId}`),
  },
};

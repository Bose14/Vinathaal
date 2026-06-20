import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, Workspace, ExamPattern } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  patterns: ExamPattern[];
  loading: boolean;
  setActiveWorkspace: (workspace: Workspace) => void;
  loadWorkspaces: () => Promise<void>;
  refreshPatterns: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [patterns, setPatterns] = useState<ExamPattern[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPatterns = useCallback(async (workspaceId: number) => {
    try {
      const data = await api.workspaces.getPatterns(workspaceId);
      setPatterns(data.patterns);
    } catch {
      setPatterns([]);
    }
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.workspaces.list();
      setWorkspaces(data.workspaces);

      const savedId = localStorage.getItem('activeWorkspaceId');
      const saved = savedId
        ? data.workspaces.find((w) => w.id === parseInt(savedId))
        : null;
      const defaultWs = data.workspaces.find((w) => w.is_default) ?? data.workspaces[0] ?? null;
      const active = saved ?? defaultWs;

      setActiveWorkspaceState(active);
      if (active) await loadPatterns(active.id);
    } catch {
      // user may not have workspaces yet — that's fine
    } finally {
      setLoading(false);
    }
  }, [loadPatterns]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      setPatterns([]);
      return;
    }
    loadWorkspaces();
  }, [isAuthenticated, loadWorkspaces]);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem('activeWorkspaceId', workspace.id.toString());
    loadPatterns(workspace.id);
  };

  const refreshPatterns = useCallback(async () => {
    if (activeWorkspace) await loadPatterns(activeWorkspace.id);
  }, [activeWorkspace, loadPatterns]);

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, activeWorkspace, patterns, loading, setActiveWorkspace, loadWorkspaces, refreshPatterns }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return ctx;
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Building2, GraduationCap, BookOpen, Star, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWorkspace } from '@/context/WorkspaceContext';
import { api, Workspace, ExamPattern } from '@/lib/apiClient';
import { PRESET_PATTERNS, PresetPattern } from '@/lib/presetPatterns';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  university: 'University',
  school: 'School',
  coaching: 'Coaching',
  other: 'Other',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  university: <GraduationCap className="w-4 h-4" />,
  school: <BookOpen className="w-4 h-4" />,
  coaching: <Building2 className="w-4 h-4" />,
  other: <Building2 className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  university: 'bg-blue-100 text-blue-700',
  school: 'bg-green-100 text-green-700',
  coaching: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-700',
};

// ─── Workspace Form ────────────────────────────────────────────────────────────

interface WorkspaceFormData {
  name: string;
  institution_name: string;
  type: 'university' | 'school' | 'coaching' | 'other';
  logo_url: string;
}

const emptyForm: WorkspaceFormData = {
  name: '',
  institution_name: '',
  type: 'university',
  logo_url: '',
};

function WorkspaceFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: WorkspaceFormData;
  onSave: (data: WorkspaceFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<WorkspaceFormData>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof WorkspaceFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Workspace name is required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-md mx-4 shadow-2xl">
        <CardHeader>
          <CardTitle>{initial ? 'Edit Workspace' : 'Create Workspace'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Workspace Name *</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g., PSG College Papers" />
            </div>
            <div className="space-y-1">
              <Label>Institution Name</Label>
              <Input value={form.institution_name} onChange={(e) => set('institution_name', e.target.value)} placeholder="e.g., PSG College of Technology" />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University / College</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="coaching">Coaching Centre</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Logo URL (optional)</Label>
              <Input value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Pattern Card ──────────────────────────────────────────────────────────────

function PatternCard({
  pattern,
  onDelete,
}: {
  pattern: ExamPattern;
  onDelete: () => void;
}) {
  const totalMarks = pattern.config.sections.reduce(
    (sum, s) => sum + s.questionCount * s.marksPerQuestion,
    0
  );

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-slate-900">{pattern.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {pattern.config.sections.length} sections · {totalMarks} marks
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700 p-1 h-auto">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {pattern.config.sections.map((s) => (
          <span key={s.name} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {s.name}: {s.questionCount}×{s.marksPerQuestion}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Preset Picker ────────────────────────────────────────────────────────────

function PresetPicker({
  institutionType,
  onPick,
}: {
  institutionType: string;
  onPick: (preset: PresetPattern) => void;
}) {
  const relevant = PRESET_PATTERNS.filter((p) => p.institutionType === institutionType);
  const others = PRESET_PATTERNS.filter((p) => p.institutionType !== institutionType);

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {[...relevant, ...others].map((preset) => (
        <div
          key={preset.id}
          className="border border-slate-200 rounded-lg p-3 hover:border-primary/50 hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => onPick(preset)}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{preset.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{preset.description}</p>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{preset.totalMarks}M</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Workspace Row ─────────────────────────────────────────────────────────────

function WorkspaceRow({
  workspace,
  isActive,
  onActivate,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  workspace: Workspace;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [patterns, setPatterns] = useState<ExamPattern[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const loadPatterns = async () => {
    setLoadingPatterns(true);
    try {
      const data = await api.workspaces.getPatterns(workspace.id);
      setPatterns(data.patterns);
    } catch {
      toast.error('Failed to load patterns');
    } finally {
      setLoadingPatterns(false);
    }
  };

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && patterns.length === 0) loadPatterns();
  };

  const handleDeletePattern = async (patternId: number) => {
    await api.workspaces.deletePattern(workspace.id, patternId);
    setPatterns((ps) => ps.filter((p) => p.id !== patternId));
    toast.success('Pattern deleted');
  };

  const handleAddPreset = async (preset: PresetPattern) => {
    try {
      const data = await api.workspaces.createPattern(workspace.id, {
        name: preset.name,
        config: { sections: preset.sections },
      });
      setPatterns((ps) => [...ps, data.pattern]);
      setShowPresets(false);
      toast.success(`"${preset.name}" added`);
    } catch {
      toast.error('Failed to add pattern');
    }
  };

  return (
    <Card className={`transition-shadow ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${TYPE_COLORS[workspace.type]}`}>
              {TYPE_ICONS[workspace.type]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 truncate">{workspace.name}</p>
                {workspace.is_default && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" /> Default
                  </Badge>
                )}
                {isActive && (
                  <Badge className="text-xs bg-primary">Active</Badge>
                )}
              </div>
              {workspace.institution_name && (
                <p className="text-sm text-slate-500 truncate">{workspace.institution_name}</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">{TYPE_LABELS[workspace.type]}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isActive && (
              <Button variant="outline" size="sm" onClick={onActivate} className="text-xs h-7 px-2">
                Use
              </Button>
            )}
            {!workspace.is_default && (
              <Button variant="ghost" size="sm" onClick={onSetDefault} className="h-7 px-2" title="Set as default">
                <Star className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 px-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExpand} className="h-7 px-2">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">Exam Patterns</p>
              <Button variant="outline" size="sm" onClick={() => setShowPresets(!showPresets)} className="text-xs h-7">
                <Plus className="w-3 h-3 mr-1" />
                Add from Library
              </Button>
            </div>

            {showPresets && (
              <div className="mb-4 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <p className="text-xs font-medium text-slate-600 mb-2">Pick a preset pattern:</p>
                <PresetPicker institutionType={workspace.type} onPick={handleAddPreset} />
              </div>
            )}

            {loadingPatterns ? (
              <p className="text-sm text-slate-400">Loading patterns...</p>
            ) : patterns.length === 0 ? (
              <p className="text-sm text-slate-400">No patterns yet. Add from the library above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patterns.map((p) => (
                  <PatternCard key={p.id} pattern={p} onDelete={() => handleDeletePattern(p.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Workspaces() {
  useRequireAuth('/workspaces');
  const { workspaces, activeWorkspace, loadWorkspaces, setActiveWorkspace } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Workspace | null>(null);

  const handleCreate = async (data: WorkspaceFormData) => {
    await api.workspaces.create(data);
    await loadWorkspaces();
    toast.success('Workspace created');
  };

  const handleEdit = async (data: WorkspaceFormData) => {
    if (!editTarget) return;
    await api.workspaces.update(editTarget.id, data);
    await loadWorkspaces();
    toast.success('Workspace updated');
    setEditTarget(null);
  };

  const handleDelete = async (workspace: Workspace) => {
    if (!confirm(`Delete workspace "${workspace.name}"? This also deletes all its patterns.`)) return;
    await api.workspaces.delete(workspace.id);
    await loadWorkspaces();
    toast.success('Workspace deleted');
  };

  const handleSetDefault = async (workspace: Workspace) => {
    await api.workspaces.setDefault(workspace.id);
    await loadWorkspaces();
    toast.success(`"${workspace.name}" is now the default workspace`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <img src="/vinathaal%20logo.png" alt="Vinathaal Logo" className="h-12 w-auto object-contain" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Workspaces</h1>
            <p className="text-sm text-slate-500 mt-1">
              Each workspace keeps its own branding and exam patterns.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Workspace
          </Button>
        </div>

        {workspaces.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No workspaces yet. Create your first one to get started.</p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workspaces.map((ws) => (
              <WorkspaceRow
                key={ws.id}
                workspace={ws}
                isActive={activeWorkspace?.id === ws.id}
                onActivate={() => setActiveWorkspace(ws)}
                onEdit={() => setEditTarget(ws)}
                onDelete={() => handleDelete(ws)}
                onSetDefault={() => handleSetDefault(ws)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">How workspaces work</p>
              <ul className="space-y-1 text-blue-600">
                <li>• The <strong>active workspace</strong> auto-fills institution name and logo when generating</li>
                <li>• <strong>Exam patterns</strong> let you one-click populate sections — no more filling the form</li>
                <li>• Switch workspace any time from the Generator or the navbar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <WorkspaceFormModal onSave={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editTarget && (
        <WorkspaceFormModal
          initial={{
            name: editTarget.name,
            institution_name: editTarget.institution_name ?? '',
            type: editTarget.type,
            logo_url: editTarget.logo_url ?? '',
          }}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

// Needed by WorkspaceFormModal
type WorkspaceFormData = {
  name: string;
  institution_name: string;
  type: 'university' | 'school' | 'coaching' | 'other';
  logo_url: string;
};

import React, { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppTheme } from '@/hooks/useapptheme';
import { Curso } from '@/types/admin';

interface CursosSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
}

const CursosSection: React.FC<CursosSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
}) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Curso>>({});

  const loadCursos = useCallback(async () => {
    try {
      const d = await apiFetch('/api/cursos');
      setCursos(d.cursos || []);
    } catch (e: any) {
      toastError(e.message || 'Erro ao carregar cursos.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    loadCursos();
  }, [loadCursos]);

  const handleSaveCourse = async () => {
    if (!editCourse.nome?.trim()) {
      toastError('Nome obrigatório.');
      return;
    }

    const body = {
      nome: editCourse.nome.trim(),
      carga_horaria_minima: Number(editCourse.carga_horaria_minima) || 200,
    };

    try {
      if (editCourse.id) {
        await apiFetch(`/api/cursos/${editCourse.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        toastSuccess('Curso atualizado!');
      } else {
        await apiFetch('/api/cursos', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        toastSuccess('Curso cadastrado!');
      }

      await loadCursos();
      setCourseDialog(false);
      setEditCourse({});
    } catch (e: any) {
      toastError(e.message || 'Erro ao salvar curso.');
    }
  };

  const handleDeleteCourse = async (id: string, nome: string) => {
    if (!confirm(`Excluir o curso "${nome}"?`)) return;

    try {
      await apiFetch(`/api/cursos/${id}`, { method: 'DELETE' });
      toastSuccess('Curso excluído!');
      await loadCursos();
    } catch (e: any) {
      toastError(e.message || 'Erro ao excluir curso.');
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-xl" style={{ color: colors.textPrimary }}>Gestão de Cursos</h2>
        <Button onClick={() => { setEditCourse({}); setCourseDialog(true); }} style={{ background: accentBlue }}>
          <Plus className="h-4 w-4 mr-2" /> Novo Curso
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
        <table className="w-full">
          <thead style={{ background: colors.tableHeaderBg }}>
            <tr>
              <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Nome</th>
              <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Carga Horária</th>
              <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(c => (
              <tr key={c.id} className="border-b" style={{ borderColor: colors.cardBorder }}>
                <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{c.nome}</td>
                <td className="px-5 py-4" style={{ color: accentBlue }}>{c.carga_horaria_minima}h</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => { setEditCourse(c); setCourseDialog(true); }}
                    className="mr-2"
                    style={{ color: accentBlue }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id, c.nome)}
                    style={{ color: 'hsl(0, 72%, 60%)' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog: Curso */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>
              {editCourse.id ? 'Editar Curso' : 'Novo Curso'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do curso"
              value={editCourse.nome || ''}
              onChange={e => setEditCourse({ ...editCourse, nome: e.target.value })}
              style={{
                background: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.inputBorder}`,
              }}
            />
            <Input
              type="number"
              placeholder="Carga horária mínima (ex: 200)"
              value={editCourse.carga_horaria_minima || ''}
              onChange={e => setEditCourse({ ...editCourse, carga_horaria_minima: Number(e.target.value) })}
              style={{
                background: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.inputBorder}`,
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setCourseDialog(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleSaveCourse} style={{ background: accentBlue }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CursosSection;

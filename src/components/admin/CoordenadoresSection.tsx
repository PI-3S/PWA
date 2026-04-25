import React, { useState, useCallback } from 'react';
import { Link2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';
import { CoordCurso, Usuario, Curso } from '@/types/admin';

interface CoordenadoresSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const CoordenadoresSection: React.FC<CoordenadoresSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [coordCursos, setCoordCursos] = useState<CoordCurso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [coordDialog, setCoordDialog] = useState(false);
  const [newCoord, setNewCoord] = useState({ usuario_id: '', curso_id: '' });

  const loadCoordCursos = useCallback(async () => {
    try {
      const [dVinculos, dUsuarios, dCursos] = await Promise.all([
        apiFetch('/api/coordenadores-cursos'),
        apiFetch('/api/usuarios'),
        apiFetch('/api/cursos'),
      ]);

      const vinculos = (dVinculos.vinculos || []).map((v: any) => {
        const usuario = (dUsuarios.usuarios || []).find((u: any) => u.id === v.usuario_id);
        const curso = (dCursos.cursos || []).find((c: any) => c.id === v.curso_id);
        return {
          ...v,
          coordenador_nome: usuario?.nome || v.usuario_id,
          coordenador_email: usuario?.email || '',
          curso_nome: curso?.nome || v.curso_id,
        };
      });

      setCoordCursos(vinculos);
      setUsuarios(dUsuarios.usuarios || []);
      setCursos(dCursos.cursos || []);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar vínculos.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    loadCoordCursos();
  }, [loadCoordCursos]);

  const handleCreateCoordVinculo = async () => {
    if (!newCoord.usuario_id || !newCoord.curso_id) {
      toastError('Selecione coordenador e curso.');
      return;
    }
    try {
      await apiFetch('/api/coordenadores-cursos', {
        method: 'POST',
        body: JSON.stringify(newCoord),
      });
      toastSuccess('Vínculo criado!');
      setCoordDialog(false);
      setNewCoord({ usuario_id: '', curso_id: '' });
      loadCoordCursos();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao criar vínculo.');
    }
  };

  const handleRemoveCoordVinculo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vínculo?')) return;
    try {
      await apiFetch(`/api/coordenadores-cursos/${id}`, { method: 'DELETE' });
      toastSuccess('Vínculo removido!');
      loadCoordCursos();
    } catch (e: any) {
      if (e.message !== 'Não autorização') toastError(e.message || 'Erro ao remover vínculo.');
    }
  };

  const coordenadores = usuarios.filter(u => u.perfil === 'coordenador');

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl" style={{ color: colors.textPrimary }}>Vínculos de Coordenadores</h2>
        <Button onClick={() => setCoordDialog(true)} style={{ background: accentBlue }}>
          <Link2 className="h-4 w-4 mr-2" /> Novo Vínculo
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
        <table className="w-full">
          <thead style={{ background: colors.tableHeaderBg }}>
            <tr>
              <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Coordenador</th>
              <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
              <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {coordCursos.map(c => (
              <tr key={c.id} className="border-b" style={{ borderColor: colors.cardBorder }}>
                <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{c.coordenador_nome}</td>
                <td className="px-5 py-4" style={{ color: accentOrange }}>{c.curso_nome}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleRemoveCoordVinculo(c.id)}
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

      {/* Dialog: Vínculo Coordenador */}
      <Dialog open={coordDialog} onOpenChange={setCoordDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Vincular Coordenador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={newCoord.usuario_id}
              onValueChange={v => setNewCoord({ ...newCoord, usuario_id: v })}
            >
              <SelectTrigger style={inputStyle}>
                <SelectValue placeholder="Coordenador" />
              </SelectTrigger>
              <SelectContent>
                {coordenadores.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newCoord.curso_id}
              onValueChange={v => setNewCoord({ ...newCoord, curso_id: v })}
            >
              <SelectTrigger style={inputStyle}>
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCoordVinculo} style={{ background: accentBlue }}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordenadoresSection;

import React, { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';
import { Regra, Curso } from '@/types/admin';

interface RegrasSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const RegrasSection: React.FC<RegrasSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [regras, setRegras] = useState<Regra[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editRule, setEditRule] = useState<Partial<Regra & { exige_comprovante_str: string }>>({});

  const loadRegras = useCallback(async () => {
    try {
      const d = await apiFetch('/api/regras');
      setRegras(d.regras || []);
    } catch (e: any) {
      toastError(e.message || 'Erro ao carregar regras.');
    }
  }, [apiFetch, toastError]);

  const loadCursos = useCallback(async () => {
    try {
      const d = await apiFetch('/api/cursos');
      setCursos(d.cursos || []);
    } catch (e: any) {
      toastError(e.message || 'Erro ao carregar cursos.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    Promise.all([loadRegras(), loadCursos()]);
  }, [loadRegras, loadCursos]);

  const handleSaveRule = async () => {
    if (!editRule.area || !editRule.curso_id) {
      toastError('Preencha os campos obrigatórios.');
      return;
    }

    try {
      await apiFetch('/api/regras', {
        method: 'POST',
        body: JSON.stringify({
          area: editRule.area,
          limite_horas: editRule.limite_horas || 60,
          exige_comprovante: editRule.exige_comprovante_str === 'sim',
          curso_id: editRule.curso_id,
        }),
      });
      toastSuccess('Regra criada com sucesso!');
      setRuleDialog(false);
      setEditRule({});
      loadRegras();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao salvar regra.');
    }
  };

  const handleEditRule = async () => {
    if (!editRule.id || !editRule.area || !editRule.curso_id) {
      toastError('Preencha os campos obrigatórios.');
      return;
    }

    try {
      await apiFetch(`/api/regras/${editRule.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          area: editRule.area,
          limite_horas: editRule.limite_horas || 60,
          exige_comprovante: editRule.exige_comprovante_str === 'sim',
          curso_id: editRule.curso_id,
        }),
      });
      toastSuccess('Regra atualizada com sucesso!');
      setRuleDialog(false);
      setEditRule({});
      loadRegras();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao atualizar regra.');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    try {
      await apiFetch(`/api/regras/${id}`, { method: 'DELETE' });
      toastSuccess('Regra excluída!');
      loadRegras();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao excluir regra.');
    }
  };

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl" style={{ color: colors.textPrimary }}>Regras de Atividades</h2>
        <Button
          onClick={() => { setEditRule({}); setRuleDialog(true); }}
          style={{ background: accentBlue }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Regra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regras.map(r => (
          <div
            key={r.id}
            className="p-5 rounded-xl relative"
            style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}
          >
            <div className="absolute top-3 right-3 flex gap-1">
              <button
                onClick={() => {
                  setEditRule({
                    ...r,
                    exige_comprovante_str: r.exige_comprovante ? 'sim' : 'nao',
                  });
                  setRuleDialog(true);
                }}
                style={{ color: accentBlue }}
                title="Editar regra"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteRule(r.id)}
                style={{ color: 'hsl(0, 72%, 60%)' }}
                title="Excluir regra"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <h4 className="text-lg mb-1 pr-16" style={{ color: colors.textPrimary }}>{r.area}</h4>
            <p className="text-xs mb-2" style={{ color: colors.labelColor }}>{r.curso_nome}</p>
            <p className="text-sm mb-2" style={{ color: accentBlue }}>Limite: {r.limite_horas}h</p>
            <Badge style={{
              background: r.exige_comprovante ? 'hsla(152, 60%, 40%, 0.15)' : 'hsla(220, 40%, 30%, 0.4)',
              color: r.exige_comprovante ? 'hsl(152, 60%, 55%)' : colors.labelColor,
              border: `1px solid ${r.exige_comprovante ? 'hsla(152,60%,40%,0.3)' : 'transparent'}`,
            }}>
              {r.exige_comprovante ? 'Exige comprovante' : 'Não exige'}
            </Badge>
          </div>
        ))}
      </div>

      {/* Dialog: Regra */}
      <Dialog open={ruleDialog} onOpenChange={(open) => { setRuleDialog(open); if (!open) setEditRule({}); }}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>
              {editRule.id ? 'Editar Regra' : 'Nova Regra'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Área de Atividade</label>
              <Input
                placeholder="Ex: Extensão, Pesquisa..."
                value={editRule.area || ''}
                onChange={e => setEditRule({ ...editRule, area: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Limite de Horas</label>
              <Input
                type="number"
                placeholder="Ex: 60"
                value={editRule.limite_horas || ''}
                onChange={e => setEditRule({ ...editRule, limite_horas: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Exige Comprovante?</label>
              <Select
                value={editRule.exige_comprovante_str || ''}
                onValueChange={v => setEditRule({ ...editRule, exige_comprovante_str: v })}
              >
                <SelectTrigger style={inputStyle}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Curso</label>
              <Select
                value={editRule.curso_id || ''}
                onValueChange={v => setEditRule({ ...editRule, curso_id: v })}
              >
                <SelectTrigger style={inputStyle}>
                  <SelectValue placeholder="Selecione o curso..." />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => { setRuleDialog(false); setEditRule({}); }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={editRule.id ? handleEditRule : handleSaveRule}
              style={{ background: accentBlue }}
            >
              {editRule.id ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegrasSection;

import React, { useState, useCallback } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';

interface CadastrarSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  onCadastroSuccess?: () => void;
  accentOrange: string;
}

const CadastrarSection: React.FC<CadastrarSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  onCadastroSuccess,
  accentOrange,
}) => {
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);
  const [cadForm, setCadForm] = useState({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
  const [cadLoading, setCadLoading] = useState(false);

  const fetchCursos = useCallback(async () => {
    try {
      const data = await apiFetch('/api/cursos');
      setCursos(Array.isArray(data) ? data : data.cursos || []);
    } catch { /* silent */ }
  }, [apiFetch]);

  React.useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadLoading(true);
    try {
      const data = await apiFetch('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({ ...cadForm, perfil: 'aluno' }),
      });
      toastSuccess('Aluno cadastrado com sucesso!');
      setCadForm({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
      onCadastroSuccess?.();
    } catch (err: any) {
      toastError(err.message || 'Erro ao cadastrar aluno.');
    } finally {
      setCadLoading(false);
    }
  };

  const inputStyle = { background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` };

  return (
    <div className="max-w-xl mx-auto p-8 rounded-xl border" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
      <h2 className="text-xl font-bold mb-6" style={{ color: colors.titleColor }}>Novo Cadastro de Aluno</h2>
      <form onSubmit={handleCadastrar} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Nome Completo</label>
          <Input value={cadForm.nome} onChange={e => setCadForm({ ...cadForm, nome: e.target.value })} style={inputStyle} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Matrícula</label>
            <Input value={cadForm.matricula} onChange={e => setCadForm({ ...cadForm, matricula: e.target.value })} style={inputStyle} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Curso</label>
            <Select onValueChange={val => setCadForm({ ...cadForm, curso_id: val })}>
              <SelectTrigger style={inputStyle}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Email Institucional</label>
          <Input type="email" value={cadForm.email} onChange={e => setCadForm({ ...cadForm, email: e.target.value })} style={inputStyle} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Senha Temporária</label>
          <Input type="password" value={cadForm.senha} onChange={e => setCadForm({ ...cadForm, senha: e.target.value })} style={inputStyle} required />
        </div>
        <Button type="submit" disabled={cadLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-white">
          {cadLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
          CADASTRAR ALUNO
        </Button>
      </form>
    </div>
  );
};

export default CadastrarSection;

import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';
import { Submissao, Curso } from '@/types/admin';

interface ValidacaoSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const ValidacaoSection: React.FC<ValidacaoSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cursoFilter, setCursoFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [certData, setCertData] = useState<{ url_arquivo?: string; texto_extraido?: string } | null>(null);
  const [loadingCert, setLoadingCert] = useState(false);

  const [correcaoDialog, setCorrecaoDialog] = useState(false);
  const [correcaoSubmissao, setCorrecaoSubmissao] = useState<Submissao | null>(null);
  const [correcaoObs, setCorrecaoObs] = useState('');

  const [approveDialog, setApproveDialog] = useState(false);
  const [approveSubmissao, setApproveSubmissao] = useState<Submissao | null>(null);
  const [approveHoras, setApproveHoras] = useState<number>(0);

  const loadSubmissoes = useCallback(async () => {
    try {
      const [dSubmissoes, dUsuarios, dCursos, dRegras] = await Promise.all([
        apiFetch('/api/submissoes'),
        apiFetch('/api/usuarios'),
        apiFetch('/api/cursos'),
        apiFetch('/api/regras'),
      ]);

      const raw = dSubmissoes.submissoes || dSubmissoes.data || [];
      const usuarios = dUsuarios.usuarios || [];
      const cursosList = dCursos.cursos || [];
      const regras = dRegras.regras || [];

      const usuariosMap = new Map<string, { nome: string; curso_id?: string }>();
      usuarios.forEach((u: any) => usuariosMap.set(u.id, { nome: u.nome, curso_id: u.curso_id }));

      const cursosMap = new Map<string, string>();
      cursosList.forEach((c: any) => cursosMap.set(c.id, c.nome));

      const regrasMap = new Map<string, { area: string }>();
      regras.forEach((r: any) => regrasMap.set(r.id, { area: r.area }));

      const mapped = raw.map((s: any) => {
        const aluno = usuariosMap.get(s.aluno_id || s.usuario_id);
        const cursoNome = s.curso_nome ||
          s.nome_curso ||
          s.curso?.nome ||
          cursosMap.get(s.curso_id || aluno?.curso_id) ||
          '—';
        const areaNome = s.area ||
          s.area_atividade ||
          s.categoria ||
          s.tipo ||
          (s.regra_id ? regrasMap.get(s.regra_id)?.area : null) ||
          '—';

        return {
          ...s,
          aluno_nome: s.aluno_nome || s.nome_aluno || aluno?.nome || s.usuario?.nome || s.usuario_nome || '—',
          curso_nome: cursoNome,
          area: areaNome,
          horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || s.horas || 0,
          status: s.status || 'pendente',
          data_validacao: s.data_validacao || s.updated_at || s.dataAtualizacao,
        };
      });

      setSubmissoes(mapped);
      setCursos(cursosList);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar submissões.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    loadSubmissoes();
  }, [loadSubmissoes]);

  const handleStatusChange = async (id: string, status: 'aprovado' | 'reprovado', horasAprovadas?: number) => {
    try {
      const body: Record<string, unknown> = { status };
      if (status === 'aprovado' && horasAprovadas !== undefined) {
        body.horas_aprovadas = horasAprovadas;
      }
      await apiFetch(`/api/submissoes/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      toastSuccess(status === 'aprovado' ? 'Submissão aprovada!' : 'Submissão reprovada.');
      await loadSubmissoes();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao atualizar status.');
    }
  };

  const loadCertificado = async (submissaoId: string) => {
    setLoadingCert(true);
    setCertData(null);
    try {
      const d = await apiFetch(`/api/certificados?submissao_id=${submissaoId}`);
      const cert = d.certificados?.[0] || null;
      setCertData(cert);
    } catch (e) {
      setCertData(null);
    } finally {
      setLoadingCert(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setCertData(null);
    } else {
      setExpandedId(id);
      loadCertificado(id);
    }
  };

  const openCorrecaoDialog = (sub: Submissao) => {
    setCorrecaoSubmissao(sub);
    setCorrecaoObs('');
    setCorrecaoDialog(true);
  };

  const openApproveDialog = (sub: Submissao) => {
    setApproveSubmissao(sub);
    setApproveHoras(sub.horas_solicitadas || sub.carga_horaria_solicitada || 0);
    setApproveDialog(true);
  };

  const handleCorrecao = async () => {
    if (!correcaoSubmissao || !correcaoObs.trim()) {
      toastError('Observação é obrigatória para solicitar correção.');
      return;
    }
    try {
      await apiFetch(`/api/submissoes/${correcaoSubmissao.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'correcao', observacao: correcaoObs }),
      });
      toastSuccess('Correção solicitada com sucesso!');
      setCorrecaoDialog(false);
      setCorrecaoSubmissao(null);
      setCorrecaoObs('');
      await loadSubmissoes();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao solicitar correção.');
    }
  };

  const filteredSubmissoes = submissoes.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (cursoFilter !== 'all' && s.curso_nome !== cursoFilter) return false;
    return true;
  });

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)' },
    aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)' },
    reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)' },
    correcao: { bg: 'hsla(45, 95%, 50%, 0.12)', text: 'hsl(45, 95%, 55%)', border: 'hsla(45, 95%, 50%, 0.3)' },
  };

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger style={{ ...inputStyle, width: 150 }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovado">Aprovadas</SelectItem>
            <SelectItem value="reprovado">Reprovadas</SelectItem>
            <SelectItem value="correcao">Correção</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cursoFilter} onValueChange={setCursoFilter}>
          <SelectTrigger style={{ ...inputStyle, width: 200 }}>
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {cursos.map(c => (
              <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead style={{ background: colors.tableHeaderBg }}>
              <tr>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Aluno</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Área</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Horas</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Status</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissoes.map(sub => {
                const sc = statusColors[sub.status] || statusColors.pendente;
                const isExpanded = expandedId === sub.id;
                return (
                  <React.Fragment key={sub.id}>
                    <tr className="border-b" style={{ borderColor: colors.cardBorder }}>
                      <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{sub.aluno_nome}</td>
                      <td className="px-5 py-4" style={{ color: colors.labelColor }}>{sub.curso_nome}</td>
                      <td className="px-5 py-4" style={{ color: colors.labelColor }}>{sub.area}</td>
                      <td className="px-5 py-4" style={{ color: accentBlue }}>
                        {sub.horas_solicitadas || sub.carga_horaria_solicitada || 0}h
                      </td>
                      <td className="px-5 py-4">
                        <Badge style={{ background: sc.bg, color: sc.text }}>{sub.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleExpand(sub.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            background: isExpanded ? `${accentBlue}22` : 'transparent',
                            border: `1px solid ${isExpanded ? accentBlue : 'transparent'}`,
                            color: isExpanded ? accentBlue : colors.labelColor,
                          }}
                          title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-8 py-6 bg-black/20">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="mb-2" style={{ color: colors.textPrimary }}>
                                Descrição: {sub.descricao || '-'}
                              </p>
                              {(sub.status === 'pendente' || sub.status === 'correcao') ? (
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    onClick={() => handleStatusChange(sub.id, 'reprovado')}
                                    style={{ background: 'hsla(0, 72%, 50%, 0.2)', color: 'hsl(0, 72%, 60%)' }}
                                  >
                                    <X className="h-4 w-4 mr-2" /> Reprovar
                                  </Button>
                                  <Button
                                    onClick={() => openCorrecaoDialog(sub)}
                                    style={{ background: 'hsla(45, 95%, 50%, 0.2)', color: 'hsl(45, 95%, 55%)' }}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" /> Correção
                                  </Button>
                                  <Button
                                    onClick={() => openApproveDialog(sub)}
                                    style={{ background: 'hsla(152, 60%, 40%, 0.2)', color: 'hsl(152, 60%, 55%)' }}
                                  >
                                    <Check className="h-4 w-4 mr-2" /> Aprovar
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-sm" style={{ color: colors.labelColor }}>
                                  {sub.status === 'aprovado'
                                    ? `Aprovado em ${sub.data_validacao ? new Date(sub.data_validacao).toLocaleDateString() : '—'}`
                                    : `Reprovado em ${sub.data_validacao ? new Date(sub.data_validacao).toLocaleDateString() : '—'}`
                                  }
                                </p>
                              )}
                            </div>
                            <div>
                              {loadingCert ? (
                                <p style={{ color: colors.textPrimary }}>Carregando certificado...</p>
                              ) : certData?.url_arquivo ? (
                                <div className="space-y-3">
                                  <a
                                    href={certData.url_arquivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-colors w-fit"
                                    style={{
                                      background: `${colors.cardBorder}`,
                                      border: `1px solid ${colors.cardBorder}`,
                                      color: colors.textPrimary,
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4" /> Abrir Certificado
                                  </a>
                                  {certData.texto_extraido && (
                                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                      <p className="text-[10px] uppercase text-slate-500 mb-1">OCR Extraído</p>
                                      <p className="text-xs text-slate-400 leading-relaxed max-h-32 overflow-y-auto">
                                        {certData.texto_extraido}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400">Certificado não disponível</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog: Solicitar Correção */}
      <Dialog open={correcaoDialog} onOpenChange={setCorrecaoDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Solicitar Correção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.labelColor }}>
              Aluno: <span style={{ color: colors.textPrimary }}>{correcaoSubmissao?.aluno_nome}</span>
            </p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>
                Observação para o aluno
              </label>
              <Textarea
                placeholder="Descreva o que precisa ser corrigido..."
                value={correcaoObs}
                onChange={e => setCorrecaoObs(e.target.value)}
                rows={4}
                style={inputStyle}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCorrecaoDialog(false)} variant="outline">Cancelar</Button>
            <Button
              onClick={handleCorrecao}
              style={{ background: 'hsl(45, 95%, 50%)', color: 'black' }}
            >
              Solicitar Correção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Aprovar com horas */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Aprovar Submissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.labelColor }}>
              Aluno: <span style={{ color: colors.textPrimary }}>{approveSubmissao?.aluno_nome}</span>
            </p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>
                Horas a aprovar
              </label>
              <Input
                type="number"
                min={1}
                value={approveHoras}
                onChange={e => setApproveHoras(Number(e.target.value))}
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: colors.labelColor }}>
                Solicitado: {approveSubmissao?.horas_solicitadas || approveSubmissao?.carga_horaria_solicitada || 0}h
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setApproveDialog(false)} variant="outline">Cancelar</Button>
            <Button
              onClick={() => {
                if (approveSubmissao) {
                  handleStatusChange(approveSubmissao.id, 'aprovado', approveHoras);
                  setApproveDialog(false);
                }
              }}
              style={{ background: 'hsla(152, 60%, 40%, 0.8)', color: 'hsl(152, 60%, 55%)' }}
            >
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidacaoSection;

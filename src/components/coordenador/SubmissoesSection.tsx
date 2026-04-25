import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';
import { Submissao } from '@/types/coordenador';

interface SubmissoesSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  user: { uid: string };
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const SubmissoesSection: React.FC<SubmissoesSectionProps> = ({
  apiFetch,
  user,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [certificados, setCertificados] = useState<Record<string, any[]>>({});
  const [subFilterCurso, setSubFilterCurso] = useState('all');
  const [subFilterStatus, setSubFilterStatus] = useState('all');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const [correcaoDialog, setCorrecaoDialog] = useState(false);
  const [correcaoSubmissao, setCorrecaoSubmissao] = useState<Submissao | null>(null);
  const [correcaoObs, setCorrecaoObs] = useState('');

  const [approveDialog, setApproveDialog] = useState(false);
  const [approveSubmissao, setApproveSubmissao] = useState<Submissao | null>(null);
  const [approveHoras, setApproveHoras] = useState(0);

  const fetchSubmissoes = useCallback(async () => {
    try {
      const [subsData, usuariosData, regrasData, cursosData] = await Promise.all([
        apiFetch('/api/submissoes'),
        apiFetch('/api/usuarios'),
        apiFetch('/api/regras'),
        apiFetch('/api/cursos'),
      ]);

      const raw = Array.isArray(subsData) ? subsData : subsData.submissoes || subsData.data || [];

      const usuariosMap = new Map<string, string>();
      (Array.isArray(usuariosData) ? usuariosData : (usuariosData.usuarios || [])).forEach((u: any) => {
        usuariosMap.set(u.id, u.nome);
      });

      const regrasMap = new Map<string, { area: string; curso_id: string }>();
      (Array.isArray(regrasData) ? regrasData : (regrasData.regras || [])).forEach((r: any) => {
        regrasMap.set(r.id, { area: r.area, curso_id: r.curso_id });
      });

      const cursosMap = new Map<string, string>();
      (Array.isArray(cursosData) ? cursosData : (cursosData.cursos || [])).forEach((c: any) => {
        cursosMap.set(c.id, c.nome);
      });

      const mapped = raw.map((s: any) => {
        const regra = regrasMap.get(s.regra_id);
        return {
          id: s.id,
          aluno_id: s.aluno_id || s.userId || s.usuario_id || '',
          aluno_nome: s.aluno_nome || s.nome_aluno || s.aluno?.nome || s.usuario?.nome || usuariosMap.get(s.aluno_id) || '—',
          curso_nome: s.curso_nome || s.nome_curso || s.curso?.nome || (regra ? cursosMap.get(regra.curso_id) : '—') || '—',
          area: s.area || s.area_atividade || s.categoria || (regra ? regra.area : '—') || '—',
          horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
          status: s.status || 'pendente',
          data_envio: s.data_envio || s.created_at || s.dataCriacao || new Date().toISOString(),
          data_validacao: s.data_validacao || s.updated_at || s.dataAtualizacao,
          descricao: s.descricao || s.description || '',
          observacao: s.observacao || s.observacoes || '',
        };
      });

      setSubmissoes(mapped);
      setCursos(Array.isArray(cursosData) ? cursosData : (cursosData.cursos || []));
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar submissões.');
    }
  }, [apiFetch, toastError]);

  const fetchCertificados = useCallback(async (submissaoId: string) => {
    try {
      const data = await apiFetch(`/api/certificados?submissao_id=${submissaoId}`);
      setCertificados(prev => ({ ...prev, [submissaoId]: Array.isArray(data) ? data : data.certificados || [] }));
    } catch { /* silent */ }
  }, [apiFetch]);

  React.useEffect(() => {
    fetchSubmissoes();
  }, [fetchSubmissoes]);

  const handleDecision = async (id: string, status: 'aprovado' | 'reprovado' | 'correcao', observacao?: string, horasAprovadas?: number) => {
    setIsActionLoading(id);
    try {
      const body: any = { status, coordenador_id: user?.uid };
      if (status === 'correcao' && observacao) body.observacao = observacao;
      if (status === 'aprovado' && horasAprovadas !== undefined) body.horas_aprovadas = horasAprovadas;

      await apiFetch(`/api/submissoes/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

      const statusLabels = { aprovado: 'aprovada', reprovado: 'reprovada', correcao: 'enviada para correção' };
      toastSuccess(`Submissão ${statusLabels[status]}!`);
      setSubmissoes(prev => prev.map(s => s.id === id ? { ...s, status: status as any, observacao } : s));
      await fetchSubmissoes();
      setCorrecaoDialog(false);
      setCorrecaoSubmissao(null);
      setCorrecaoObs('');
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao processar decisão.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const openCorrecaoDialog = (submissao: Submissao) => {
    setCorrecaoSubmissao(submissao);
    setCorrecaoObs('');
    setCorrecaoDialog(true);
  };

  const openApproveDialog = (submissao: Submissao) => {
    setApproveSubmissao(submissao);
    setApproveHoras(submissao.horas_solicitadas || 0);
    setApproveDialog(true);
  };

  const statusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)', icon: CheckCircle2 },
      reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)', icon: XCircle },
      pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)', icon: Clock },
      correcao: { bg: 'hsla(45, 95%, 50%, 0.12)', text: 'hsl(45, 95%, 55%)', border: 'hsla(45, 95%, 50%, 0.3)', icon: AlertTriangle },
    };
    const config = configs[status] || configs.pendente;
    const Icon = config.icon;
    return (
      <Badge style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'correcao' ? 'Correção' : status}
      </Badge>
    );
  };

  const filteredSubs = submissoes.filter(s =>
    (subFilterCurso === 'all' || s.curso_nome === subFilterCurso) &&
    (subFilterStatus === 'all' || s.status === subFilterStatus)
  );

  const inputStyle = { background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={subFilterCurso} onValueChange={setSubFilterCurso}>
          <SelectTrigger className="w-48" style={inputStyle}>
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cursos</SelectItem>
            {cursos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subFilterStatus} onValueChange={setSubFilterStatus}>
          <SelectTrigger className="w-48" style={inputStyle}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="reprovado">Reprovado</SelectItem>
            <SelectItem value="correcao">Correção</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
        <table className="w-full text-left min-w-[600px]">
          <thead style={{ background: colors.sidebarBg }}>
            <tr className="text-[10px] uppercase tracking-widest">
              <th className="px-6 py-4" style={{ color: accentOrange }}>Aluno</th>
              <th className="px-6 py-4" style={{ color: accentOrange }}>Curso</th>
              <th className="px-6 py-4" style={{ color: accentOrange }}>Horas</th>
              <th className="px-6 py-4" style={{ color: accentOrange }}>Status</th>
              <th className="px-6 py-4 text-right" style={{ color: accentOrange }}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
            {filteredSubs.map((s) => (
              <React.Fragment key={s.id}>
                <tr className="hover:opacity-80 transition-all">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                    <p className="text-[10px] font-mono" style={{ color: colors.labelColor }}>{new Date(s.data_envio).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{s.curso_nome}</td>
                  <td className="px-6 py-4 text-sm font-mono" style={{ color: accentOrange }}>{s.horas_solicitadas}h</td>
                  <td className="px-6 py-4">{statusBadge(s.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setExpandedSub(expandedSub === s.id ? null : s.id); if (expandedSub !== s.id) fetchCertificados(s.id); }} className="p-2 transition-colors" style={{ color: colors.labelColor }}>
                      {expandedSub === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
                {expandedSub === s.id && (
                  <tr>
                    <td colSpan={5} className="px-8 py-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-xs font-display uppercase opacity-50">Detalhes do Certificado</h4>
                          {certificados[s.id]?.map(cert => (
                            <div key={cert.id} className="p-4 rounded-xl border space-y-3" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-mono truncate" style={{ color: colors.textPrimary }}>{cert.nome_arquivo}</p>
                                <a href={cert.url_arquivo} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline text-xs flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" /> Ver PDF
                                </a>
                              </div>
                              {cert.texto_extraido && (
                                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                  <p className="text-[10px] uppercase opacity-50 mb-2">OCR - Texto Extraído</p>
                                  <p className="text-[11px] leading-relaxed max-h-32 overflow-y-auto" style={{ color: colors.textSecondary }}>{cert.texto_extraido}</p>
                                </div>
                              )}
                            </div>
                          ))}
                          {!certificados[s.id]?.length && <p className="text-xs opacity-50">Nenhum certificado anexado.</p>}
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-xs font-display uppercase opacity-50">Tomar Decisão</h4>
                          <p className="text-sm italic" style={{ color: colors.textSecondary }}>"{s.descricao || 'Sem descrição.'}"</p>
                          {s.status === 'correcao' && s.observacao && (
                            <div className="p-3 rounded-lg border" style={{ background: 'hsla(45, 95%, 50%, 0.1)', borderColor: 'hsla(45, 95%, 50%, 0.3)' }}>
                              <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(45, 95%, 55%)' }}>Observação do Coordenador</p>
                              <p className="text-sm" style={{ color: colors.textPrimary }}>{s.observacao}</p>
                            </div>
                          )}
                          {(s.status === 'pendente' || s.status === 'correcao') ? (
                            <div className="flex flex-wrap gap-3 pt-4">
                              <Button disabled={isActionLoading === s.id} onClick={() => openApproveDialog(s)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                {isActionLoading === s.id ? <Loader2 className="animate-spin mr-2" /> : null}
                                APROVAR HORAS
                              </Button>
                              <Button disabled={isActionLoading === s.id} variant="outline" onClick={() => openCorrecaoDialog(s)} style={{ borderColor: 'hsl(45, 95%, 50%)', color: 'hsl(45, 95%, 55%)' }}>
                                CORREÇÃO
                              </Button>
                              <Button disabled={isActionLoading === s.id} variant="outline" onClick={() => handleDecision(s.id, 'reprovado')} style={{ borderColor: 'hsl(0, 72%, 50%)', color: 'hsl(0, 72%, 60%)' }}>
                                REPROVAR
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm pt-4" style={{ color: colors.labelColor }}>
                              {s.status === 'aprovado'
                                ? `Aprovado em ${s.data_validacao ? new Date(s.data_validacao).toLocaleDateString() : '—'}`
                                : `Reprovado em ${s.data_validacao ? new Date(s.data_validacao).toLocaleDateString() : '—'}`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Correção */}
      <Dialog open={correcaoDialog} onOpenChange={setCorrecaoDialog}>
        <DialogContent style={{ background: colors.panelBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Solicitar Correção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Descreva o que precisa ser corrigido na submissão de <strong>{correcaoSubmissao?.aluno_nome}</strong>.
            </p>
            <Textarea placeholder="Observação obrigatória..." value={correcaoObs} onChange={e => setCorrecaoObs(e.target.value)} style={inputStyle} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrecaoDialog(false)}>Cancelar</Button>
            <Button onClick={() => correcaoSubmissao && handleDecision(correcaoSubmissao.id, 'correcao', correcaoObs)} disabled={!correcaoObs.trim() || isActionLoading === correcaoSubmissao?.id} style={{ background: 'hsl(45, 95%, 50%)', color: 'black' }}>
              {isActionLoading === correcaoSubmissao?.id ? <Loader2 className="animate-spin mr-2" /> : null}
              Enviar para Correção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Aprovar com horas */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent style={{ background: colors.panelBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Aprovar Submissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Aluno: <strong>{approveSubmissao?.aluno_nome}</strong>
            </p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Horas a aprovar</label>
              <Input type="number" min={1} value={approveHoras} onChange={e => setApproveHoras(Number(e.target.value))} style={inputStyle} />
              <p className="text-xs mt-1" style={{ color: colors.labelColor }}>Solicitado: {approveSubmissao?.horas_solicitadas || 0}h</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>Cancelar</Button>
            <Button onClick={() => { if (approveSubmissao) { handleDecision(approveSubmissao.id, 'aprovado', undefined, approveHoras); setApproveDialog(false); } }} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissoesSection;

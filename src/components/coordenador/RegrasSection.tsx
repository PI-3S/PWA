import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, BookOpen, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAppTheme } from '@/hooks/useapptheme';
import { RegraAtividade, CATEGORIAS_ATIVIDADE, TIPOS_DOCUMENTO, CategoriaAtividade } from '@/types/coordenador';

interface RegrasSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  user: { uid: string };
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentOrange: string;
  accentBlue: string;
}

const RegrasSection: React.FC<RegrasSectionProps> = ({
  apiFetch,
  user,
  colors,
  toastSuccess,
  toastError,
  accentOrange,
  accentBlue,
}) => {
  const [regras, setRegras] = useState<RegraAtividade[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);
  const [cursosAcessiveis, setCursosAcessiveis] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros
  const [filterCurso, setFilterCurso] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState<CategoriaAtividade | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [regraEditando, setRegraEditando] = useState<RegraAtividade | null>(null);

  // Form
  const [formData, setFormData] = useState<Partial<RegraAtividade>>({
    nome: '',
    categoria: 'ensino',
    descricao: '',
    horas_maximas: 10,
    requisitos_obrigatorios: '',
    tipo_documento: 'pdf_imagem',
    observacoes: '',
    ativo: true,
    curso_id: '',
  });

  const inputStyle = { background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` };

  const fetchCursos = useCallback(async () => {
    try {
      const data = await apiFetch('/api/cursos');
      const list = Array.isArray(data) ? data : data.cursos || [];
      setCursos(list);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError('Erro ao carregar cursos.');
    }
  }, [apiFetch, toastError]);

  const fetchCursosAcessiveis = useCallback(async () => {
    try {
      const data = await apiFetch('/api/coordenadores-cursos');
      const vinculos = Array.isArray(data) ? data : data.vinculos || [];
      const cursoIds = new Set(vinculos.map((v: any) => v.curso_id));
      setCursosAcessiveis(cursoIds);
    } catch (e: any) {
      // Se der erro, assume que não tem acesso a nenhum curso
      console.error('Erro ao buscar cursos acessíveis:', e);
      setCursosAcessiveis(new Set());
    }
  }, [apiFetch]);

  const fetchRegras = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/regras');
      const list = Array.isArray(data) ? data : data.regras || [];

      // Normalizar dados para garantir compatibilidade entre formatos antigo e novo
      const normalizedList = list.map((r: any) => ({
        ...r,
        // Mapear campos do formato antigo para o novo
        categoria: r.categoria || r.area || 'ensino',
        horas_maximas: r.horas_maximas || r.limite_horas || 10,
        nome: r.nome || r.area || 'Sem nome',
        descricao: r.descricao || '',
        requisitos_obrigatorios: r.requisitos_obrigatorios || '',
        tipo_documento: r.tipo_documento || 'pdf_imagem',
        observacoes: r.observacoes || '',
        ativo: r.ativo !== undefined ? r.ativo : true,
      }));

      setRegras(normalizedList);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError('Erro ao carregar regras.');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, toastError]);

  useEffect(() => {
    fetchCursos();
    fetchRegras();
  }, [fetchCursos, fetchRegras]);

  const openCreateDialog = () => {
    setEditMode(false);
    setRegraEditando(null);
    setFormData({
      nome: '',
      categoria: 'ensino',
      descricao: '',
      horas_maximas: 10,
      requisitos_obrigatorios: '',
      tipo_documento: 'pdf_imagem',
      observacoes: '',
      ativo: true,
      curso_id: cursos.length > 0 ? cursos[0].id : '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (regra: RegraAtividade) => {
    setEditMode(true);
    setRegraEditando(regra);

    // Normalizar dados antes de editar
    const normalizedData = {
      ...regra,
      categoria: regra.categoria || regra.area || 'ensino',
      horas_maximas: regra.horas_maximas || regra.limite_horas || 10,
      nome: regra.nome || regra.area || '',
      descricao: regra.descricao || '',
      requisitos_obrigatorios: regra.requisitos_obrigatorios || '',
      tipo_documento: regra.tipo_documento || 'pdf_imagem',
      observacoes: regra.observacoes || '',
      ativo: regra.ativo !== undefined ? regra.ativo : true,
    };

    setFormData(normalizedData);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.curso_id) {
      toastError('Preencha os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      if (editMode && regraEditando?.id) {
        await apiFetch(`/api/regras/${regraEditando.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
        toastSuccess('Regra atualizada com sucesso!');
      } else {
        await apiFetch('/api/regras', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toastSuccess('Regra criada com sucesso!');
      }
      setDialogOpen(false);
      fetchRegras();
    } catch (e: any) {
      toastError(e.message || 'Erro ao salvar regra.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      await apiFetch(`/api/regras/${id}`, { method: 'DELETE' });
      toastSuccess('Regra excluída com sucesso!');
      fetchRegras();
    } catch (e: any) {
      toastError(e.message || 'Erro ao excluir regra.');
    }
  };

  const handleToggleStatus = async (regra: RegraAtividade) => {
    try {
      await apiFetch(`/api/regras/${regra.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !regra.ativo }),
      });
      toastSuccess(`Regra ${regra.ativo ? 'desativada' : 'ativada'} com sucesso!`);
      fetchRegras();
    } catch (e: any) {
      toastError(e.message || 'Erro ao alterar status.');
    }
  };

  const filteredRegras = regras.filter(r => {
    const matchCurso = filterCurso === 'all' || r.curso_id === filterCurso;
    const matchCategoria = filterCategoria === 'all' || r.categoria === filterCategoria;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'ativo' && r.ativo) ||
      (filterStatus === 'inativo' && !r.ativo);
    const matchSearch = searchTerm === '' ||
      (r.nome && r.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.descricao && r.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchCurso && matchCategoria && matchStatus && matchSearch;
  });

  const categoriaBadge = (categoria?: CategoriaAtividade | string | null) => {
    if (!categoria) return null;

    const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
      ensino: { bg: 'hsla(210, 80%, 50%, 0.12)', text: 'hsl(210, 80%, 60%)', border: 'hsla(210, 80%, 50%, 0.3)' },
      pesquisa: { bg: 'hsla(280, 70%, 50%, 0.12)', text: 'hsl(280, 70%, 60%)', border: 'hsla(280, 70%, 50%, 0.3)' },
      extensao: { bg: 'hsla(160, 70%, 50%, 0.12)', text: 'hsl(160, 70%, 60%)', border: 'hsla(160, 70%, 50%, 0.3)' },
    };

    const config = badgeColors[categoria] || badgeColors['ensino'];
    const label = categoria === 'ensino' ? 'Ensino' : categoria === 'pesquisa' ? 'Pesquisa' : 'Extensão';

    // Verificação extra para garantir que config existe
    if (!config) return null;

    return (
      <Badge style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5" style={{ color: accentOrange }} />
          <h2 className="text-lg font-bold" style={{ color: colors.titleColor }}>
            Regras de Atividades Complementares
          </h2>
        </div>
        <Button onClick={openCreateDialog} className="bg-orange-600 hover:bg-orange-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: colors.labelColor }} />
            <Input
              placeholder="Buscar regra..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        <Select value={filterCurso} onValueChange={setFilterCurso}>
          <SelectTrigger className="w-48" style={inputStyle}>
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cursos</SelectItem>
            {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategoria} onValueChange={(v: any) => setFilterCategoria(v)}>
          <SelectTrigger className="w-48" style={inputStyle}>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {CATEGORIAS_ATIVIDADE.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-48" style={inputStyle}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Regras */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentOrange }} />
        </div>
      ) : filteredRegras.length === 0 ? (
        <div className="text-center py-12" style={{ color: colors.labelColor }}>
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma regra encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRegras.map((regra) => (
            <div
              key={regra.id}
              className={`p-5 rounded-xl border transition-all ${!regra.ativo ? 'opacity-60' : ''}`}
              style={{
                background: colors.cardBg,
                borderColor: regra.ativo ? colors.cardBorder : 'hsla(0, 70%, 50%, 0.3)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-lg" style={{ color: colors.titleColor }}>
                      {regra.nome || 'Sem nome'}
                    </h3>
                    {categoriaBadge(regra.categoria)}
                    {!regra.ativo && (
                      <Badge style={{ background: 'hsla(0, 70%, 50%, 0.12)', color: 'hsl(0, 70%, 60%)', border: '1px solid hsla(0, 70%, 50%, 0.3)' }}>
                        Inativo
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {regra.descricao || 'Sem descrição'}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase mb-1" style={{ color: colors.labelColor }}>Horas Máximas</p>
                      <p className="font-bold" style={{ color: accentOrange }}>{regra.horas_maximas || 0}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase mb-1" style={{ color: colors.labelColor }}>Tipo de Documento</p>
                      <p style={{ color: colors.textPrimary }}>
                        {regra.tipo_documento ? (TIPOS_DOCUMENTO.find(t => t.value === regra.tipo_documento)?.label || regra.tipo_documento) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase mb-1" style={{ color: colors.labelColor }}>Curso</p>
                      <p style={{ color: colors.textPrimary }}>{regra.curso_nome || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase mb-1" style={{ color: colors.labelColor }}>Status</p>
                      <p style={{ color: regra.ativo ? 'hsl(160, 70%, 55%)' : 'hsl(0, 70%, 60%)' }}>
                        {regra.ativo ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>

                  {regra.requisitos_obrigatorios && (
                    <div className="p-3 rounded-lg" style={{ background: 'hsla(210, 80%, 50%, 0.08)', border: '1px solid hsla(210, 80%, 50%, 0.2)' }}>
                      <p className="text-[10px] uppercase font-bold mb-1" style={{ color: accentBlue }}>Requisitos Obrigatórios</p>
                      <p className="text-sm" style={{ color: colors.textPrimary }}>{regra.requisitos_obrigatorios}</p>
                    </div>
                  )}

                  {regra.observacoes && (
                    <div className="p-3 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.08)', border: '1px solid hsla(45, 95%, 50%, 0.2)' }}>
                      <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(45, 95%, 55%)' }}>Observações</p>
                      <p className="text-sm" style={{ color: colors.textPrimary }}>{regra.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(regra)}
                    style={{ borderColor: colors.cardBorder }}
                    title={regra.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {regra.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(regra)}
                    style={{ borderColor: colors.cardBorder }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regra.id && handleDelete(regra.id)}
                    style={{ borderColor: 'hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 60%)' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>
              {editMode ? 'Editar Regra' : 'Nova Regra de Atividade Complementar'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Nome da Atividade *</label>
                <Input
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Participação em pesquisa"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Categoria *</label>
                <Select
                  value={formData.categoria}
                  onValueChange={(v: CategoriaAtividade) => setFormData({ ...formData, categoria: v })}
                >
                  <SelectTrigger style={inputStyle}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_ATIVIDADE.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Descrição *</label>
              <Textarea
                value={formData.descricao}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva detalhadamente a atividade..."
                style={inputStyle}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Horas Máximas *</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.horas_maximas}
                  onChange={e => setFormData({ ...formData, horas_maximas: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Tipo de Documento *</label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(v: any) => setFormData({ ...formData, tipo_documento: v })}
                >
                  <SelectTrigger style={inputStyle}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_DOCUMENTO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Requisitos Obrigatórios *</label>
              <Textarea
                value={formData.requisitos_obrigatorios}
                onChange={e => setFormData({ ...formData, requisitos_obrigatorios: e.target.value })}
                placeholder="Liste os documentos e requisitos necessários..."
                style={inputStyle}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Curso *</label>
              <Select
                value={formData.curso_id}
                onValueChange={v => setFormData({ ...formData, curso_id: v })}
              >
                <SelectTrigger style={inputStyle}>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Observações (opcional)</label>
              <Textarea
                value={formData.observacoes}
                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais..."
                style={inputStyle}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'hsla(160, 70%, 50%, 0.08)', border: '1px solid hsla(160, 70%, 50%, 0.2)' }}>
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="ativo" className="text-sm" style={{ color: colors.textPrimary }}>
                Regra ativa (disponível para alunos)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: colors.cardBorder }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
              {editMode ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegrasSection;
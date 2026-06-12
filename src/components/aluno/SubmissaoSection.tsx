import React, { useState, useCallback, useEffect } from 'react';
import { Send, Upload, ChevronRight, CloudUpload, AlertTriangle, Loader2, Info, FileText, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';
import { Regra, Submissao } from '@/types/aluno';
import OcrPreview from './OcrPreview';

interface SubmissaoSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  apiBase: string;
  token: string;
  regras: Regra[];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  onSuccess: () => void;
  onCancelEdit?: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
  accentGreen: string;
  submissaoParaEditar?: Submissao | null;
}

const SubmissaoSection: React.FC<SubmissaoSectionProps> = ({
  apiFetch,
  apiBase,
  token,
  regras,
  toastSuccess,
  toastError,
  onSuccess,
  onCancelEdit,
  colors,
  accentGreen,
  submissaoParaEditar,
}) => {
  const [step, setStep] = useState(1);
  const [subForm, setSubForm] = useState({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
  const [createdSubId, setCreatedSubId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [regraSelecionada, setRegraSelecionada] = useState<Regra | null>(null);
  const [ocrData, setOcrData] = useState<{ texto_extraido: string; dados_ocr: any; url_arquivo: string } | null>(null);
  const [certificadoId, setCertificadoId] = useState('');

  // Carregar dados da submissão para edição
  useEffect(() => {
    if (submissaoParaEditar) {
      setIsEditMode(true);
      setCreatedSubId(submissaoParaEditar.id);
      setSubForm({
        regra_id: submissaoParaEditar.regra_id || '',
        carga_horaria_solicitada: String(submissaoParaEditar.horas_solicitadas || ''),
        tipo: submissaoParaEditar.tipo || '',
        descricao: submissaoParaEditar.descricao || '',
      });
      setStep(2); // Vai direto para o passo de upload
    } else {
      setIsEditMode(false);
      setSubForm({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
      setCreatedSubId('');
      setFile(null);
      setStep(1);
    }
  }, [submissaoParaEditar]);

  // Atualizar regra selecionada quando mudar o regra_id
  useEffect(() => {
    if (subForm.regra_id) {
      const regra = regras.find(r => r.id === subForm.regra_id);
      setRegraSelecionada(regra || null);
    } else {
      setRegraSelecionada(null);
    }
  }, [subForm.regra_id, regras]);

  const inputStyle = { background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` };

  const handleStep1 = async () => {
    if (!subForm.regra_id || !subForm.carga_horaria_solicitada || !subForm.tipo) {
      toastError('Preencha os campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/submissoes', {
        method: 'POST',
        body: JSON.stringify({
          regra_id: subForm.regra_id,
          tipo: subForm.tipo,
          descricao: subForm.descricao,
          carga_horaria_solicitada: Number(subForm.carga_horaria_solicitada),
        }),
      });
      if (data.id) {
        setCreatedSubId(data.id);
        setStep(2);
        toastSuccess('Informações salvas! Agora envie o arquivo.');
      } else {
        toastError(data.error || data.mensagem || 'Erro ao processar envio.');
      }
    } catch {
      toastError('Falha na comunicação com o servidor.');
    }
    setSubmitting(false);
  };

  const handleUpload = async () => {
    if (!file) { toastError('Selecione um arquivo.'); return; }
    if (file.size > 4 * 1024 * 1024) { toastError('Arquivo muito grande (máximo 4MB).'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('submissao_id', createdSubId);
      fd.append('arquivo', file);
      const res = await fetch(`${apiBase}/api/certificados`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setCertificadoId(data.id);
        setOcrData({
          texto_extraido: data.texto_extraido || '',
          dados_ocr: data.dados_ocr || null,
          url_arquivo: data.url_arquivo || '',
        });
        setStep(3); // Vai para o passo de preview do OCR
      } else {
        const err = await res.json().catch(() => ({}));
        toastError(err.mensagem || err.error || 'Erro ao enviar arquivo.');
      }
    } catch (err: any) {
      toastError(err.message || 'Erro na conexão de rede.');
    }
    setSubmitting(false);
  };

  const handleConfirmSubmission = async () => {
    setSubmitting(true);
    try {
      // Se estiver em modo de edição, atualiza o status da submissão para pendente
      if (isEditMode) {
        await apiFetch(`/api/submissoes/${createdSubId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'pendente' }),
        });
      }
      toastSuccess(isEditMode ? 'Correção enviada! Aguarde a avaliação.' : 'Certificado enviado! Aguarde a avaliação.');
      setStep(1);
      setSubForm({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
      setFile(null);
      setIsEditMode(false);
      setCreatedSubId('');
      setOcrData(null);
      setCertificadoId('');
      onSuccess();
    } catch (err: any) {
      toastError(err.message || 'Erro ao confirmar submissão.');
    }
    setSubmitting(false);
  };

  const handleCancelPreview = async () => {
    // Deleta o certificado se o usuário cancelar
    if (certificadoId) {
      try {
        await fetch(`${apiBase}/api/certificados/${certificadoId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silencioso - não importa se falhar
      }
    }
    setOcrData(null);
    setCertificadoId('');
    setFile(null);
    setStep(2); // Volta para o passo de upload
  };

  return (
    <div className="rounded-xl p-8" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
      {step === 1 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Send className="h-5 w-5" style={{ color: accentGreen }} />
            <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>
              {isEditMode ? 'Corrigir Submissão' : 'Dados da Atividade'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-tighter" style={{ color: colors.labelColor }}>Área de Atuação</label>
              <Select
                value={subForm.regra_id}
                onValueChange={(v) => {
                  const selectedRule = regras.find(r => r.id === v);
                  setSubForm({ ...subForm, regra_id: v, tipo: selectedRule?.area || '' });
                }}
              >
                <SelectTrigger style={inputStyle}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {regras.map(r => <SelectItem key={r.id} value={r.id}>{r.area}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Horas do Certificado</label>
              <Input
                type="number"
                value={subForm.carga_horaria_solicitada}
                onChange={(e) => setSubForm({ ...subForm, carga_horaria_solicitada: e.target.value })}
                style={inputStyle}
                placeholder="Ex: 40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Descrição (opcional)</label>
            <Input
              value={subForm.descricao}
              onChange={(e) => setSubForm({ ...subForm, descricao: e.target.value })}
              style={inputStyle}
              placeholder="Descreva a atividade..."
            />
          </div>

          {/* Informações da Regra Selecionada */}
          {regraSelecionada && (
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'hsla(160, 70%, 50%, 0.08)', border: '1px solid hsla(160, 70%, 50%, 0.2)' }}>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" style={{ color: accentGreen }} />
                <h3 className="text-sm font-bold uppercase" style={{ color: accentGreen }}>Informações da Atividade</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: colors.labelColor }} />
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: colors.labelColor }}>Atividade</p>
                    <p style={{ color: colors.textPrimary }}>{regraSelecionada.nome || regraSelecionada.area}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: colors.labelColor }} />
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: colors.labelColor }}>Horas Máximas</p>
                    <p className="font-bold" style={{ color: accentGreen }}>{regraSelecionada.limite_horas || regraSelecionada.horas_maximas}h</p>
                  </div>
                </div>
              </div>

              {regraSelecionada.descricao && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-[10px] uppercase mb-1" style={{ color: colors.labelColor }}>Descrição</p>
                  <p className="text-sm" style={{ color: colors.textPrimary }}>{regraSelecionada.descricao}</p>
                </div>
              )}

              {regraSelecionada.requisitos_obrigatorios && (
                <div className="p-3 rounded-lg" style={{ background: 'hsla(210, 80%, 50%, 0.1)', border: '1px solid hsla(210, 80%, 50%, 0.2)' }}>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'hsl(210, 80%, 60%)' }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(210, 80%, 60%)' }}>Requisitos Obrigatórios</p>
                      <p className="text-sm" style={{ color: colors.textPrimary }}>{regraSelecionada.requisitos_obrigatorios}</p>
                    </div>
                  </div>
                </div>
              )}

              {regraSelecionada.observacoes && (
                <div className="p-3 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.2)' }}>
                  <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(45, 95%, 55%)' }}>Observações</p>
                  <p className="text-sm" style={{ color: colors.textPrimary }}>{regraSelecionada.observacoes}</p>
                </div>
              )}

              {regraSelecionada.tipo_documento && (
                <div className="flex items-center gap-2 text-xs" style={{ color: colors.labelColor }}>
                  <span>Tipo de documento aceito:</span>
                  <span className="px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.2)', color: colors.textPrimary }}>
                    {regraSelecionada.tipo_documento === 'pdf' ? 'PDF' :
                     regraSelecionada.tipo_documento === 'imagem' ? 'Imagem (JPG/PNG)' :
                     regraSelecionada.tipo_documento === 'pdf_imagem' ? 'PDF ou Imagem' :
                     regraSelecionada.tipo_documento}
                  </span>
                </div>
              )}
            </div>
          )}

          {!isEditMode && (
            <Button
              onClick={handleStep1}
              disabled={submitting}
              className="w-full hover:opacity-90 transition-opacity" style={{ background: accentGreen, color: 'white' }}
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              Próximo Passo
            </Button>
          )}
        </div>
      ) : step === 2 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Upload className="h-5 w-5" style={{ color: accentGreen }} />
            <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>
              {isEditMode ? 'Enviar Certificado Corrigido' : 'Enviar Certificado'}
            </h2>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.3)' }}>
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'hsl(45, 95%, 55%)' }} />
            <p className="text-xs" style={{ color: 'hsl(45, 95%, 70%)' }}>
              Tamanho máximo do arquivo: <strong>4 MB</strong>. Formatos aceitos: PDF, JPG, PNG.
            </p>
          </div>

          <div
            className="relative p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer"
            style={{ borderColor: dragActive ? accentGreen : colors.inputBorder, background: colors.inputBg }}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile) setFile(droppedFile);
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <CloudUpload className="h-12 w-12 mx-auto mb-4" style={{ color: file ? accentGreen : 'hsl(160, 70%, 40%)' }} />
            {file ? (
              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: accentGreen }}>
                  ✓ Arquivo selecionado
                </p>
                <p className="text-xs" style={{ color: colors.textPrimary }}>
                  {file.name}
                </p>
                <p className="text-[10px]" style={{ color: colors.labelColor }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textPrimary }}>
                  Arraste o arquivo aqui ou clique para selecionar
                </p>
                <p className="text-xs" style={{ color: colors.labelColor }}>
                  PDF, JPG ou PNG (máx. 4 MB)
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="flex justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs underline"
                style={{ color: colors.labelColor }}
              >
                Remover arquivo e selecionar outro
              </button>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            {isEditMode && onCancelEdit && (
              <Button
                onClick={onCancelEdit}
                variant="outline"
                className="flex-1"
                style={{ borderColor: colors.cardBorder, color: colors.labelColor }}
              >
                Cancelar
              </Button>
            )}
            <Button
              onClick={handleUpload}
              disabled={submitting || !file}
              className="flex-1 hover:opacity-90 transition-opacity" style={{ background: accentGreen, color: 'white' }}
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Analisar Certificado
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-5 w-5" style={{ color: accentGreen }} />
            <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>
              Verificar Dados Extraídos
            </h2>
          </div>

          {ocrData && (
            <OcrPreview
              textoExtraido={ocrData.texto_extraido}
              dadosOcr={ocrData.dados_ocr}
              urlArquivo={ocrData.url_arquivo}
              colors={colors}
              accentGreen={accentGreen}
              onSave={(dadosCorrigidos) => {
                // Atualiza os dados do OCR com as correções
                setOcrData({ ...ocrData, dados_ocr: dadosCorrigidos });
              }}
              onCancel={handleCancelPreview}
              showSaveButton={false}
            />
          )}

          <div className="flex gap-4 pt-2">
            <Button
              onClick={handleCancelPreview}
              variant="outline"
              className="flex-1"
              style={{ borderColor: colors.cardBorder, color: colors.labelColor }}
            >
              Voltar e Reenviar
            </Button>
            <Button
              onClick={handleConfirmSubmission}
              disabled={submitting}
              className="flex-1 hover:opacity-90 transition-opacity" style={{ background: accentGreen, color: 'white' }}
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Confirmar e Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissaoSection;

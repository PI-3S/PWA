import React, { useState, useCallback } from 'react';
import { Send, Upload, ChevronRight, CloudUpload, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Regra } from '@/types/aluno';

interface SubmissaoSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  apiBase: string;
  token: string;
  regras: Regra[];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  onSuccess: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
  accentGreen: string;
}

const SubmissaoSection: React.FC<SubmissaoSectionProps> = ({
  apiFetch,
  apiBase,
  token,
  regras,
  toastSuccess,
  toastError,
  onSuccess,
  colors,
  accentGreen,
}) => {
  const [step, setStep] = useState(1);
  const [subForm, setSubForm] = useState({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
  const [createdSubId, setCreatedSubId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        toastSuccess('Certificado enviado! Aguarde a avaliação.');
        setStep(1);
        setSubForm({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
        setFile(null);
        onSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        toastError(err.mensagem || err.error || 'Erro ao enviar arquivo.');
      }
    } catch (err: any) {
      toastError(err.message || 'Erro na conexão de rede.');
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-xl p-8" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
      {step === 1 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Send className="h-5 w-5 text-emerald-400" />
            <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>Dados da Atividade</h2>
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
          <Button
            onClick={handleStep1}
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500"
          >
            {submitting ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            Próximo Passo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Upload className="h-5 w-5 text-emerald-400" />
            <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>Enviar Certificado</h2>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.3)' }}>
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'hsl(45, 95%, 55%)' }} />
            <p className="text-xs" style={{ color: 'hsl(45, 95%, 70%)' }}>
              Tamanho máximo do arquivo: <strong>4 MB</strong>. Formatos aceitos: PDF, JPG, PNG.
            </p>
          </div>

          <div
            className={`relative p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${dragActive ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
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
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1"
              style={{ borderColor: colors.cardBorder, color: colors.labelColor }}
            >
              Voltar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={submitting || !file}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Finalizar Envio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissaoSection;

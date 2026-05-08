import React, { useState } from 'react';
import { FileText, Clock, Calendar, Building, Tag, Check, AlertTriangle, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OcrData } from '@/types/coordenador';

interface OcrPreviewProps {
  textoExtraido: string;
  dadosOcr: OcrData | null;
  urlArquivo: string;
  colors: {
    cardBg: string;
    cardBorder: string;
    inputBg: string;
    inputBorder: string;
    textPrimary: string;
    textSecondary: string;
    labelColor: string;
    titleColor: string;
  };
  accentGreen: string;
  onSave?: (dadosCorrigidos: OcrData) => void;
  onCancel?: () => void;
  showSaveButton?: boolean;
}

const OcrPreview: React.FC<OcrPreviewProps> = ({
  textoExtraido,
  dadosOcr,
  urlArquivo,
  colors,
  accentGreen,
  onSave,
  onCancel,
  showSaveButton = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [dadosCorrigidos, setDadosCorrigidos] = useState<OcrData>(
    dadosOcr || { nome: null, carga_horaria: null, data: null, instituicao: null, tipo: null, confianca: 0 }
  );

  const handleFieldChange = (campo: keyof OcrData, valor: string) => {
    setDadosCorrigidos(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(dadosCorrigidos);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDadosCorrigidos(dadosOcr || { nome: null, carga_horaria: null, data: null, instituicao: null, tipo: null, confianca: 0 });
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 0.8) return 'hsl(152, 60%, 55%)';
    if (confianca >= 0.5) return 'hsl(38, 92%, 60%)';
    return 'hsl(0, 72%, 60%)';
  };

  const getConfiancaLabel = (confianca: number) => {
    if (confianca >= 0.8) return 'Alta';
    if (confianca >= 0.5) return 'Média';
    return 'Baixa';
  };

  const CampoEditavel = ({ label, valor, campo, icon: Icon }: { label: string; valor: string | null; campo: keyof OcrData; icon: any }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color: colors.labelColor }} />
        <label className="text-[10px] uppercase tracking-tighter" style={{ color: colors.labelColor }}>{label}</label>
      </div>
      {isEditing ? (
        <Input
          value={valor || ''}
          onChange={(e) => handleFieldChange(campo, e.target.value)}
          style={{ background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` }}
          className="text-sm"
        />
      ) : (
        <p className="text-sm font-medium" style={{ color: valor ? colors.textPrimary : colors.labelColor }}>
          {valor || <span className="italic opacity-50">Não identificado</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" style={{ color: accentGreen }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: colors.titleColor }}>
            Análise do Certificado
          </h3>
        </div>
        {dadosOcr && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: getConfiancaColor(dadosOcr.confianca) }} />
            <span className="text-xs" style={{ color: getConfiancaColor(dadosOcr.confianca) }}>
              Confiança: {getConfiancaLabel(dadosOcr.confianca)}
            </span>
          </div>
        )}
      </div>

      {/* Alerta de baixa confiança */}
      {dadosOcr && dadosOcr.confianca < 0.5 && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.3)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'hsl(45, 95%, 55%)' }} />
          <div className="space-y-1">
            <p className="text-xs font-bold" style={{ color: 'hsl(45, 95%, 55%)' }}>Confiança baixa na extração</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Alguns campos podem não ter sido identificados corretamente. Verifique e corrija os dados antes de confirmar.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-side view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-tighter" style={{ color: colors.labelColor }}>
              Documento Original
            </p>
            <a
              href={urlArquivo}
              target="_blank"
              rel="noreferrer"
              className="text-xs flex items-center gap-1"
              style={{ color: accentGreen }}
            >
              <Eye className="h-3 w-3" /> Abrir em nova aba
            </a>
          </div>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.cardBorder, background: colors.inputBg }}>
            {urlArquivo.endsWith('.pdf') ? (
              <iframe
                src={urlArquivo}
                className="w-full h-64"
                title="Preview do certificado"
              />
            ) : (
              <img
                src={urlArquivo}
                alt="Preview do certificado"
                className="w-full h-64 object-contain"
              />
            )}
          </div>
        </div>

        {/* Extracted Data */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-tighter" style={{ color: colors.labelColor }}>
              Dados Extraídos
            </p>
            {!isEditing && showSaveButton && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                style={{ color: colors.labelColor }}
              >
                <Edit2 className="h-3 w-3 mr-1" /> Corrigir
              </Button>
            )}
          </div>

          <div className="p-4 rounded-xl space-y-3" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
            <CampoEditavel label="Nome do Participante" valor={dadosCorrigidos.nome} campo="nome" icon={FileText} />
            <CampoEditavel label="Carga Horária" valor={dadosCorrigidos.carga_horaria} campo="carga_horaria" icon={Clock} />
            <CampoEditavel label="Data" valor={dadosCorrigidos.data} campo="data" icon={Calendar} />
            <CampoEditavel label="Instituição" valor={dadosCorrigidos.instituicao} campo="instituicao" icon={Building} />
            <CampoEditavel label="Tipo de Atividade" valor={dadosCorrigidos.tipo} campo="tipo" icon={Tag} />
          </div>

          {/* Raw Text Toggle */}
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center gap-2 text-xs"
            style={{ color: colors.labelColor }}
          >
            {showRawText ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showRawText ? 'Ocultar' : 'Ver'} texto completo extraído
          </button>

          {showRawText && (
            <div className="p-3 rounded-lg max-h-32 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-xs whitespace-pre-wrap" style={{ color: colors.textSecondary }}>
                {textoExtraido}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && showSaveButton && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex-1"
                style={{ borderColor: colors.cardBorder, color: colors.labelColor }}
              >
                <X className="h-3 w-3 mr-1" /> Cancelar
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1"
                style={{ background: accentGreen, color: 'black' }}
              >
                <Save className="h-3 w-3 mr-1" /> Salvar Correções
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrPreview;
import React, { useState, useCallback } from 'react';
import { Settings, Mail, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppTheme } from '@/hooks/useapptheme';

interface ConfiguracoesSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const ConfiguracoesSection: React.FC<ConfiguracoesSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [emailConfig, setEmailConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    ativo: true,
  });

  const [sistemaConfig, setSistemaConfig] = useState({
    nome_sistema: '',
    instituicao: '',
    logo_url: '',
    frontend_url: '',
    cor_primaria: '',
    cor_secundaria: '',
  });

  const [loadingConfig, setLoadingConfig] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const loadEmailConfig = useCallback(async () => {
    try {
      const doc = await apiFetch('/api/configuracoes/email_config');
      if (doc.config) {
        setEmailConfig({
          host: doc.config.host ?? '',
          port: doc.config.port ?? 587,
          secure: doc.config.secure ?? false,
          user: doc.config.user ?? '',
          pass: doc.config.pass ?? '',
          from: doc.config.from ?? '',
          ativo: doc.config.ativo ?? true,
        });
      }
    } catch (e) {
      console.error('Erro ao carregar config de email:', e);
    }
  }, [apiFetch]);

  const loadSistemaConfig = useCallback(async () => {
    try {
      const doc = await apiFetch('/api/configuracoes/sistema_config');
      if (doc.config) {
        setSistemaConfig({
          nome_sistema: doc.config.nome_sistema ?? '',
          instituicao: doc.config.instituicao ?? '',
          logo_url: doc.config.logo_url ?? '',
          frontend_url: doc.config.frontend_url ?? '',
          cor_primaria: doc.config.cor_primaria ?? '',
          cor_secundaria: doc.config.cor_secundaria ?? '',
        });
      }
    } catch (e) {
      console.error('Erro ao carregar config do sistema:', e);
    }
  }, [apiFetch]);

  React.useEffect(() => {
    loadEmailConfig();
    loadSistemaConfig();
  }, [loadEmailConfig, loadSistemaConfig]);

  const saveEmailConfig = async () => {
    setLoadingConfig(true);
    try {
      await apiFetch('/api/configuracoes/email_config', {
        method: 'POST',
        body: JSON.stringify(emailConfig),
      });
      toastSuccess('Configurações de email salvas!');
    } catch (e: any) {
      toastError(e.message || 'Erro ao salvar configurações.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const saveSistemaConfig = async () => {
    setLoadingConfig(true);
    try {
      await apiFetch('/api/configuracoes/sistema_config', {
        method: 'POST',
        body: JSON.stringify(sistemaConfig),
      });
      toastSuccess('Configurações do sistema salvas!');
    } catch (e: any) {
      toastError(e.message || 'Erro ao salvar configurações.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const testEmailConfig = async () => {
    if (!emailConfig.user) {
      toastError('Configure o email remetente primeiro.');
      return;
    }

    setTestingEmail(true);
    try {
      await apiFetch('/api/configuracoes/test-email', {
        method: 'POST',
        body: JSON.stringify({ to: emailConfig.user }),
      });
      toastSuccess('Email de teste enviado! Verifique sua caixa de entrada.');
    } catch (e: any) {
      toastError(e.message || 'Erro ao enviar email de teste.');
    } finally {
      setTestingEmail(false);
    }
  };

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl flex items-center gap-2" style={{ color: colors.textPrimary }}>
        <Settings className="h-5 w-5" />
        Configurações do Sistema
      </h2>

      {/* Configurações de Email */}
      <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
        <h3 className="text-lg mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
          <Mail className="h-5 w-5" style={{ color: accentBlue }} />
          Configurações de Email
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Servidor SMTP</label>
            <Input
              placeholder="smtp.gmail.com"
              value={emailConfig.host}
              onChange={e => setEmailConfig({ ...emailConfig, host: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Porta</label>
            <Input
              type="number"
              placeholder="587"
              value={emailConfig.port}
              onChange={e => setEmailConfig({ ...emailConfig, port: Number(e.target.value) })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Email Remetente</label>
            <Input
              placeholder="senac@exemplo.com"
              value={emailConfig.user}
              onChange={e => setEmailConfig({ ...emailConfig, user: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Senha de App</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={emailConfig.pass}
              onChange={e => setEmailConfig({ ...emailConfig, pass: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Nome do Remetente</label>
            <Input
              placeholder="SGC SENAC <senac@exemplo.com>"
              value={emailConfig.from}
              onChange={e => setEmailConfig({ ...emailConfig, from: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="email_ativo"
              checked={emailConfig.ativo}
              onChange={e => setEmailConfig({ ...emailConfig, ativo: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="email_ativo" className="text-sm" style={{ color: colors.textPrimary }}>
              Envio de emails ativo
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={saveEmailConfig} disabled={loadingConfig} style={{ background: accentBlue }}>
            <Save className="h-4 w-4 mr-2" />
            {loadingConfig ? 'Salvando...' : 'Salvar Configurações'}
          </Button>

          <Button
            onClick={testEmailConfig}
            disabled={testingEmail}
            variant="outline"
            style={{ borderColor: accentOrange, color: accentOrange }}
          >
            <Mail className="h-4 w-4 mr-2" />
            {testingEmail ? 'Enviando...' : 'Enviar Email de Teste'}
          </Button>
        </div>

        <p className="text-xs mt-4" style={{ color: colors.labelColor }}>
          Para Gmail, use "smtp.gmail.com" na porta 587 e uma <strong>senha de app</strong>.
        </p>
      </div>

      {/* Configurações do Sistema */}
      <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
        <h3 className="text-lg mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
          <Globe className="h-5 w-5" style={{ color: accentBlue }} />
          Configurações do Sistema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Nome do Sistema</label>
            <Input
              placeholder="SGC - Sistema de Gestão de Certificados"
              value={sistemaConfig.nome_sistema}
              onChange={e => setSistemaConfig({ ...sistemaConfig, nome_sistema: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Instituição</label>
            <Input
              placeholder="SENAC"
              value={sistemaConfig.instituicao}
              onChange={e => setSistemaConfig({ ...sistemaConfig, instituicao: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>URL do Frontend</label>
            <Input
              placeholder="https://seu-app.vercel.app"
              value={sistemaConfig.frontend_url}
              onChange={e => setSistemaConfig({ ...sistemaConfig, frontend_url: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>URL da Logo</label>
            <Input
              placeholder="/assets/logo-white.png"
              value={sistemaConfig.logo_url}
              onChange={e => setSistemaConfig({ ...sistemaConfig, logo_url: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Cor Primária</label>
            <div className="flex gap-2">
              <Input
                placeholder="hsl(210, 80%, 55%)"
                value={sistemaConfig.cor_primaria}
                onChange={e => setSistemaConfig({ ...sistemaConfig, cor_primaria: e.target.value })}
                style={inputStyle}
              />
              <div
                className="w-10 h-10 rounded border"
                style={{ background: sistemaConfig.cor_primaria || accentBlue }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Cor Secundária</label>
            <div className="flex gap-2">
              <Input
                placeholder="hsl(30, 95%, 55%)"
                value={sistemaConfig.cor_secundaria}
                onChange={e => setSistemaConfig({ ...sistemaConfig, cor_secundaria: e.target.value })}
                style={inputStyle}
              />
              <div
                className="w-10 h-10 rounded border"
                style={{ background: sistemaConfig.cor_secundaria || accentOrange }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={saveSistemaConfig} disabled={loadingConfig} style={{ background: accentBlue }}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesSection;

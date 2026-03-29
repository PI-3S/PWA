import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Upload, Clock, CheckCircle2, XCircle, Pencil, CloudUpload, FileText, ChevronRight, BarChart3, Send, Calendar, BookOpen, GraduationCap, Beaker, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import logoWhite from '@/assets/logo-white.png';

// Mock data
const categoryLimits = [
  { id: 'pesquisa', label: 'Pesquisa', icon: Beaker, current: 35, limit: 60, color: 'hsl(200, 80%, 55%)' },
  { id: 'ensino', label: 'Ensino', icon: BookOpen, current: 45, limit: 50, color: 'hsl(30, 95%, 55%)' },
  { id: 'extensao', label: 'Extensão', icon: Users, current: 25, limit: 60, color: 'hsl(160, 70%, 50%)' },
  { id: 'culturais', label: 'Culturais', icon: GraduationCap, current: 15, limit: 30, color: 'hsl(270, 60%, 60%)' },
];

const totalHours = { current: 120, required: 200 };

type SubmissionStatus = 'approved' | 'rejected' | 'pending' | 'adjustment';

interface StudentSubmission {
  id: string;
  date: string;
  activity: string;
  hours: number;
  status: SubmissionStatus;
  rejectionReason?: string;
}

const mockHistory: StudentSubmission[] = [
  { id: '1', date: '2026-03-20', activity: 'Curso de Python Avançado', hours: 40, status: 'approved' },
  { id: '2', date: '2026-03-15', activity: 'Palestra sobre IA Generativa', hours: 4, status: 'rejected', rejectionReason: 'Certificado ilegível. Por favor, envie uma cópia com melhor resolução.' },
  { id: '3', date: '2026-03-10', activity: 'Monitoria de Cálculo II', hours: 30, status: 'pending' },
  { id: '4', date: '2026-03-05', activity: 'Estágio em Desenvolvimento Web', hours: 20, status: 'adjustment' },
  { id: '5', date: '2026-02-28', activity: 'Workshop de Design Thinking', hours: 8, status: 'approved' },
];

const statusConfig: Record<SubmissionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  approved: { label: 'Aprovado', icon: CheckCircle2, className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Reprovado', icon: XCircle, className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  pending: { label: 'Em Análise', icon: Clock, className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  adjustment: { label: 'Ajuste Solicitado', icon: Pencil, className: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
};

const navItems = [
  { id: 'progress', label: 'Meu Progresso', icon: BarChart3 },
  { id: 'submit', label: 'Nova Submissão', icon: Send },
  { id: 'history', label: 'Histórico', icon: FileText },
];

const Aluno = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = userEmail.split('@')[0].replace(/[0-9]/g, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._]/g, ' ').trim() || 'Aluno';
  const [activeSection, setActiveSection] = useState('progress');
  const [selectedRejection, setSelectedRejection] = useState<StudentSubmission | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    hours: '',
    date: '',
  });

  const handleSubmit = () => {
    if (!formData.category || !formData.description || !formData.hours || !formData.date) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    toast.success('Certificado enviado para avaliação com sucesso!');
    setFormData({ category: '', description: '', hours: '', date: '' });
    setFileName('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const progressPercentage = (totalHours.current / totalHours.required) * 100;

  return (
    <div className="min-h-screen futuristic-bg grid-pattern">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm transition-colors hover:text-white"
              style={{ color: 'hsl(160, 70%, 55%)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-display text-xs tracking-wider uppercase">Voltar</span>
            </button>
            <div className="h-5 w-px" style={{ background: 'hsla(200, 80%, 50%, 0.2)' }} />
            <img src={logoWhite} alt="Logo" className="h-8 w-auto" />
            <h1 className="font-display text-sm tracking-widest uppercase text-white">
              Área do Aluno
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm capitalize" style={{ color: 'hsl(220, 20%, 60%)' }}>{userName}</span>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
              style={{
                background: 'hsla(0, 70%, 50%, 0.15)',
                border: '1px solid hsla(0, 70%, 50%, 0.3)',
                color: 'hsl(0, 70%, 65%)',
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-56 shrink-0">
          <div className="glass-card rounded-xl p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id ? 'text-white' : ''
                }`}
                style={
                  activeSection === item.id
                    ? {
                        background: 'hsla(160, 70%, 50%, 0.15)',
                        border: '1px solid hsla(160, 70%, 50%, 0.25)',
                        boxShadow: '0 0 20px -5px hsla(160, 70%, 50%, 0.2)',
                      }
                    : { color: 'hsl(220, 20%, 55%)', border: '1px solid transparent' }
                }
              >
                <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: 'hsl(160, 70%, 55%)' } : {}} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Progress Section */}
          {activeSection === 'progress' && (
            <>
              {/* Overall Progress */}
              <div className="glass-card rounded-xl p-6 scan-line">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg tracking-wider uppercase text-white">Progresso Geral</h2>
                  <span className="font-mono text-2xl font-bold" style={{ color: 'hsl(160, 70%, 55%)' }}>
                    {totalHours.current}h <span className="text-sm font-normal" style={{ color: 'hsl(220, 20%, 50%)' }}>/ {totalHours.required}h</span>
                  </span>
                </div>
                <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'hsla(220, 40%, 20%, 0.8)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${progressPercentage}%`,
                      background: 'linear-gradient(90deg, hsl(160, 70%, 40%), hsl(160, 70%, 55%), hsl(180, 70%, 50%))',
                      boxShadow: '0 0 20px hsla(160, 70%, 50%, 0.4)',
                    }}
                  />
                </div>
                <p className="mt-2 text-xs font-mono" style={{ color: 'hsl(220, 20%, 50%)' }}>
                  {Math.round(progressPercentage)}% concluído — Faltam {totalHours.required - totalHours.current}h
                </p>
              </div>

              {/* Category Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryLimits.map((cat) => {
                  const pct = (cat.current / cat.limit) * 100;
                  const isNearLimit = pct >= 80;
                  return (
                    <div
                      key={cat.id}
                      className="glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        borderColor: `${cat.color}33`,
                        boxShadow: `0 0 20px -8px ${cat.color}33`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}
                        >
                          <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                        </div>
                        <span className="text-xs font-display tracking-wider uppercase text-white">{cat.label}</span>
                      </div>
                      <div className="font-mono text-lg font-bold" style={{ color: cat.color }}>
                        {cat.current}h <span className="text-xs font-normal" style={{ color: 'hsl(220, 20%, 50%)' }}>/ {cat.limit}h</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsla(220, 40%, 20%, 0.8)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: cat.color,
                            boxShadow: `0 0 10px ${cat.color}66`,
                          }}
                        />
                      </div>
                      {isNearLimit && (
                        <p className="mt-2 text-[10px] font-mono" style={{ color: 'hsl(38, 92%, 55%)' }}>
                          ⚠ Próximo do limite
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Submission Form */}
          {activeSection === 'submit' && (
            <div className="glass-card rounded-xl p-6 scan-line">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'hsla(160, 70%, 50%, 0.15)', border: '1px solid hsla(160, 70%, 50%, 0.3)' }}
                >
                  <Upload className="h-5 w-5" style={{ color: 'hsl(160, 70%, 55%)' }} />
                </div>
                <div>
                  <h2 className="font-display text-lg tracking-wider uppercase text-white">Enviar Novo Certificado</h2>
                  <p className="text-xs" style={{ color: 'hsl(220, 20%, 50%)' }}>Preencha os dados e envie o comprovante</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 60%)' }}>
                    Tipo de Atividade *
                  </label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger
                      className="border-0 font-mono text-sm text-white"
                      style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}
                    >
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: '1px solid hsla(200, 80%, 50%, 0.2)' }}>
                      <SelectItem value="cursos">Cursos</SelectItem>
                      <SelectItem value="palestras">Palestras</SelectItem>
                      <SelectItem value="monitorias">Monitorias</SelectItem>
                      <SelectItem value="estagios">Estágios</SelectItem>
                      <SelectItem value="extensao">Extensão</SelectItem>
                      <SelectItem value="pesquisa">Pesquisa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 60%)' }}>
                    Carga Horária (h) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Ex: 40"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="border-0 font-mono text-sm text-white placeholder:text-gray-500"
                    style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 60%)' }}>
                    Nome / Descrição *
                  </label>
                  <Input
                    placeholder="Nome do evento ou atividade"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-0 font-mono text-sm text-white placeholder:text-gray-500"
                    style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 60%)' }}>
                    Data de Realização *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-0 font-mono text-sm text-white placeholder:text-gray-500"
                    style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}
                  />
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="text-xs font-display tracking-wider uppercase mb-2 block" style={{ color: 'hsl(220, 20%, 60%)' }}>
                  Certificado / Comprovante
                </label>
                <div
                  className={`relative rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${dragActive ? 'scale-[1.01]' : ''}`}
                  style={{
                    border: `2px dashed ${dragActive ? 'hsl(160, 70%, 55%)' : 'hsla(200, 80%, 50%, 0.2)'}`,
                    background: dragActive ? 'hsla(160, 70%, 50%, 0.05)' : 'hsla(220, 40%, 15%, 0.4)',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />
                  <CloudUpload className="h-10 w-10 mx-auto mb-3" style={{ color: dragActive ? 'hsl(160, 70%, 55%)' : 'hsl(220, 20%, 40%)' }} />
                  {fileName ? (
                    <p className="font-mono text-sm" style={{ color: 'hsl(160, 70%, 55%)' }}>
                      <FileText className="inline h-4 w-4 mr-1" /> {fileName}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-white mb-1">Arraste seu certificado aqui ou clique para fazer upload</p>
                      <p className="text-xs" style={{ color: 'hsl(220, 20%, 45%)' }}>PDF, JPG ou PNG — máx. 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full py-6 text-sm font-display tracking-widest uppercase rounded-xl transition-all duration-300 hover:scale-[1.01] border-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(160, 70%, 40%), hsl(180, 60%, 40%))',
                  boxShadow: '0 0 30px -5px hsla(160, 70%, 50%, 0.3)',
                  color: 'white',
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar para Avaliação
              </Button>
            </div>
          )}

          {/* History */}
          {activeSection === 'history' && (
            <div className="glass-card rounded-xl overflow-hidden scan-line">
              <div className="p-6 pb-4">
                <h2 className="font-display text-lg tracking-wider uppercase text-white">Meus Últimos Envios</h2>
                <p className="text-xs mt-1" style={{ color: 'hsl(220, 20%, 50%)' }}>Acompanhe o status das suas submissões</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Data', 'Atividade', 'Horas', 'Status'].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: 'hsl(200, 80%, 55%)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockHistory.map((item) => {
                      const config = statusConfig[item.status];
                      const StatusIcon = config.icon;
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors duration-200"
                          style={{ borderBottom: '1px solid hsla(220, 40%, 20%, 0.5)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsla(220, 40%, 20%, 0.3)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td className="px-6 py-4 text-xs font-mono" style={{ color: 'hsl(220, 20%, 55%)' }}>
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">{item.activity}</td>
                          <td className="px-6 py-4 text-sm font-mono font-bold" style={{ color: 'hsl(160, 70%, 55%)' }}>
                            {item.hours}h
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => item.status === 'rejected' && setSelectedRejection(item)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className} ${
                                item.status === 'rejected' ? 'cursor-pointer hover:brightness-125' : 'cursor-default'
                              }`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Rejection Reason Dialog */}
      <Dialog open={!!selectedRejection} onOpenChange={() => setSelectedRejection(null)}>
        <DialogContent
          className="border-0"
          style={{
            background: 'hsl(220, 50%, 12%)',
            border: '1px solid hsla(0, 70%, 50%, 0.3)',
            boxShadow: '0 0 60px -10px hsla(0, 70%, 50%, 0.2)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base tracking-wider uppercase text-white flex items-center gap-2">
              <XCircle className="h-5 w-5" style={{ color: 'hsl(0, 70%, 60%)' }} />
              Motivo da Reprovação
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg p-4" style={{ background: 'hsla(0, 70%, 50%, 0.08)', border: '1px solid hsla(0, 70%, 50%, 0.15)' }}>
              <p className="text-xs font-display tracking-wider uppercase mb-1" style={{ color: 'hsl(0, 70%, 60%)' }}>Atividade</p>
              <p className="text-sm text-white">{selectedRejection?.activity}</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'hsla(220, 40%, 18%, 0.6)', border: '1px solid hsla(200, 80%, 50%, 0.1)' }}>
              <p className="text-xs font-display tracking-wider uppercase mb-1" style={{ color: 'hsl(220, 20%, 55%)' }}>Justificativa do Coordenador</p>
              <p className="text-sm text-white leading-relaxed">{selectedRejection?.rejectionReason}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Aluno;

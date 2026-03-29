import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, Users, FileCheck, ScrollText, Settings,
  LogOut, Search, Plus, Pencil, Trash2, Eye, Check, X, ChevronRight,
  GraduationCap, Clock, Award, Building2, AlertTriangle, Filter,
  TrendingUp, ShieldCheck, UserPlus, Save, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import logoWhite from '@/assets/logo-white.png';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ── Nav Items ──────────────────────────────────────────
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Gestão de Cursos', icon: BookOpen },
  { id: 'users', label: 'Gestão de Usuários', icon: Users },
  { id: 'validation', label: 'Validação', icon: FileCheck },
  { id: 'rules', label: 'Regras de Atividades', icon: ScrollText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

// ── Mock Data ──────────────────────────────────────────
const chartData = [
  { name: 'Pesquisa', horas: 340, fill: 'hsl(200, 80%, 55%)' },
  { name: 'Ensino', horas: 520, fill: 'hsl(30, 95%, 55%)' },
  { name: 'Extensão', horas: 410, fill: 'hsl(160, 70%, 50%)' },
  { name: 'Cultural', horas: 180, fill: 'hsl(270, 60%, 60%)' },
  { name: 'Estágio', horas: 290, fill: 'hsl(340, 70%, 55%)' },
];

interface Course {
  id: string;
  name: string;
  code: string;
  totalHours: number;
  students: number;
  status: 'ativo' | 'inativo';
}

const mockCourses: Course[] = [
  { id: '1', name: 'Análise e Desenvolvimento de Sistemas', code: 'ADS-2026', totalHours: 200, students: 45, status: 'ativo' },
  { id: '2', name: 'Design de Interiores', code: 'DI-2026', totalHours: 160, students: 32, status: 'ativo' },
  { id: '3', name: 'Gastronomia', code: 'GAS-2026', totalHours: 180, students: 28, status: 'ativo' },
  { id: '4', name: 'Enfermagem', code: 'ENF-2025', totalHours: 200, students: 50, status: 'inativo' },
];

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'coordenador' | 'aluno';
  course: string;
  status: 'ativo' | 'inativo';
}

const mockUsers: SystemUser[] = [
  { id: '1', name: 'Maria Silva', email: 'maria@senac.br', role: 'coordenador', course: 'ADS', status: 'ativo' },
  { id: '2', name: 'João Santos', email: 'joao@aluno.senac.br', role: 'aluno', course: 'ADS', status: 'ativo' },
  { id: '3', name: 'Ana Costa', email: 'ana@senac.br', role: 'coordenador', course: 'Design', status: 'ativo' },
  { id: '4', name: 'Pedro Lima', email: 'pedro@aluno.senac.br', role: 'aluno', course: 'Gastronomia', status: 'inativo' },
];

interface Certificate {
  id: string;
  student: string;
  course: string;
  activity: string;
  category: string;
  hours: number;
  date: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  verified: boolean;
}

const mockCertificates: Certificate[] = [
  { id: '1', student: 'João Santos', course: 'ADS', activity: 'Curso de Python', category: 'Ensino', hours: 40, date: '2026-03-20', status: 'pendente', verified: true },
  { id: '2', student: 'Lucas Oliveira', course: 'ADS', activity: 'Palestra IA', category: 'Pesquisa', hours: 4, date: '2026-03-18', status: 'pendente', verified: true },
  { id: '3', student: 'Maria Souza', course: 'Design', activity: 'Workshop UX', category: 'Extensão', hours: 16, date: '2026-03-15', status: 'pendente', verified: false },
  { id: '4', student: 'Ana Lima', course: 'Gastronomia', activity: 'Estágio Restaurante', category: 'Estágio', hours: 60, date: '2026-03-10', status: 'aprovado', verified: true },
];

interface ActivityRule {
  id: string;
  category: string;
  maxHours: number;
  minHoursPerCert: number;
  description: string;
}

const mockRules: ActivityRule[] = [
  { id: '1', category: 'Pesquisa', maxHours: 60, minHoursPerCert: 2, description: 'Atividades de pesquisa e iniciação científica' },
  { id: '2', category: 'Ensino', maxHours: 50, minHoursPerCert: 4, description: 'Cursos, workshops e monitorias' },
  { id: '3', category: 'Extensão', maxHours: 60, minHoursPerCert: 2, description: 'Projetos sociais e atividades comunitárias' },
  { id: '4', category: 'Cultural', maxHours: 30, minHoursPerCert: 1, description: 'Eventos culturais, palestras e exposições' },
  { id: '5', category: 'Estágio', maxHours: 80, minHoursPerCert: 20, description: 'Estágios supervisionados' },
];

// ── Colors ──────────────────────────────────────────
const panelBg = 'hsl(220, 45%, 11%)';
const cardBg = 'hsla(220, 40%, 15%, 0.7)';
const cardBorder = 'hsla(200, 60%, 40%, 0.12)';
const inputBg = 'hsla(220, 40%, 18%, 0.8)';
const inputBorder = 'hsla(200, 80%, 50%, 0.15)';
const labelColor = 'hsl(220, 20%, 55%)';
const accentBlue = 'hsl(210, 80%, 55%)';
const accentOrange = 'hsl(30, 95%, 55%)';

// ── Component ──────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const userName = profile?.nome || localStorage.getItem('userEmail')?.split('@')[0]?.replace(/[0-9]/g, '')?.replace(/[._]/g, ' ')?.trim() || 'Admin';
  const [section, setSection] = useState('dashboard');
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [users] = useState<SystemUser[]>(mockUsers);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [rules, setRules] = useState<ActivityRule[]>(mockRules);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialogs
  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Course>>({});
  const [certDialog, setCertDialog] = useState<Certificate | null>(null);
  const [justification, setJustification] = useState('');
  const [userDialog, setUserDialog] = useState(false);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editRule, setEditRule] = useState<Partial<ActivityRule>>({});

  // Stats
  const stats = useMemo(() => ({
    totalStudents: users.filter(u => u.role === 'aluno').length + 43,
    totalHours: chartData.reduce((a, b) => a + b.horas, 0),
    pendingCerts: certificates.filter(c => c.status === 'pendente').length,
    activeCourses: courses.filter(c => c.status === 'ativo').length,
  }), [users, certificates, courses]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [courses, searchTerm]);

  const handleCertDecision = (id: string, status: 'aprovado' | 'reprovado') => {
    if (status === 'reprovado' && !justification.trim()) {
      toast.error('Justificativa obrigatória para reprovação.');
      return;
    }
    setCertificates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(status === 'aprovado' ? 'Certificado aprovado com sucesso!' : 'Certificado reprovado.');
    setCertDialog(null);
    setJustification('');
  };

  const handleSaveCourse = () => {
    if (!editCourse.name || !editCourse.code) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    if (editCourse.id) {
      setCourses(prev => prev.map(c => c.id === editCourse.id ? { ...c, ...editCourse } as Course : c));
      toast.success('Curso atualizado!');
    } else {
      setCourses(prev => [...prev, { ...editCourse, id: Date.now().toString(), students: 0, status: 'ativo' } as Course]);
      toast.success('Curso cadastrado!');
    }
    setCourseDialog(false);
    setEditCourse({});
  };

  const handleSaveRule = () => {
    if (!editRule.category) {
      toast.error('Preencha a categoria.');
      return;
    }
    if (editRule.id) {
      setRules(prev => prev.map(r => r.id === editRule.id ? { ...r, ...editRule } as ActivityRule : r));
      toast.success('Regra atualizada!');
    } else {
      setRules(prev => [...prev, { ...editRule, id: Date.now().toString() } as ActivityRule]);
      toast.success('Regra criada!');
    }
    setRuleDialog(false);
    setEditRule({});
  };

  // ── Card component ──
  const MetricCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) => (
    <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: cardBg, border: `1px solid ${color}22`, boxShadow: `0 0 25px -10px ${color}33` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] mt-1 font-mono" style={{ color: labelColor }}>{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: `linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)` }}>
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r" style={{ background: 'hsl(220, 50%, 9%)', borderColor: cardBorder }}>
        <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: cardBorder }}>
          <img src={logoWhite} alt="Logo" className="h-9 w-auto" />
          <div>
            <p className="text-xs font-display tracking-widest uppercase text-white">Atividades</p>
            <p className="text-[10px] font-display tracking-[0.2em] uppercase" style={{ color: accentOrange }}>SENAC</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSearchTerm(''); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                section === item.id
                  ? { background: `${accentBlue}18`, border: `1px solid ${accentBlue}33`, color: 'white', boxShadow: `0 0 20px -8px ${accentBlue}44` }
                  : { color: labelColor, border: '1px solid transparent' }
              }
            >
              <item.icon className="h-4 w-4" style={section === item.id ? { color: accentBlue } : {}} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-display" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white capitalize truncate">{userName}</p>
              <p className="text-[10px]" style={{ color: labelColor }}>Super Admin</p>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
            style={{ background: 'hsla(0, 70%, 50%, 0.12)', border: '1px solid hsla(0, 70%, 50%, 0.25)', color: 'hsl(0, 70%, 65%)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b shrink-0" style={{ background: 'hsla(220, 50%, 9%, 0.8)', backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
          <h1 className="font-display text-sm tracking-widest uppercase text-white">
            {navItems.find(n => n.id === section)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg transition-all hover:bg-white/5" style={{ color: labelColor }}>
              <Bell className="h-5 w-5" />
              {stats.pendingCerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: 'hsl(0, 72%, 51%)', color: 'white' }}>
                  {stats.pendingCerts}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══════ DASHBOARD ══════ */}
          {section === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={GraduationCap} label="Total de Alunos" value={stats.totalStudents} color="hsl(160, 70%, 50%)" />
                <MetricCard icon={Clock} label="Horas Acumuladas" value={`${stats.totalHours}h`} color={accentBlue} />
                <MetricCard icon={Award} label="Certificados Pendentes" value={stats.pendingCerts} color={accentOrange} sub="Aguardando análise" />
                <MetricCard icon={Building2} label="Cursos Ativos" value={stats.activeCourses} color="hsl(270, 60%, 60%)" />
              </div>

              {/* Chart */}
              <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <h3 className="font-display text-sm tracking-wider uppercase text-white mb-6">Progresso por Categoria</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 30%, 30%, 0.3)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(220, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(220, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} unit="h" />
                    <Tooltip
                      contentStyle={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}`, borderRadius: 8, color: 'white', fontSize: 13 }}
                      cursor={{ fill: 'hsla(220, 40%, 20%, 0.3)' }}
                    />
                    <Bar dataKey="horas" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent pending */}
              <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm tracking-wider uppercase text-white">Certificados Pendentes Recentes</h3>
                  <button onClick={() => setSection('validation')} className="text-xs flex items-center gap-1 transition-colors hover:text-white" style={{ color: accentBlue }}>
                    Ver todos <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {certificates.filter(c => c.status === 'pendente').slice(0, 3).map(cert => (
                    <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/[0.03]" style={{ border: `1px solid ${cardBorder}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${accentBlue}22`, color: accentBlue }}>
                          {cert.student.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-white">{cert.student}</p>
                          <p className="text-xs" style={{ color: labelColor }}>{cert.activity} · {cert.hours}h</p>
                        </div>
                      </div>
                      <Badge className="text-[10px] border" style={{ background: 'hsla(38, 92%, 50%, 0.12)', color: 'hsl(38, 92%, 60%)', borderColor: 'hsla(38, 92%, 50%, 0.3)' }}>
                        Pendente
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════ COURSES ══════ */}
          {section === 'courses' && (
            <>
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: labelColor }} />
                  <Input
                    placeholder="Buscar curso..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 text-sm text-white placeholder:text-gray-500 font-mono"
                    style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
                  />
                </div>
                <Button
                  onClick={() => { setEditCourse({}); setCourseDialog(true); }}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}
                >
                  <Plus className="h-4 w-4" /> Novo Curso
                </Button>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Código', 'Nome do Curso', 'Horas Req.', 'Alunos', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map(course => (
                      <tr key={course.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{course.code}</td>
                        <td className="px-5 py-4 text-sm text-white">{course.name}</td>
                        <td className="px-5 py-4 text-sm font-mono font-bold" style={{ color: accentBlue }}>{course.totalHours}h</td>
                        <td className="px-5 py-4 text-sm font-mono" style={{ color: labelColor }}>{course.students}</td>
                        <td className="px-5 py-4">
                          <Badge className="text-[10px] border" style={
                            course.status === 'ativo'
                              ? { background: 'hsla(152, 60%, 40%, 0.12)', color: 'hsl(152, 60%, 55%)', borderColor: 'hsla(152, 60%, 40%, 0.3)' }
                              : { background: 'hsla(220, 20%, 40%, 0.12)', color: 'hsl(220, 20%, 55%)', borderColor: 'hsla(220, 20%, 40%, 0.3)' }
                          }>
                            {course.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditCourse(course); setCourseDialog(true); }} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setCourses(prev => prev.filter(c => c.id !== course.id)); toast.success('Curso removido.'); }} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(0, 70%, 60%)' }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════ USERS ══════ */}
          {section === 'users' && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: labelColor }} />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 text-sm text-white placeholder:text-gray-500 font-mono"
                    style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-44 border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <Filter className="h-3.5 w-3.5 mr-2" style={{ color: labelColor }} />
                    <SelectValue placeholder="Filtrar por perfil" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="coordenador">Coordenadores</SelectItem>
                    <SelectItem value="aluno">Alunos</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setUserDialog(true)}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}
                >
                  <UserPlus className="h-4 w-4" /> Novo Usuário
                </Button>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Nome', 'Email', 'Perfil', 'Curso', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td className="px-5 py-4 text-sm text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: user.role === 'coordenador' ? `${accentOrange}22` : `${accentBlue}22`, color: user.role === 'coordenador' ? accentOrange : accentBlue }}>
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{user.email}</td>
                        <td className="px-5 py-4">
                          <Badge className="text-[10px] border" style={
                            user.role === 'coordenador'
                              ? { background: `${accentOrange}12`, color: accentOrange, borderColor: `${accentOrange}33` }
                              : { background: `${accentBlue}12`, color: accentBlue, borderColor: `${accentBlue}33` }
                          }>
                            {user.role === 'coordenador' ? 'Coordenador' : 'Aluno'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: labelColor }}>{user.course}</td>
                        <td className="px-5 py-4">
                          <Badge className="text-[10px] border" style={
                            user.status === 'ativo'
                              ? { background: 'hsla(152, 60%, 40%, 0.12)', color: 'hsl(152, 60%, 55%)', borderColor: 'hsla(152, 60%, 40%, 0.3)' }
                              : { background: 'hsla(220, 20%, 40%, 0.12)', color: 'hsl(220, 20%, 55%)', borderColor: 'hsla(220, 20%, 40%, 0.3)' }
                          }>
                            {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════ VALIDATION ══════ */}
          {section === 'validation' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <MetricCard icon={Clock} label="Pendentes" value={certificates.filter(c => c.status === 'pendente').length} color={accentOrange} />
                <MetricCard icon={Check} label="Aprovados" value={certificates.filter(c => c.status === 'aprovado').length} color="hsl(152, 60%, 50%)" />
                <MetricCard icon={X} label="Reprovados" value={certificates.filter(c => c.status === 'reprovado').length} color="hsl(0, 72%, 55%)" />
              </div>

              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Data', 'Aluno', 'Atividade', 'Categoria', 'Horas', 'Status', 'Ação'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map(cert => {
                      const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                        pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)' },
                        aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)' },
                        reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)' },
                      };
                      const sc = statusColors[cert.status];
                      return (
                        <tr key={cert.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                          <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{new Date(cert.date).toLocaleDateString('pt-BR')}</td>
                          <td className="px-5 py-4 text-sm text-white flex items-center gap-2">
                            {cert.student}
                            {cert.verified && <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'hsl(152, 60%, 55%)' }} />}
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: labelColor }}>{cert.activity}</td>
                          <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{cert.category}</td>
                          <td className="px-5 py-4 text-sm font-mono font-bold" style={{ color: accentBlue }}>{cert.hours}h</td>
                          <td className="px-5 py-4">
                            <Badge className="text-[10px] border" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                              {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            {cert.status === 'pendente' ? (
                              <button onClick={() => setCertDialog(cert)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}>
                                <Eye className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-xs" style={{ color: labelColor }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════ RULES ══════ */}
          {section === 'rules' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: labelColor }}>Defina limites e parâmetros para cada categoria de atividade complementar.</p>
                <Button
                  onClick={() => { setEditRule({}); setRuleDialog(true); }}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}
                >
                  <Plus className="h-4 w-4" /> Nova Regra
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rules.map(rule => (
                  <div key={rule.id} className="rounded-xl p-5 space-y-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm tracking-wider uppercase text-white">{rule.category}</h4>
                      <button onClick={() => { setEditRule(rule); setRuleDialog(true); }} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs" style={{ color: labelColor }}>{rule.description}</p>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] font-display tracking-wider uppercase" style={{ color: labelColor }}>Máx. Horas</p>
                        <p className="text-lg font-mono font-bold" style={{ color: accentBlue }}>{rule.maxHours}h</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-display tracking-wider uppercase" style={{ color: labelColor }}>Mín. p/ Cert.</p>
                        <p className="text-lg font-mono font-bold" style={{ color: accentOrange }}>{rule.minHoursPerCert}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══════ SETTINGS ══════ */}
          {section === 'settings' && (
            <>
              <div className="rounded-xl p-6 space-y-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <h3 className="font-display text-sm tracking-wider uppercase text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4" style={{ color: accentBlue }} />
                  Parâmetros Institucionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Nome da Instituição</label>
                    <Input defaultValue="SENAC" className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Carga Horária Padrão</label>
                    <Input type="number" defaultValue="200" className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Ano Letivo</label>
                    <Input defaultValue="2026" className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Semestre</label>
                    <Select defaultValue="1">
                      <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                        <SelectItem value="1">1º Semestre</SelectItem>
                        <SelectItem value="2">2º Semestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => toast.success('Configurações salvas!')}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: `linear-gradient(135deg, hsl(152, 60%, 40%), hsl(160, 60%, 45%))`, color: 'white' }}
                >
                  <Save className="h-4 w-4" /> Salvar Configurações
                </Button>
              </div>

              <div className="rounded-xl p-6 space-y-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <h3 className="font-display text-sm tracking-wider uppercase text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4" style={{ color: accentOrange }} />
                  Cadastrar Novo Coordenador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Nome Completo</label>
                    <Input placeholder="Nome do coordenador" className="border-0 text-sm text-white placeholder:text-gray-500 font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>E-mail Institucional</label>
                    <Input type="email" placeholder="email@senac.br" className="border-0 text-sm text-white placeholder:text-gray-500 font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Curso Vinculado</label>
                    <Select>
                      <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                        <SelectValue placeholder="Selecionar curso" />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                        {courses.filter(c => c.status === 'ativo').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Senha Inicial</label>
                    <Input type="password" placeholder="••••••••" className="border-0 text-sm text-white placeholder:text-gray-500 font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                  </div>
                </div>
                <Button
                  onClick={() => toast.success('Coordenador cadastrado com sucesso!')}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: `linear-gradient(135deg, ${accentOrange}, hsl(40, 95%, 55%))`, color: 'white' }}
                >
                  <UserPlus className="h-4 w-4" /> Cadastrar Coordenador
                </Button>
              </div>

              <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'hsla(38, 92%, 50%, 0.08)', border: '1px solid hsla(38, 92%, 50%, 0.2)' }}>
                <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: accentOrange }} />
                <div>
                  <p className="text-sm text-white font-medium">Área restrita ao Super Admin</p>
                  <p className="text-xs" style={{ color: labelColor }}>Alterações nos parâmetros institucionais afetam todos os cursos e coordenadores do sistema.</p>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── Course Dialog ── */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">
              {editCourse.id ? 'Editar Curso' : 'Novo Curso'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Nome *</label>
              <Input value={editCourse.name || ''} onChange={e => setEditCourse({ ...editCourse, name: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Código *</label>
                <Input value={editCourse.code || ''} onChange={e => setEditCourse({ ...editCourse, code: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Horas Obrigatórias</label>
                <Input type="number" value={editCourse.totalHours || ''} onChange={e => setEditCourse({ ...editCourse, totalHours: Number(e.target.value) })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCourseDialog(false)} className="text-xs font-display tracking-wider uppercase" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={handleSaveCourse} className="text-xs font-display tracking-wider uppercase border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Certificate Dialog ── */}
      <Dialog open={!!certDialog} onOpenChange={() => { setCertDialog(null); setJustification(''); }}>
        <DialogContent className="border-0 max-w-2xl" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4" style={{ color: accentBlue }} />
              Análise de Certificado
            </DialogTitle>
          </DialogHeader>
          {certDialog && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Aluno</p>
                  <p className="text-sm text-white flex items-center gap-2">
                    {certDialog.student}
                    {certDialog.verified && <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'hsl(152, 60%, 55%)' }} />}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Curso</p>
                  <p className="text-sm text-white">{certDialog.course}</p>
                </div>
                <div className="rounded-lg p-4" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Atividade</p>
                  <p className="text-sm text-white">{certDialog.activity}</p>
                </div>
                <div className="rounded-lg p-4" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Horas / Categoria</p>
                  <p className="text-sm text-white font-mono">{certDialog.hours}h · {certDialog.category}</p>
                </div>
              </div>

              {/* Simulated document preview */}
              <div className="rounded-lg h-48 flex items-center justify-center" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                <div className="text-center" style={{ color: labelColor }}>
                  <FileCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Preview do documento</p>
                  <p className="text-[10px]">certificado_{certDialog.student.toLowerCase().replace(' ', '_')}.pdf</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Justificativa (obrigatória para reprovação)</label>
                <Textarea
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="Descreva o motivo..."
                  className="border-0 text-sm text-white placeholder:text-gray-500 font-mono min-h-[80px]"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => handleCertDecision(certDialog.id, 'reprovado')}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: 'hsla(0, 72%, 50%, 0.15)', color: 'hsl(0, 72%, 65%)', border: '1px solid hsla(0, 72%, 50%, 0.3)' }}
                >
                  <X className="h-4 w-4" /> Reprovar
                </Button>
                <Button
                  onClick={() => handleCertDecision(certDialog.id, 'aprovado')}
                  className="gap-2 text-xs font-display tracking-wider uppercase border-0"
                  style={{ background: 'linear-gradient(135deg, hsl(152, 60%, 40%), hsl(160, 60%, 45%))', color: 'white' }}
                >
                  <Check className="h-4 w-4" /> Aprovar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── User Dialog ── */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Nome Completo</label>
              <Input className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>E-mail</label>
              <Input type="email" className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Perfil</label>
                <Select>
                  <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="aluno">Aluno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Curso</label>
                <Select>
                  <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    {courses.filter(c => c.status === 'ativo').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUserDialog(false)} className="text-xs" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={() => { toast.success('Usuário cadastrado!'); setUserDialog(false); }} className="text-xs border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rule Dialog ── */}
      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">
              {editRule.id ? 'Editar Regra' : 'Nova Regra'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Categoria *</label>
              <Input value={editRule.category || ''} onChange={e => setEditRule({ ...editRule, category: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Máximo de Horas</label>
                <Input type="number" value={editRule.maxHours || ''} onChange={e => setEditRule({ ...editRule, maxHours: Number(e.target.value) })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Mín. Horas p/ Certificado</label>
                <Input type="number" value={editRule.minHoursPerCert || ''} onChange={e => setEditRule({ ...editRule, minHoursPerCert: Number(e.target.value) })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Descrição</label>
              <Textarea value={editRule.description || ''} onChange={e => setEditRule({ ...editRule, description: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRuleDialog(false)} className="text-xs" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={handleSaveRule} className="text-xs border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

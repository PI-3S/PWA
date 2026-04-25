import React, { useState, useCallback } from 'react';
import { UserPlus, Pencil, Trash2, KeyRound, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppTheme } from '@/hooks/useapptheme';
import { Usuario, Curso } from '@/types/admin';
import { generateSecurePassword } from './utils';

interface UsuariosSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const UsuariosSection: React.FC<UsuariosSectionProps> = ({
  apiFetch,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [userDialog, setUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', senha: '', perfil: 'aluno', matricula: '', curso_id: '' });
  const [editUser, setEditUser] = useState<Partial<Usuario>>({});

  const [resetSenhaDialog, setResetSenhaDialog] = useState(false);
  const [resetSenhaUser, setResetSenhaUser] = useState<Usuario | null>(null);
  const [resetSenhaLoading, setResetSenhaLoading] = useState(false);
  const [resetSenhaGerada, setResetSenhaGerada] = useState<string | null>(null);

  const [createdUserData, setCreatedUserData] = useState<{ nome: string; email: string; senha: string } | null>(null);

  const loadUsuarios = useCallback(async () => {
    try {
      const params = roleFilter !== 'all' ? `?perfil=${roleFilter}` : '';
      const [dUsuarios, dCursos] = await Promise.all([
        apiFetch(`/api/usuarios${params}`),
        apiFetch('/api/cursos'),
      ]);

      const cursosMap: Record<string, string> = {};
      (dCursos.cursos || []).forEach((c: Curso) => { cursosMap[c.id] = c.nome; });

      const usuariosList = (dUsuarios.usuarios || []).map((u: any) => ({
        ...u,
        curso_nome: u.curso_nome || (u.curso_id ? cursosMap[u.curso_id] : undefined),
      }));

      setUsuarios(usuariosList);
      setCursos(dCursos.cursos || []);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar usuários.');
    }
  }, [apiFetch, toastError, roleFilter]);

  React.useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  const handleCreateUser = async () => {
    if (!newUser.nome?.trim()) {
      toastError('Nome é obrigatório.');
      return;
    }
    if (!newUser.email?.trim()) {
      toastError('Email é obrigatório.');
      return;
    }
    if (!newUser.email.includes('@')) {
      toastError('Email inválido.');
      return;
    }
    if (!newUser.senha) {
      toastError('Senha é obrigatória.');
      return;
    }
    if (newUser.senha.length < 6) {
      toastError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await apiFetch('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nome: newUser.nome.trim(),
          email: newUser.email.trim().toLowerCase(),
          senha: newUser.senha,
          perfil: newUser.perfil,
          matricula: newUser.matricula?.trim() || null,
          curso_id: newUser.curso_id || null,
        }),
      });

      setCreatedUserData({
        nome: newUser.nome.trim(),
        email: newUser.email.trim().toLowerCase(),
        senha: newUser.senha,
      });

      toastSuccess(`Usuário criado! Credenciais enviadas para ${newUser.email}`);

      setUserDialog(false);
      setNewUser({
        nome: '',
        email: '',
        senha: '',
        perfil: 'aluno',
        matricula: '',
        curso_id: '',
      });

      await loadUsuarios();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') {
        if (e.message.includes('email')) {
          toastError('Este email já está em uso.');
        } else {
          toastError(e.message || 'Erro ao cadastrar usuário.');
        }
      }
    }
  };

  const handleEditUser = async () => {
    if (!editUser.id || !editUser.nome || !editUser.email) {
      toastError('Preencha os campos obrigatórios.');
      return;
    }
    const body = {
      nome: editUser.nome,
      email: editUser.email,
      matricula: editUser.matricula || '',
      curso_id: editUser.curso_id || '',
      perfil: editUser.perfil,
    };
    try {
      try {
        await apiFetch(`/api/usuarios/${editUser.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } catch (patchErr: any) {
        if (patchErr.message?.includes('404') || patchErr.message?.includes('405')) {
          await apiFetch(`/api/usuarios/${editUser.id}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
          throw patchErr;
        }
      }
      toastSuccess('Usuário atualizado!');
      setUserDialog(false);
      setEditUser({});
      await loadUsuarios();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      toastSuccess('Usuário excluído!');
      loadUsuarios();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao excluir usuário.');
    }
  };

  const handleResetSenha = async () => {
    if (!resetSenhaUser) return;
    setResetSenhaLoading(true);
    const novaSenha = generateSecurePassword();
    try {
      await apiFetch(`/api/usuarios/${resetSenhaUser.id}/reset-senha`, {
        method: 'POST',
        body: JSON.stringify({ novaSenha }),
      });
      toastSuccess(`Senha resetada!`);
      setResetSenhaDialog(false);
      setResetSenhaGerada(novaSenha);
      setResetSenhaUser(null);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao resetar senha.');
    } finally {
      setResetSenhaLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger style={{ ...inputStyle, width: 150 }}>
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="aluno">Alunos</SelectItem>
            <SelectItem value="coordenador">Coordenadores</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setUserDialog(true)} style={{ background: accentBlue }}>
          <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead style={{ background: colors.tableHeaderBg }}>
              <tr>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Nome/Email</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Perfil</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map(u => (
                <tr key={u.id} className="border-b" style={{ borderColor: colors.cardBorder }}>
                  <td className="px-5 py-4">
                    <p style={{ color: colors.textPrimary }}>{u.nome}</p>
                    <p className="text-xs" style={{ color: colors.labelColor }}>{u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge style={{ color: u.perfil === 'coordenador' ? accentOrange : accentBlue }}>
                      {u.perfil}
                    </Badge>
                  </td>
                  <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{u.curso_nome || '-'}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => { setEditUser(u); setUserDialog(true); }}
                      className="mr-2"
                      style={{ color: accentBlue }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setResetSenhaUser(u); setResetSenhaDialog(true); }}
                      className="mr-2"
                      style={{ color: accentOrange }}
                      title="Resetar Senha"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.nome)}
                      style={{ color: 'hsl(0, 72%, 60%)' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog: Usuário */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>
              {editUser.id ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome"
              value={editUser.id ? (editUser.nome || '') : newUser.nome}
              onChange={e =>
                editUser.id
                  ? setEditUser({ ...editUser, nome: e.target.value })
                  : setNewUser({ ...newUser, nome: e.target.value })
              }
              style={inputStyle}
            />
            <Input
              placeholder="Email"
              value={editUser.id ? (editUser.email || '') : newUser.email}
              onChange={e =>
                editUser.id
                  ? setEditUser({ ...editUser, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
              }
              style={inputStyle}
            />
            {!editUser.id && (
              <div className="col-span-2 space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={newUser.senha}
                  onChange={e => setNewUser({ ...newUser, senha: e.target.value })}
                  style={inputStyle}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const senhaForte = generateSecurePassword();
                    setNewUser({ ...newUser, senha: senhaForte });
                    toastSuccess('Senha forte gerada!');
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  style={{ borderColor: accentOrange, color: accentOrange }}
                >
                  Gerar Senha Forte
                </Button>
              </div>
            )}
            <Input
              placeholder="Matrícula"
              value={editUser.id ? (editUser.matricula || '') : newUser.matricula}
              onChange={e =>
                editUser.id
                  ? setEditUser({ ...editUser, matricula: e.target.value })
                  : setNewUser({ ...newUser, matricula: e.target.value })
              }
              style={inputStyle}
            />
            <Select
              value={editUser.id ? (editUser.perfil || 'aluno') : newUser.perfil}
              onValueChange={v =>
                editUser.id
                  ? setEditUser({ ...editUser, perfil: v })
                  : setNewUser({ ...newUser, perfil: v })
              }
            >
              <SelectTrigger style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aluno">Aluno</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={editUser.id ? (editUser.curso_id || '') : newUser.curso_id}
              onValueChange={v =>
                editUser.id
                  ? setEditUser({ ...editUser, curso_id: v })
                  : setNewUser({ ...newUser, curso_id: v })
              }
            >
              <SelectTrigger style={inputStyle}>
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setUserDialog(false);
                setEditUser({});
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={editUser.id ? handleEditUser : handleCreateUser}
              style={{ background: accentBlue }}
            >
              {editUser.id ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Usuário Criado com Sucesso */}
      <Dialog open={!!createdUserData} onOpenChange={() => setCreatedUserData(null)}>
        <DialogContent style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${accentBlue}33` }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              Usuário Criado com Sucesso!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                GUARDE ESTAS INFORMAÇÕES!
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Nome:</p>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>{createdUserData?.nome}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Email:</p>
                  <p className="text-blue-400 font-mono text-sm">{createdUserData?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Senha:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-green-400 font-mono text-sm bg-black/30 px-3 py-1 rounded">
                      {createdUserData?.senha}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-xs text-center">
              Esta senha <span className="text-yellow-400 font-bold">não será mostrada novamente</span>.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                const dados = `Nome: ${createdUserData?.nome}\nEmail: ${createdUserData?.email}\nSenha: ${createdUserData?.senha}`;
                navigator.clipboard?.writeText(dados);
                toastSuccess('Dados copiados para a área de transferência!');
              }}
              variant="outline"
              style={{ borderColor: accentBlue, color: accentBlue }}
              className="flex-1"
            >
              Copiar Dados
            </Button>

            <Button
              onClick={() => setCreatedUserData(null)}
              style={{ background: accentBlue }}
              className="flex-1"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Resetar Senha */}
      <Dialog open={resetSenhaDialog} onOpenChange={setResetSenhaDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Resetar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.3)' }}
            >
              <p className="text-sm flex items-center gap-2" style={{ color: 'hsl(45, 95%, 60%)' }}>
                <AlertTriangle className="h-4 w-4" />
                Atenção: Uma nova senha será gerada e enviada para o email do usuário.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: colors.labelColor }}>
                Usuário: <span style={{ color: colors.textPrimary }}>{resetSenhaUser?.nome}</span>
              </p>
              <p className="text-sm" style={{ color: colors.labelColor }}>
                Email: <span style={{ color: accentBlue }}>{resetSenhaUser?.email}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setResetSenhaDialog(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleResetSenha} disabled={resetSenhaLoading} style={{ background: accentOrange }}>
              <KeyRound className="h-4 w-4 mr-2" />
              {resetSenhaLoading ? 'Resetando...' : 'Resetar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nova Senha Gerada */}
      <Dialog open={!!resetSenhaGerada} onOpenChange={() => setResetSenhaGerada(null)}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Nova Senha Gerada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.labelColor }}>
              Copie a nova senha e envie ao usuário por um canal seguro.
            </p>
            <div
              className="p-4 rounded-lg text-center"
              style={{ background: 'hsla(152, 60%, 40%, 0.1)', border: '1px solid hsla(152, 60%, 40%, 0.3)' }}
            >
              <p className="font-mono text-lg font-bold tracking-widest" style={{ color: 'hsl(152, 60%, 55%)' }}>
                {resetSenhaGerada}
              </p>
            </div>
            <p className="text-xs" style={{ color: colors.labelColor }}>
              Esta senha <strong>não será armazenada</strong> nem mostrada novamente.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(resetSenhaGerada || '');
                toastSuccess('Senha copiada!');
              }}
              style={{ borderColor: accentBlue, color: accentBlue }}
            >
              Copiar
            </Button>
            <Button
              onClick={() => setResetSenhaGerada(null)}
              style={{ background: accentOrange }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosSection;

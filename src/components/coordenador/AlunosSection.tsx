import React, { useState, useCallback } from 'react';
import { useAppTheme } from '@/hooks/useapptheme';
import { AlunoInfo, Submissao } from '@/types/coordenador';

interface AlunosSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastError: (msg: string) => void;
  accentOrange: string;
}

const AlunosSection: React.FC<AlunosSectionProps> = ({
  apiFetch,
  colors,
  toastError,
  accentOrange,
}) => {
  const [alunos, setAlunos] = useState<AlunoInfo[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string; carga_horaria_minima?: number }[]>([]);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);

  const fetchAlunos = useCallback(async () => {
    try {
      const [resUsers, resCursos, resSubs] = await Promise.all([
        apiFetch('/api/usuarios?perfil=aluno'),
        apiFetch('/api/cursos'),
        apiFetch('/api/submissoes'),
      ]);

      const dataUsers = resUsers.json ? await resUsers.json() : resUsers;
      const dataCursos = resCursos.json ? await resCursos.json() : resCursos;
      const dataSubs = resSubs.json ? await resSubs.json() : resSubs;

      const cursosMap: Record<string, string> = {};
      const cursosArray = Array.isArray(dataCursos) ? dataCursos : (dataCursos.cursos || []);
      cursosArray.forEach((c: any) => {
        cursosMap[c.id] = c.nome;
      });

      const rawList = Array.isArray(dataUsers) ? dataUsers : (dataUsers.usuarios || dataUsers.data || []);
      const alunosList = rawList.filter((u: any) => u.perfil === 'aluno' || u.perfil === 'Aluno');

      const mappedAlunos = alunosList.map((a: any) => ({
        id: a.id,
        nome: a.nome || a.name || '—',
        email: a.email || '',
        matricula: a.matricula || a.numero_matricula || '—',
        curso_nome: a.curso_nome || cursosMap[a.curso_id] || '—',
        horas_aprovadas: a.horas_aprovadas || a.horasAprovadas || 0,
        carga_minima: a.carga_minima || a.cargaHorariaMinima || 200,
      }));

      setAlunos(mappedAlunos);
      setCursos(cursosArray);

      const subsRaw = Array.isArray(dataSubs) ? dataSubs : (dataSubs.submissoes || dataSubs.data || []);
      setSubmissoes(subsRaw.map((s: any) => ({
        id: s.id,
        aluno_id: s.aluno_id || s.usuario_id || '',
        status: s.status || 'pendente',
        horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
      })));
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar alunos.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  const calcularProgressoAluno = (alunoId: string, cursoNome: string) => {
    const horasAprovadas = submissoes
      .filter(s => s.aluno_id === alunoId && s.status === 'aprovado')
      .reduce((acc, s) => acc + (s.horas_solicitadas || 0), 0);

    const curso = cursos.find(c => c.nome === cursoNome);
    const cargaMinima = curso?.carga_horaria_minima || 200;
    const progresso = Math.min((horasAprovadas / cargaMinima) * 100, 100);

    return { horasAprovadas, progresso: Math.round(progresso), cargaMinima };
  };

  return (
    <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
      <table className="w-full text-left min-w-[500px]">
        <thead style={{ background: colors.sidebarBg }}>
          <tr className="text-[10px] uppercase tracking-widest">
            <th className="px-6 py-4" style={{ color: accentOrange }}>Aluno</th>
            <th className="px-6 py-4" style={{ color: accentOrange }}>Matrícula</th>
            <th className="px-6 py-4" style={{ color: accentOrange }}>Curso</th>
            <th className="px-6 py-4" style={{ color: accentOrange }}>Progresso</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
          {alunos.map((a) => {
            const progresso = calcularProgressoAluno(a.id, a.curso_nome);
            return (
              <tr key={a.id} className="hover:opacity-80">
                <td className="px-6 py-4 text-sm font-medium" style={{ color: colors.textPrimary }}>{a.nome}</td>
                <td className="px-6 py-4 text-sm font-mono" style={{ color: colors.labelColor }}>{a.matricula}</td>
                <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{a.curso_nome}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
                      <div className="h-full bg-orange-500" style={{ width: `${progresso.progresso}%` }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: colors.textPrimary }}>{progresso.horasAprovadas}h</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AlunosSection;

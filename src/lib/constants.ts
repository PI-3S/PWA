/**
 * Cores de destaque por papel de usuário.
 * Fonte única de verdade — evita redefinição nas páginas Admin, Coordenador e Aluno.
 */
export const ACCENT = {
  blue:          'hsl(210, 80%, 55%)',  // Admin
  orange:        'hsl(30, 95%, 55%)',   // Coordenador
  green:         'hsl(152, 60%, 50%)',  // ações de aprovação (Admin / Coordenador)
  alunoGreen:    'hsl(160, 70%, 55%)',  // Aluno
  alunoGreenDim: 'hsl(160, 70%, 40%)', // Aluno — barra de progresso (gradiente)
} as const;

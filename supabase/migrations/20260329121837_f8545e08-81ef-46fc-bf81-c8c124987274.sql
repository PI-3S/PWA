
-- Enum para perfis
CREATE TYPE public.app_perfil AS ENUM ('super_admin', 'coordenador', 'aluno');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil app_perfil NOT NULL DEFAULT 'aluno',
  matricula TEXT,
  curso_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de cursos
CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  carga_horaria_minima INTEGER NOT NULL DEFAULT 0,
  criado_por_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vínculo coordenador-curso
CREATE TABLE public.coordenadores_cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, curso_id)
);

-- Vínculo aluno-curso
CREATE TABLE public.alunos_cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, curso_id)
);

-- Regras de atividades por curso
CREATE TABLE public.regras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  limite_horas INTEGER NOT NULL DEFAULT 0,
  exige_comprovante BOOLEAN NOT NULL DEFAULT true,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submissões de atividades
CREATE TABLE public.submissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coordenador_id UUID REFERENCES auth.users(id),
  regra_id UUID REFERENCES public.regras(id),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
  horas_solicitadas INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_validacao TIMESTAMPTZ,
  justificativa TEXT
);

-- Certificados vinculados a submissões
CREATE TABLE public.certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submissao_id UUID REFERENCES public.submissoes(id) ON DELETE CASCADE NOT NULL,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  processado_ocr BOOLEAN NOT NULL DEFAULT false,
  texto_extraido TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar FK de curso_id no profiles
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_curso FOREIGN KEY (curso_id) REFERENCES public.cursos(id);

-- Enable RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordenadores_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Tabela de roles separada (segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_perfil NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função de verificação de role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_perfil)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies

-- Profiles: todos autenticados podem ler, usuário edita o próprio
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Cursos: todos podem ler, admin pode tudo
CREATE POLICY "Anyone can view cursos" ON public.cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage cursos" ON public.cursos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Coordenadores_cursos
CREATE POLICY "Anyone can view coord_cursos" ON public.coordenadores_cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage coord_cursos" ON public.coordenadores_cursos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Alunos_cursos
CREATE POLICY "Anyone can view alunos_cursos" ON public.alunos_cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage alunos_cursos" ON public.alunos_cursos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Coords can manage alunos_cursos" ON public.alunos_cursos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coordenador'));

-- Regras
CREATE POLICY "Anyone can view regras" ON public.regras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage regras" ON public.regras FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Submissoes
CREATE POLICY "Alunos can view own submissoes" ON public.submissoes FOR SELECT TO authenticated USING (auth.uid() = aluno_id);
CREATE POLICY "Alunos can create submissoes" ON public.submissoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = aluno_id);
CREATE POLICY "Coords can view submissoes" ON public.submissoes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coordenador'));
CREATE POLICY "Coords can update submissoes" ON public.submissoes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'coordenador'));
CREATE POLICY "Admins can manage submissoes" ON public.submissoes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Certificados
CREATE POLICY "Users can view own certificados" ON public.certificados FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.submissoes WHERE submissoes.id = certificados.submissao_id AND submissoes.aluno_id = auth.uid())
);
CREATE POLICY "Alunos can insert certificados" ON public.certificados FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.submissoes WHERE submissoes.id = certificados.submissao_id AND submissoes.aluno_id = auth.uid())
);
CREATE POLICY "Coords can view certificados" ON public.certificados FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coordenador'));
CREATE POLICY "Admins can manage certificados" ON public.certificados FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Trigger para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::app_perfil, 'aluno')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::app_perfil, 'aluno')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função de update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para certificados
INSERT INTO storage.buckets (id, name, public) VALUES ('certificados', 'certificados', false);

CREATE POLICY "Users can upload certificados" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificados' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own certificados" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'certificados' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coords can view all certificados" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'certificados' AND public.has_role(auth.uid(), 'coordenador'));

CREATE POLICY "Admins can manage all certificados" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'certificados' AND public.has_role(auth.uid(), 'super_admin'));

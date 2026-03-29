export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alunos_cursos: {
        Row: {
          created_at: string
          curso_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_cursos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          processado_ocr: boolean
          submissao_id: string
          texto_extraido: string | null
          url_arquivo: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          processado_ocr?: boolean
          submissao_id: string
          texto_extraido?: string | null
          url_arquivo: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          processado_ocr?: boolean
          submissao_id?: string
          texto_extraido?: string | null
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_submissao_id_fkey"
            columns: ["submissao_id"]
            isOneToOne: false
            referencedRelation: "submissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      coordenadores_cursos: {
        Row: {
          created_at: string
          curso_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordenadores_cursos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          carga_horaria_minima: number
          created_at: string
          criado_por_admin_id: string | null
          id: string
          nome: string
        }
        Insert: {
          carga_horaria_minima?: number
          created_at?: string
          criado_por_admin_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          carga_horaria_minima?: number
          created_at?: string
          criado_por_admin_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          curso_id: string | null
          email: string
          id: string
          matricula: string | null
          nome: string
          perfil: Database["public"]["Enums"]["app_perfil"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          curso_id?: string | null
          email: string
          id?: string
          matricula?: string | null
          nome: string
          perfil?: Database["public"]["Enums"]["app_perfil"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          curso_id?: string | null
          email?: string
          id?: string
          matricula?: string | null
          nome?: string
          perfil?: Database["public"]["Enums"]["app_perfil"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_curso"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      regras: {
        Row: {
          area: string
          created_at: string
          curso_id: string
          exige_comprovante: boolean
          id: string
          limite_horas: number
        }
        Insert: {
          area: string
          created_at?: string
          curso_id: string
          exige_comprovante?: boolean
          id?: string
          limite_horas?: number
        }
        Update: {
          area?: string
          created_at?: string
          curso_id?: string
          exige_comprovante?: boolean
          id?: string
          limite_horas?: number
        }
        Relationships: [
          {
            foreignKeyName: "regras_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      submissoes: {
        Row: {
          aluno_id: string
          coordenador_id: string | null
          data_envio: string
          data_validacao: string | null
          descricao: string | null
          horas_solicitadas: number
          id: string
          justificativa: string | null
          regra_id: string | null
          status: string
        }
        Insert: {
          aluno_id: string
          coordenador_id?: string | null
          data_envio?: string
          data_validacao?: string | null
          descricao?: string | null
          horas_solicitadas?: number
          id?: string
          justificativa?: string | null
          regra_id?: string | null
          status?: string
        }
        Update: {
          aluno_id?: string
          coordenador_id?: string | null
          data_envio?: string
          data_validacao?: string | null
          descricao?: string | null
          horas_solicitadas?: number
          id?: string
          justificativa?: string | null
          regra_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissoes_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_perfil"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_perfil"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_perfil"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_perfil"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_perfil: "super_admin" | "coordenador" | "aluno"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_perfil: ["super_admin", "coordenador", "aluno"],
    },
  },
} as const

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ActivityCategory, categoryLabels } from '@/data/mockData';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  courseFilter: string;
  onCourseChange: (value: string) => void;
  courses: string[];
}

const FilterBar = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  courseFilter,
  onCourseChange,
  courses,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por aluno ou atividade..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Categorias</SelectItem>
          {(Object.keys(categoryLabels) as ActivityCategory[]).map((key) => (
            <SelectItem key={key} value={key}>
              {categoryLabels[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={courseFilter} onValueChange={onCourseChange}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Curso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Cursos</SelectItem>
          {courses.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterBar;

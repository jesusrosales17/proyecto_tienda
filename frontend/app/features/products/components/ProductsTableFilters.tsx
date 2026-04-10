import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type ProductsStatusFilter = "active" | "inactive" | "all";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ProductsStatusFilter;
  onStatusFilterChange: (value: ProductsStatusFilter) => void;
}

export const ProductsTableFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: Props) => {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nombre o descripción..."
        className="md:max-w-sm"
      />

      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as ProductsStatusFilter)}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Filtrar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="inactive">Inactivos</SelectItem>
          <SelectItem value="all">Todos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

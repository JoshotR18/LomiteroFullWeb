
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Store } from 'lucide-react';

const StockFilters = ({ searchTerm, onSearchTermChange, selectedBranch, branches, onSelectBranch, disabled }) => (
  <div className="flex flex-col sm:flex-row items-center gap-4">
    <div className="flex items-center space-x-2 flex-1 w-full sm:w-auto">
      <Search className="w-5 h-5 text-muted-foreground" />
      <Input
        placeholder="Buscar items..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="w-full sm:max-w-sm border-border focus:border-primary transition-colors rounded-lg shadow-sm"
        disabled={disabled}
      />
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[280px] justify-between border-border shadow-sm">
          <Store className="w-4 h-4 mr-2 text-muted-foreground" />
          {selectedBranch ? selectedBranch.name : "Seleccionar Sucursal"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full sm:w-[280px]">
        {branches.length > 0 ? branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => onSelectBranch(branch)}
            className={`${selectedBranch?.id === branch.id ? 'bg-muted font-semibold' : ''}`}
          >
            {branch.name}
          </DropdownMenuItem>
        )) : (
          <DropdownMenuItem disabled>No hay sucursales disponibles</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default StockFilters;

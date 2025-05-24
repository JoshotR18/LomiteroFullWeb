
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const BranchSelectorDialog = ({ isOpen, onOpenChange, branches, selectedBranch, onSelectBranch }) => {
  const { toast } = useToast();

  return (
    <Dialog open={isOpen && branches.length > 1} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Seleccionar Sucursal</DialogTitle>
          <DialogDescription className="text-slate-400">
            Elige la sucursal donde deseas realizar tu pedido.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {branches.map((branch) => (
            <Button
              key={branch.id}
              variant={selectedBranch?.id === branch.id ? "default" : "outline"}
              onClick={() => {
                onSelectBranch(branch);
                toast({ title: `Sucursal seleccionada: ${branch.name}`, className: "bg-purple-600 text-white" });
              }}
              className={`w-full justify-start text-left ${selectedBranch?.id === branch.id ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-500 text-purple-300 hover:bg-purple-700 hover:text-white'}`}
            >
              {branch.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchSelectorDialog;

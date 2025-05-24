
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Store, AlertTriangle } from 'lucide-react';

const BranchSelectorDialog = ({ isOpen, onOpenChange, branches, onSelectBranch, currentSelectedBranchId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-700 text-gray-100 shadow-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-purple-300 text-2xl flex items-center">
            <Store className="mr-3 h-6 w-6" />
            Seleccionar Sucursal
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-2">
            {branches.length > 0 
              ? "Elige la sucursal en la que estás trabajando para continuar."
              : "No hay sucursales configuradas."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-6">
          {branches.length > 0 ? (
            <>
              <Label className="text-gray-300 text-sm">Sucursales disponibles:</Label>
              <div className="grid gap-3 max-h-60 overflow-y-auto pr-2">
                {(Array.isArray(branches) ? branches : []).map((branch) => (
                  <Button
                    key={branch.id}
                    onClick={() => onSelectBranch(branch)}
                    className={`w-full justify-start text-lg py-3 transition-all duration-150 ease-in-out transform hover:scale-[1.02] focus:ring-2 focus:ring-purple-500
                                ${currentSelectedBranchId === branch.id 
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-400' 
                                  : 'bg-slate-700 hover:bg-purple-700/50 border-purple-600/50 text-gray-200 hover:text-white'}`}
                    variant="outline"
                  >
                    <Store className="mr-3 h-5 w-5" />
                    {branch.name}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-yellow-400 bg-yellow-500/10 p-4 rounded-md border border-yellow-500/30">
              <AlertTriangle className="mx-auto h-10 w-10 mb-3 text-yellow-500" />
              <p className="font-semibold">No hay sucursales disponibles.</p>
              <p className="text-sm">Por favor, contacta a un administrador para configurar las sucursales.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchSelectorDialog;

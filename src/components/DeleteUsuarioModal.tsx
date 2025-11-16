import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/models/User';

interface DeleteUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: User | null;
  onConfirm: () => void;
}

export const DeleteUsuarioModal = ({
  open,
  onOpenChange,
  usuario,
  onConfirm,
}: DeleteUsuarioModalProps) => {
  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o usuário{' '}
            <strong>{usuario.nome || usuario.username}</strong> ({usuario.email})?
            <br />
            <br />
            Esta ação não pode ser desfeita e todos os dados relacionados a este usuário serão removidos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import { useState } from 'react';
import { useSalas, useCreateSala, useUpdateSala, useDeleteSala } from '@/controllers/useSalas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SalaModal } from '@/components/SalaModal';
import { Sala, SalaFormData } from '@/models/Sala';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const SalasList = () => {
  const { salas, loading, error, refetch } = useSalas(0, 100, false);
  const { handleCreate, loading: creating } = useCreateSala();
  const { handleUpdate, loading: updating } = useUpdateSala();
  const { handleDelete, loading: deleting } = useDeleteSala();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [salaToEdit, setSalaToEdit] = useState<Sala | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salaToDelete, setSalaToDelete] = useState<number | null>(null);

  const handleCreateClick = () => {
    setSalaToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (sala: Sala) => {
    setSalaToEdit(sala);
    setModalOpen(true);
  };

  const handleSave = async (formData: SalaFormData) => {
    let result;
    if (salaToEdit) {
      result = await handleUpdate(salaToEdit.id, formData);
    } else {
      result = await handleCreate(formData);
    }
    
    // Recarrega a lista após salvar
    if (result.success) {
      await refetch();
    }
    
    return result;
  };

  const handleDeleteClick = (salaId: number) => {
    setSalaToDelete(salaId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (salaToDelete) {
      const result = await handleDelete(salaToDelete);
      if (result.success) {
        setDeleteModalOpen(false);
        setSalaToDelete(null);
        // Recarrega a lista após deletar
        await refetch();
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando salas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Erro ao carregar salas: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Salas de Reunião</CardTitle>
          <Button onClick={handleCreateClick}>
            Nova Sala
          </Button>
        </CardHeader>
        <CardContent>
          {salas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma sala encontrada. Clique em "Nova Sala" para criar uma.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salas.map((sala: Sala) => (
                  <TableRow key={sala.id}>
                    <TableCell className="font-medium">{sala.nome}</TableCell>
                    <TableCell>{sala.local}</TableCell>
                    <TableCell>{sala.capacidade || '-'}</TableCell>
                    <TableCell>{sala.descricao || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          sala.ativa
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sala.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(sala.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(sala)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(sala.id)}
                          disabled={deleting}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SalaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        sala={salaToEdit}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


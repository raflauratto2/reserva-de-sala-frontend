import { useNavigate } from 'react-router-dom';
import { useReservas } from '@/controllers/useReservas';
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
import { useState } from 'react';
import { DeleteReservaModal } from '@/components/DeleteReservaModal';
import { useDeleteReserva } from '@/controllers/useReservas';

export const ReservasList = () => {
  const navigate = useNavigate();
  const { reservas, loading, error } = useReservas();
  const { handleDelete } = useDeleteReserva();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    navigate(`/reservas/${id}/editar`);
  };

  const handleDeleteClick = (id: string) => {
    setReservaToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (reservaToDelete) {
      const result = await handleDelete(reservaToDelete);
      if (result.success) {
        setDeleteModalOpen(false);
        setReservaToDelete(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Erro ao carregar reservas: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reservas de Salas</CardTitle>
          <Button onClick={() => navigate('/reservas/nova')}>
            Nova Reserva
          </Button>
        </CardHeader>
        <CardContent>
          {reservas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma reserva encontrada. Clique em "Nova Reserva" para criar uma.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Local</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Café</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservas.map((reserva: any) => (
                  <TableRow key={reserva.id}>
                    <TableCell>{reserva.local}</TableCell>
                    <TableCell>{reserva.sala}</TableCell>
                    <TableCell>
                      {format(new Date(reserva.dataInicio), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(reserva.dataFim), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{reserva.responsavel}</TableCell>
                    <TableCell>
                      {reserva.cafe
                        ? `${reserva.cafe.quantidade} - ${reserva.cafe.descricao}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reserva.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(reserva.id)}
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

      <DeleteReservaModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
};


import { useState, useMemo, useEffect } from 'react';
import { useSalas, useCreateSala, useUpdateSala, useDeleteSala } from '@/controllers/useSalas';
import { useReservas } from '@/controllers/useReservas';
import { useAuthStore } from '@/store/auth-store';
import { useMeuPerfil } from '@/controllers/useMeuPerfil';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SalasList = () => {
  const { salas, loading, error, refetch } = useSalas(0, 100, false);
  const { reservas, loading: loadingReservas } = useReservas(0, 100);
  const { handleCreate, loading: creating } = useCreateSala();
  const { handleUpdate, loading: updating } = useUpdateSala();
  const { handleDelete, loading: deleting } = useDeleteSala();
  const { user, isAdmin } = useAuthStore();
  const { perfil, loading: loadingPerfil, refetch: refetchPerfil } = useMeuPerfil();
  
  // Atualiza o usuário no store quando o perfil é carregado
  useEffect(() => {
    if (perfil && !user) {
      useAuthStore.getState().setUser(perfil);
    } else if (perfil && user && perfil.id === user.id) {
      // Atualiza o usuário se o perfil mudou
      useAuthStore.getState().setUser(perfil);
    }
  }, [perfil, user]);

  // Verifica se o usuário é admin
  const userIsAdmin = isAdmin() || perfil?.admin === true;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [salaToEdit, setSalaToEdit] = useState<Sala | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salaToDelete, setSalaToDelete] = useState<number | null>(null);
  const [horariosModalOpen, setHorariosModalOpen] = useState(false);
  const [salaParaHorarios, setSalaParaHorarios] = useState<Sala | null>(null);

  // Agrupa reservas por salaId
  const reservasPorSala = useMemo(() => {
    const map = new Map<number, any[]>();
    reservas.forEach((reserva: any) => {
      if (reserva.salaId) {
        if (!map.has(reserva.salaId)) {
          map.set(reserva.salaId, []);
        }
        map.get(reserva.salaId)!.push(reserva);
      }
    });
    return map;
  }, [reservas]);

  // Função para obter todas as reservas de uma sala (para o modal)
  const getTodasReservas = (salaId: number) => {
    const reservasSala = reservasPorSala.get(salaId) || [];
    // Ordena por data/hora de início
    return reservasSala.sort((a, b) => 
      new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
    );
  };

  const handleVerHorarios = (sala: Sala) => {
    setSalaParaHorarios(sala);
    setHorariosModalOpen(true);
  };

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

  if (loading || loadingReservas || loadingPerfil) {
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
          {userIsAdmin && (
            <Button onClick={handleCreateClick}>
              Nova Sala
            </Button>
          )}
        </CardHeader>
        {!userIsAdmin && (
          <div className="px-6 pb-4">
            <Alert>
              <AlertDescription>
                Apenas administradores podem criar e gerenciar salas. Entre em contato com um administrador para criar uma nova sala.
              </AlertDescription>
            </Alert>
          </div>
        )}
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
                  <TableHead>Horários Reservados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salas.map((sala: Sala) => {
                  const totalReservas = reservasPorSala.get(sala.id)?.length || 0;
                  
                  return (
                    <TableRow key={sala.id}>
                      <TableCell className="font-medium">{sala.nome}</TableCell>
                      <TableCell>{sala.local}</TableCell>
                      <TableCell>{sala.capacidade || '-'}</TableCell>
                      <TableCell>{sala.descricao || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerHorarios(sala)}
                          disabled={totalReservas === 0}
                        >
                          Horários Reservados
                        </Button>
                      </TableCell>
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
                        {userIsAdmin ? (
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
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {userIsAdmin && (
        <SalaModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={handleSave}
          sala={salaToEdit}
        />
      )}

      {userIsAdmin && (
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
      )}

      <Dialog open={horariosModalOpen} onOpenChange={setHorariosModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Horários Reservados - {salaParaHorarios?.nome}
            </DialogTitle>
            <DialogDescription>
              {salaParaHorarios?.local}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {salaParaHorarios ? (
              (() => {
                const todasReservas = getTodasReservas(salaParaHorarios.id);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                if (todasReservas.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma reserva encontrada para esta sala.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Café</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todasReservas.map((reserva: any) => {
                          const dataInicio = new Date(reserva.dataHoraInicio);
                          const dataFim = new Date(reserva.dataHoraFim);
                          const duracaoMs = dataFim.getTime() - dataInicio.getTime();
                          const duracaoHoras = duracaoMs / (1000 * 60 * 60);

                          return (
                            <TableRow key={reserva.id}>
                              <TableCell>
                                {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                {format(dataInicio, "HH:mm", { locale: ptBR })} - {format(dataFim, "HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                {duracaoHoras}h
                              </TableCell>
                              <TableCell>
                                {reserva.cafeQuantidade && reserva.cafeDescricao
                                  ? `${reserva.cafeQuantidade} - ${reserva.cafeDescricao}`
                                  : reserva.cafeQuantidade
                                  ? `${reserva.cafeQuantidade}`
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="text-sm text-muted-foreground text-center">
                      Total: {todasReservas.length} reserva(s)
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8">Carregando...</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHorariosModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


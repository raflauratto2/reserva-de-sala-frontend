import { useState, useMemo, useEffect } from 'react';
import { useSalas, useCreateSala, useUpdateSala, useDeleteSala } from '@/controllers/useSalas';
import { useReservas } from '@/controllers/useReservas';
import { useAuthStore } from '@/store/auth-store';
import { useMeuPerfil } from '@/controllers/useMeuPerfil';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/components/ui/toast';

export const SalasList = () => {
  const { showToast, ToastContainer } = useToast();
  const { salas, loading, error, refetch } = useSalas(0, 100, false);
  const { reservas, loading: loadingReservas } = useReservas(0, 100);
  const { handleCreate } = useCreateSala();
  const { handleUpdate } = useUpdateSala();
  const { handleDelete, loading: deleting } = useDeleteSala();
  const { user, isAdmin } = useAuthStore();
  const { perfil, loading: loadingPerfil } = useMeuPerfil();
  
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
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'ativa' | 'inativa'>('todas');

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

  // Filtra salas
  const salasFiltradas = useMemo(() => {
    return salas.filter((sala: Sala) => {
      // Filtro por nome
      if (filtroNome && !sala.nome.toLowerCase().includes(filtroNome.toLowerCase())) {
        return false;
      }
      // Filtro por local
      if (filtroLocal && !sala.local.toLowerCase().includes(filtroLocal.toLowerCase())) {
        return false;
      }
      // Filtro por status
      if (filtroStatus === 'ativa' && !sala.ativa) {
        return false;
      }
      if (filtroStatus === 'inativa' && sala.ativa) {
        return false;
      }
      return true;
    });
  }, [salas, filtroNome, filtroLocal, filtroStatus]);

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
        showToast({ message: 'Sala excluída com sucesso!', variant: 'success' });
        setDeleteModalOpen(false);
        setSalaToDelete(null);
        // Recarrega a lista após deletar
        await refetch();
      } else {
        showToast({ message: result.error || 'Erro ao excluir sala', variant: 'destructive' });
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
          {/* Filtros */}
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Nome</label>
                <Input
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Local</label>
                <Input
                  placeholder="Buscar por local..."
                  value={filtroLocal}
                  onChange={(e) => setFiltroLocal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as 'todas' | 'ativa' | 'inativa')}
                >
                  <option value="todas">Todas</option>
                  <option value="ativa">Apenas Ativas</option>
                  <option value="inativa">Apenas Inativas</option>
                </select>
              </div>
            </div>
            {(filtroNome || filtroLocal || filtroStatus !== 'todas') && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltroNome('');
                    setFiltroLocal('');
                    setFiltroStatus('todas');
                  }}
                >
                  Limpar Filtros
                </Button>
                <span className="text-sm text-muted-foreground">
                  {salasFiltradas.length} de {salas.length} sala(s)
                </span>
              </div>
            )}
          </div>

          {salasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {salas.length === 0
                ? 'Nenhuma sala encontrada. Clique em "Nova Sala" para criar uma.'
                : 'Nenhuma sala encontrada com os filtros aplicados.'}
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
                {salasFiltradas.map((sala: Sala) => {
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
      <ToastContainer />
    </div>
  );
};


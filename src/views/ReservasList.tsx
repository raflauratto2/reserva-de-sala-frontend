import { useNavigate, useLocation } from 'react-router-dom';
import { useReservas } from '@/controllers/useReservas';
import { useSalas } from '@/controllers/useSalas';
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
import { useState, useEffect, useMemo } from 'react';
import { DeleteReservaModal } from '@/components/DeleteReservaModal';
import { useDeleteReserva } from '@/controllers/useReservas';
import { useToast } from '@/components/ui/toast';
import { Sala } from '@/models/Sala';
import { useAuthStore } from '@/store/auth-store';

export const ReservasList = () => {
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { reservas, loading, error, refetch } = useReservas();
  const { salas, loading: loadingSalas } = useSalas(0, 100, false); // Carrega todas as salas
  const { handleDelete } = useDeleteReserva();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState<string | null>(null);
  
  // Filtros
  const [filtroSala, setFiltroSala] = useState<number | ''>('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');

  // Recarrega a lista quando voltar para esta rota (após criar/editar reserva)
  useEffect(() => {
    if (location.pathname === '/reservas') {
      refetch();
    }
  }, [location.pathname, refetch]);

  // Cria um mapa de salas por ID para busca rápida
  const salasMap = useMemo(() => {
    const map = new Map<number, Sala>();
    salas.forEach((sala: Sala) => {
      map.set(sala.id, sala);
    });
    return map;
  }, [salas]);

  // Função auxiliar para obter informações da sala
  const getSalaInfo = (reserva: any) => {
    if (reserva.salaId && salasMap.has(reserva.salaId)) {
      const sala = salasMap.get(reserva.salaId)!;
      return {
        nome: sala.nome,
        local: sala.local,
      };
    }
    // Fallback para dados antigos que podem ter apenas string
    return {
      nome: reserva.sala || '-',
      local: reserva.local || '-',
    };
  };

  // Filtra reservas
  const reservasFiltradas = useMemo(() => {
    return reservas.filter((reserva: any) => {
      const salaInfo = getSalaInfo(reserva);
      
      // Filtro por sala
      if (filtroSala !== '' && reserva.salaId !== filtroSala) {
        return false;
      }
      
      // Filtro por data
      if (filtroData) {
        const reservaData = new Date(reserva.dataHoraInicio).toISOString().split('T')[0];
        if (reservaData !== filtroData) {
          return false;
        }
      }
      
      // Filtro por responsável
      if (filtroResponsavel) {
        const responsavelNome = reserva.responsavel?.nome?.toLowerCase() || '';
        const responsavelUsername = reserva.responsavel?.username?.toLowerCase() || '';
        const busca = filtroResponsavel.toLowerCase();
        if (!responsavelNome.includes(busca) && !responsavelUsername.includes(busca)) {
          return false;
        }
      }
      
      // Filtro por local
      if (filtroLocal && !salaInfo.local.toLowerCase().includes(filtroLocal.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [reservas, filtroSala, filtroData, filtroResponsavel, filtroLocal, salasMap]);

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
        showToast({ message: 'Reserva excluída com sucesso!', variant: 'success' });
        setDeleteModalOpen(false);
        setReservaToDelete(null);
        // Recarrega a lista após deletar
        await refetch();
      } else {
        showToast({ message: result.error || 'Erro ao excluir reserva', variant: 'destructive' });
      }
    }
  };

  // Não bloqueia o carregamento se a query de usuários falhar
  if (loading || loadingSalas) {
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
          {/* Filtros */}
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Sala</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={filtroSala}
                  onChange={(e) => setFiltroSala(e.target.value === '' ? '' : parseInt(e.target.value))}
                >
                  <option value="">Todas as salas</option>
                  {salas.map((sala: Sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nome} - {sala.local}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Data</label>
                <Input
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Responsável</label>
                <Input
                  placeholder="Nome ou username..."
                  value={filtroResponsavel}
                  onChange={(e) => setFiltroResponsavel(e.target.value)}
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
            </div>
            {(filtroSala !== '' || filtroData || filtroResponsavel || filtroLocal) && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltroSala('');
                    setFiltroData('');
                    setFiltroResponsavel('');
                    setFiltroLocal('');
                  }}
                >
                  Limpar Filtros
                </Button>
                <span className="text-sm text-muted-foreground">
                  {reservasFiltradas.length} de {reservas.length} reserva(s)
                </span>
              </div>
            )}
          </div>

          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {reservas.length === 0
                ? 'Nenhuma reserva encontrada. Clique em "Nova Reserva" para criar uma.'
                : 'Nenhuma reserva encontrada com os filtros aplicados.'}
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
                {reservasFiltradas.map((reserva: any) => {
                  const salaInfo = getSalaInfo(reserva);
                  return (
                    <TableRow key={reserva.id}>
                      <TableCell>{salaInfo.local}</TableCell>
                      <TableCell>{salaInfo.nome}</TableCell>
                      <TableCell>
                        {format(new Date(reserva.dataHoraInicio), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(reserva.dataHoraFim), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {reserva.responsavel
                          ? reserva.responsavel.nome || reserva.responsavel.username
                          : `ID: ${reserva.responsavelId}`}
                      </TableCell>
                      <TableCell>
                        {reserva.cafeQuantidade && reserva.cafeDescricao
                          ? `${reserva.cafeQuantidade} - ${reserva.cafeDescricao}`
                          : reserva.cafeQuantidade
                          ? `${reserva.cafeQuantidade}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {user && reserva.responsavelId === user.id && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(reserva.id.toString())}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(reserva.id.toString())}
                            >
                              Excluir
                            </Button>
                          </div>
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

      <DeleteReservaModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
      />
      <ToastContainer />
    </div>
  );
};


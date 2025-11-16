import { useNavigate, useLocation } from 'react-router-dom';
import { useReservas } from '@/controllers/useReservas';
import { useSalas } from '@/controllers/useSalas';
import { useUsuarios } from '@/controllers/useUsuarios';
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
import { useState, useEffect, useMemo } from 'react';
import { DeleteReservaModal } from '@/components/DeleteReservaModal';
import { useDeleteReserva } from '@/controllers/useReservas';
import { Sala } from '@/models/Sala';
import { User } from '@/models/User';

export const ReservasList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reservas, loading, error, refetch } = useReservas();
  const { salas, loading: loadingSalas } = useSalas(0, 100, false); // Carrega todas as salas
  const { usuarios, loading: loadingUsuarios, error: errorUsuarios } = useUsuarios(0, 100); // Carrega todos os usuários
  const { handleDelete } = useDeleteReserva();
  
  // Log para debug
  useEffect(() => {
    if (errorUsuarios) {
      console.error('Erro ao carregar usuários:', errorUsuarios);
      console.error('Detalhes do erro:', {
        message: errorUsuarios.message,
        graphQLErrors: errorUsuarios.graphQLErrors,
        networkError: errorUsuarios.networkError,
      });
    }
    if (usuarios.length > 0) {
      console.log('Usuários carregados com sucesso:', usuarios.length);
    } else if (!loadingUsuarios && !errorUsuarios) {
      console.warn('Nenhum usuário carregado, mas não há erro. Verifique se a query "usuarios" existe no backend.');
    }
  }, [errorUsuarios, usuarios, loadingUsuarios]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState<string | null>(null);

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

  // Cria um mapa de usuários por ID para busca rápida
  const usuariosMap = useMemo(() => {
    const map = new Map<number, User>();
    usuarios.forEach((usuario: User) => {
      map.set(usuario.id, usuario);
    });
    console.log('Mapa de usuários criado:', map.size, 'usuários');
    return map;
  }, [usuarios]);

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
        // Recarrega a lista após deletar
        await refetch();
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
  
  // Avisa se a query de usuários falhou, mas continua mostrando as reservas
  if (errorUsuarios) {
    console.warn('Não foi possível carregar usuários. Os nomes dos responsáveis podem não aparecer.');
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
                {reservas.map((reserva: any) => {
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
                        {(() => {
                          const responsavel = usuariosMap.get(reserva.responsavelId);
                          if (responsavel) {
                            // Prioriza nome, depois username
                            return responsavel.nome || responsavel.username || `ID: ${reserva.responsavelId}`;
                          }
                          // Se não encontrou no mapa, mostra apenas o ID
                          return `ID: ${reserva.responsavelId}`;
                        })()}
                      </TableCell>
                      <TableCell>
                        {reserva.cafeQuantidade && reserva.cafeDescricao
                          ? `${reserva.cafeQuantidade} - ${reserva.cafeDescricao}`
                          : reserva.cafeQuantidade
                          ? `${reserva.cafeQuantidade}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
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
    </div>
  );
};


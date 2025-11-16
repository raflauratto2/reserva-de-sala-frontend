import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeuHistorico } from '@/controllers/useParticipantes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO, isBefore, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pagination } from '@/components/Pagination';
import { useSalas } from '@/controllers/useSalas';

export const Historico = () => {
  const navigate = useNavigate();
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Filtros
  const [filtroSala, setFiltroSala] = useState<number | ''>('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'passadas' | 'futuras'>('todos');
  const [filtroPapel, setFiltroPapel] = useState<'todos' | 'responsavel' | 'participante'>('todos');
  
  // Determina parâmetros da query baseado no filtro de tipo
  const apenasFuturas = filtroTipo === 'futuras';
  const apenasPassadas = filtroTipo === 'passadas';
  
  // Carrega dados usando a query meuHistorico
  const { historico, loading: loadingHistorico } = useMeuHistorico(apenasFuturas, apenasPassadas, 0, 1000);
  const { salas, loading: loadingSalas } = useSalas(0, 100, false);
  
  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroSala, filtroData, filtroTipo, filtroPapel]);
  
  // Filtra reservas no frontend (sala, data, papel)
  const reservasFiltradas = useMemo(() => {
    return historico.filter((item) => {
      const reserva = item.reserva;
      
      // Filtro por sala
      if (filtroSala && reserva.salaId !== filtroSala) {
        return false;
      }
      
      // Filtro por data
      if (filtroData) {
        const dataReserva = format(parseISO(reserva.dataHoraInicio), 'yyyy-MM-dd');
        if (dataReserva !== filtroData) {
          return false;
        }
      }
      
      // Filtro por papel
      if (filtroPapel !== 'todos') {
        if (filtroPapel === 'responsavel' && !item.souResponsavel) {
          return false;
        }
        if (filtroPapel === 'participante' && item.souResponsavel) {
          return false;
        }
      }
      
      return true;
    });
  }, [historico, filtroSala, filtroData, filtroPapel]);
  
  // Paginação
  const totalItems = reservasFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const reservasPaginadas = reservasFiltradas.slice(startIndex, endIndex);
  
  // Função auxiliar para obter nome da sala
  const getNomeSala = (reserva: any) => {
    if (reserva.salaRel?.nome) {
      return reserva.salaRel.nome;
    }
    if (reserva.salaId) {
      const sala = salas.find((s: any) => s.id === reserva.salaId);
      return sala?.nome || `Sala ${reserva.salaId}`;
    }
    return reserva.sala || 'N/A';
  };
  
  const loading = loadingHistorico || loadingSalas;
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando histórico...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Histórico de Reuniões</h1>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sala</label>
              <select
                value={filtroSala}
                onChange={(e) => setFiltroSala(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todas as salas</option>
                {salas.map((sala: any) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Data</label>
              <Input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'passadas' | 'futuras')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="todos">Todas</option>
                <option value="passadas">Passadas</option>
                <option value="futuras">Futuras</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Papel</label>
              <select
                value={filtroPapel}
                onChange={(e) => setFiltroPapel(e.target.value as 'todos' | 'responsavel' | 'participante')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="todos">Todos</option>
                <option value="responsavel">Responsável</option>
                <option value="participante">Participante</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de Reservas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reuniões ({reservasFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma reunião encontrada
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sala</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Café</TableHead>
                      <TableHead>Link Meet</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasPaginadas.map((item) => {
                      const reserva = item.reserva;
                      const dataInicio = parseISO(reserva.dataHoraInicio);
                      const dataFim = parseISO(reserva.dataHoraFim);
                      const hoje = startOfToday();
                      const isPassada = isBefore(dataInicio, hoje);
                      
                      return (
                        <TableRow key={reserva.id}>
                          <TableCell className="font-medium">
                            {getNomeSala(reserva)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(dataInicio, "HH:mm", { locale: ptBR })} - {format(dataFim, "HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {reserva.responsavel?.nome || reserva.responsavel?.username || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.souResponsavel
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.souResponsavel ? 'Responsável' : 'Participante'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {reserva.cafeQuantidade ? (
                              <div>
                                <div>{reserva.cafeQuantidade} un.</div>
                                {reserva.cafeDescricao && (
                                  <div className="text-xs text-muted-foreground">
                                    {reserva.cafeDescricao}
                                  </div>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {reserva.linkMeet ? (
                              <a
                                href={reserva.linkMeet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Acessar
                              </a>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {!isPassada && item.souResponsavel && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/reservas/${reserva.id}/editar`)}
                              >
                                Editar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {reservasFiltradas.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


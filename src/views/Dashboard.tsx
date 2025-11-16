import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservas } from '@/controllers/useReservas';
import { useSalas } from '@/controllers/useSalas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfToday, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { reservas, loading: loadingReservas } = useReservas(0, 1000);
  const { salas, loading: loadingSalas } = useSalas(0, 1000, false);

  // Estatísticas de Salas
  const statsSalas = useMemo(() => {
    const total = salas.length;
    const ativas = salas.filter((s: any) => s.ativa).length;
    const inativas = total - ativas;
    return { total, ativas, inativas };
  }, [salas]);

  // Estatísticas de Reservas
  const statsReservas = useMemo(() => {
    const hoje = startOfToday();
    const fimSemana = addDays(hoje, 7);
    
    const total = reservas.length;
    const hojeCount = reservas.filter((r: any) => {
      const dataInicio = parseISO(r.dataHoraInicio);
      return format(dataInicio, 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd');
    }).length;
    
    const semanaCount = reservas.filter((r: any) => {
      const dataInicio = parseISO(r.dataHoraInicio);
      return isAfter(dataInicio, hoje) && isBefore(dataInicio, fimSemana);
    }).length;

    return { total, hoje: hojeCount, semana: semanaCount };
  }, [reservas]);

  // Próximos dias livres (dias sem reservas)
  const proximosDiasLivres = useMemo(() => {
    const hoje = startOfToday();
    const diasLivres: { data: Date; diaSemana: string; disponivel: boolean }[] = [];
    
    // Verifica os próximos 14 dias
    for (let i = 1; i <= 14; i++) {
      const data = addDays(hoje, i);
      const dataStr = format(data, 'yyyy-MM-dd');
      
      // Verifica se há reservas neste dia
      const temReservas = reservas.some((r: any) => {
        const dataReserva = format(parseISO(r.dataHoraInicio), 'yyyy-MM-dd');
        return dataReserva === dataStr;
      });
      
      diasLivres.push({
        data,
        diaSemana: format(data, 'EEEE', { locale: ptBR }),
        disponivel: !temReservas,
      });
    }
    
    // Retorna apenas os próximos 5 dias livres
    return diasLivres.filter(d => d.disponivel).slice(0, 5);
  }, [reservas]);

  // Reservas por sala (top 5)
  const reservasPorSala = useMemo(() => {
    const mapa = new Map<number, { nome: string; count: number }>();
    
    reservas.forEach((r: any) => {
      if (r.salaId) {
        const sala = salas.find((s: any) => s.id === r.salaId);
        const nome = sala ? sala.nome : `Sala ${r.salaId}`;
        const atual = mapa.get(r.salaId) || { nome, count: 0 };
        mapa.set(r.salaId, { nome, count: atual.count + 1 });
      }
    });
    
    return Array.from(mapa.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reservas, salas]);

  if (loadingReservas || loadingSalas) {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6">
        <div className="text-center text-sm sm:text-base">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Card: Total de Salas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Salas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsSalas.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {statsSalas.ativas} ativas, {statsSalas.inativas} inativas
            </div>
          </CardContent>
        </Card>

        {/* Card: Total de Reservas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsReservas.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {statsReservas.hoje} hoje, {statsReservas.semana} esta semana
            </div>
          </CardContent>
        </Card>

        {/* Card: Salas Ativas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Salas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsSalas.ativas}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {statsSalas.total > 0 
                ? `${Math.round((statsSalas.ativas / statsSalas.total) * 100)}% do total`
                : '0% do total'}
            </div>
          </CardContent>
        </Card>

        {/* Card: Reservas Hoje */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reservas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsReservas.hoje}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {format(startOfToday(), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Gráfico: Salas (Ativas vs Inativas) */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Salas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Salas Ativas</span>
                  <span className="font-semibold">{statsSalas.ativas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{
                      width: `${statsSalas.total > 0 ? (statsSalas.ativas / statsSalas.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Salas Inativas</span>
                  <span className="font-semibold">{statsSalas.inativas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full"
                    style={{
                      width: `${statsSalas.total > 0 ? (statsSalas.inativas / statsSalas.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico: Top 5 Salas com Mais Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Salas Mais Reservadas</CardTitle>
          </CardHeader>
          <CardContent>
            {reservasPorSala.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma reserva encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {reservasPorSala.map((item, index) => {
                  const maxCount = reservasPorSala[0]?.count || 1;
                  const porcentagem = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="truncate">{item.nome}</span>
                        <span className="font-semibold ml-2">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${porcentagem}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Dias Livres */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Dias Livres</CardTitle>
        </CardHeader>
        <CardContent>
          {proximosDiasLivres.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Não há dias livres nos próximos 14 dias
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {proximosDiasLivres.map((dia, index) => {
                const dataFormatada = format(dia.data, 'yyyy-MM-dd');
                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 text-center bg-green-50 border-green-200 flex flex-col"
                  >
                    <div className="text-sm font-medium text-green-800 capitalize">
                      {dia.diaSemana}
                    </div>
                    <div className="text-lg font-bold text-green-900 mt-1">
                      {format(dia.data, 'dd/MM', { locale: ptBR })}
                    </div>
                    <div className="text-xs text-green-600 mt-1 mb-3">
                      Disponível
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/reservas/nova?data=${dataFormatada}`)}
                      className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                    >
                      Reservar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


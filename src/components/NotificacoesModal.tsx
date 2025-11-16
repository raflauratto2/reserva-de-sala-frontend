import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMinhasReservasConvidadas, useMarcarReservaComoVista } from '@/controllers/useParticipantes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToastContext } from '@/contexts/ToastContext';

interface NotificacoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificacaoMarcadaComoVista?: () => void;
}

export const NotificacoesModal = ({ open, onOpenChange, onNotificacaoMarcadaComoVista }: NotificacoesModalProps) => {
  const { showToast } = useToastContext();
  const { reservasConvidadas, loading, refetch } = useMinhasReservasConvidadas(false, true); // Apenas não vistas
  const { handleMarcar: marcarComoVistaMutation, loading: loadingMarcar } = useMarcarReservaComoVista();

  // Recarrega notificações quando o modal abre
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const handleMarcarComoVista = async (reservaId: number) => {
    const result = await marcarComoVistaMutation(reservaId);
    if (result.success) {
      await refetch();
      // Atualiza o contador no Layout
      if (onNotificacaoMarcadaComoVista) {
        onNotificacaoMarcadaComoVista();
      }
    } else {
      showToast({ message: result.error || 'Erro ao marcar notificação', variant: 'destructive' });
    }
  };

  const handleClickNotificacao = async (reservaId: number) => {
    // Marca como vista quando o usuário clica na notificação
    await handleMarcarComoVista(reservaId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notificações de Reservas</DialogTitle>
          <DialogDescription>
            Você foi convidado para as seguintes reservas:
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando notificações...
            </div>
          ) : reservasConvidadas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma notificação pendente.
            </div>
          ) : (
            reservasConvidadas.map((item) => {
              const reserva = item.reserva;
              if (!reserva) return null;

              const dataInicio = new Date(reserva.dataHoraInicio);
              const dataFim = new Date(reserva.dataHoraFim);

              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleClickNotificacao(reserva.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {reserva.salaRel?.nome || reserva.sala || 'Sala não especificada'}
                      </h4>
                      {reserva.salaRel?.local && (
                        <p className="text-sm text-muted-foreground">{reserva.salaRel.local}</p>
                      )}
                      {!reserva.salaRel?.local && reserva.local && (
                        <p className="text-sm text-muted-foreground">{reserva.local}</p>
                      )}
                    </div>
                    {!item.visto && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Nova
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Data/Hora:</span>{' '}
                      {format(dataInicio, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} -{' '}
                      {format(dataFim, "HH:mm", { locale: ptBR })}
                    </p>
                    {reserva.responsavel && (
                      <p>
                        <span className="font-medium">Responsável:</span>{' '}
                        {reserva.responsavel.nome || reserva.responsavel.username}
                      </p>
                    )}
                    {reserva.cafeQuantidade && (
                      <p>
                        <span className="font-medium">Café:</span> {reserva.cafeQuantidade}
                        {reserva.cafeDescricao && ` - ${reserva.cafeDescricao}`}
                      </p>
                    )}
                    {reserva.linkMeet && (
                      <p>
                        <span className="font-medium">Link Meet:</span>{' '}
                        <a
                          href={reserva.linkMeet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {reserva.linkMeet}
                        </a>
                      </p>
                    )}
                  </div>

                  {!item.visto && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarcarComoVista(reserva.id);
                        }}
                        disabled={loadingMarcar}
                      >
                        Marcar como Vista
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


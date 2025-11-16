import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCreateReserva, useUpdateReserva, useReserva, useHorariosDisponiveisPorHora } from '@/controllers/useReservas';
import { useSalas } from '@/controllers/useSalas';
import { useUsuariosNaoAdmin, useAdicionarParticipante, useRemoverParticipante, useParticipantesReserva } from '@/controllers/useParticipantes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { ReservaFormData } from '@/models/Reserva';
import { Sala } from '@/models/Sala';
import { User } from '@/models/User';

export const ReservaForm = () => {
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const { reserva, loading: loadingReserva } = useReserva(id || '');
  const { handleCreate, loading: creating } = useCreateReserva();
  const { handleUpdate, loading: updating } = useUpdateReserva();
  const { salas, loading: loadingSalas } = useSalas(0, 100, true); // Apenas salas ativas

  const [salaSelecionada, setSalaSelecionada] = useState<number | null>(null);
  const [data, setData] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [cafeQuantidade, setCafeQuantidade] = useState<number | ''>('');
  const [cafeDescricao, setCafeDescricao] = useState('');
  const [linkMeet, setLinkMeet] = useState('');
  const [participantesSelecionados, setParticipantesSelecionados] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState('');

  // Busca usuários não-admin para seleção de participantes
  const { usuarios, loading: loadingUsuarios } = useUsuariosNaoAdmin();
  const { handleAdd: adicionarParticipante, loading: loadingAddParticipante } = useAdicionarParticipante();
  const { handleRemove: removerParticipante } = useRemoverParticipante();
  
  // Busca participantes existentes ao editar
  const { participantes: participantesExistentes, refetch: refetchParticipantes } = useParticipantesReserva(isEdit ? parseInt(id || '0') : null);

  // Busca horários disponíveis quando sala e data são selecionados
  const { horarios, loading: loadingHorarios, refetch: refetchHorarios } = useHorariosDisponiveisPorHora(
    salaSelecionada,
    data,
    '08:00:00',
    '18:00:00'
  );

  // Carrega dados da reserva ao editar
  useEffect(() => {
    if (isEdit && reserva) {
      setSalaSelecionada(reserva.salaId || null);
      const dataInicio = new Date(reserva.dataHoraInicio);
      setData(dataInicio.toISOString().split('T')[0]);
      const hora = dataInicio.toTimeString().slice(0, 5); // HH:MM
      setHoraSelecionada(hora);
      setCafeQuantidade(reserva.cafeQuantidade || '');
      setCafeDescricao(reserva.cafeDescricao || '');
      setLinkMeet(reserva.linkMeet || '');
    }
  }, [isEdit, reserva]);

  // Carrega data da URL quando criar nova reserva
  useEffect(() => {
    if (!isEdit) {
      const dataParam = searchParams.get('data');
      if (dataParam) {
        setData(dataParam);
      }
    }
  }, [isEdit, searchParams]);

  // Carrega participantes existentes ao editar
  useEffect(() => {
    if (isEdit && participantesExistentes.length > 0) {
      const ids = participantesExistentes.map(p => p.usuarioId);
      setParticipantesSelecionados(ids);
    }
  }, [isEdit, participantesExistentes]);

  // Recarrega horários quando sala ou data mudam
  useEffect(() => {
    if (salaSelecionada && data) {
      refetchHorarios();
      setHoraSelecionada(null); // Limpa seleção de horário ao mudar sala/data
    }
  }, [salaSelecionada, data, refetchHorarios]);

  const validate = (): boolean => {
    if (!salaSelecionada) {
      setSubmitError('Selecione uma sala');
      return false;
    }
    if (!data) {
      setSubmitError('Selecione uma data');
      return false;
    }
    if (!horaSelecionada) {
      setSubmitError('Selecione um horário');
      return false;
    }
    if (cafeQuantidade !== '' && (isNaN(Number(cafeQuantidade)) || Number(cafeQuantidade) < 1)) {
      setSubmitError('Quantidade de café deve ser um número maior que zero');
      return false;
    }
    if (cafeQuantidade !== '' && !cafeDescricao.trim()) {
      setSubmitError('Descrição do café é obrigatória quando quantidade é informada');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    try {
      const formData: ReservaFormData = {
        salaId: salaSelecionada!,
        data,
        hora: horaSelecionada!,
        ...(cafeQuantidade !== '' && { cafeQuantidade: Number(cafeQuantidade) }),
        ...(cafeDescricao && { cafeDescricao }),
        ...(linkMeet && { linkMeet }),
      };

      let result;
      if (isEdit) {
        result = await handleUpdate(parseInt(id!), formData);
      } else {
        result = await handleCreate(formData);
      }

      if (result.success) {
        const reservaId = result.data?.id || (isEdit ? parseInt(id!) : null);
        
        if (reservaId) {
          if (isEdit) {
            // Atualiza participantes ao editar
            const participantesAtuais = participantesExistentes.map(p => p.usuarioId);
            const paraAdicionar = participantesSelecionados.filter(id => !participantesAtuais.includes(id));
            const paraRemover = participantesAtuais.filter(id => !participantesSelecionados.includes(id));
            
            // Remove participantes que foram desmarcados
            for (const usuarioId of paraRemover) {
              await removerParticipante(reservaId, usuarioId);
            }
            
            // Adiciona novos participantes
            for (const usuarioId of paraAdicionar) {
              await adicionarParticipante(reservaId, usuarioId);
            }
          } else {
            // Adiciona participantes após criar a reserva
            if (participantesSelecionados.length > 0) {
              for (const usuarioId of participantesSelecionados) {
                await adicionarParticipante(reservaId, usuarioId);
              }
            }
          }
        }
        
        showToast({
          message: isEdit ? 'Reserva atualizada com sucesso!' : 'Reserva criada com sucesso!',
          variant: 'success',
        });
        navigate('/reservas');
      } else {
        const errorMessage = result.error || 'Erro ao salvar reserva';
        let displayMessage = errorMessage;
        
        if (result.graphQLErrors && result.graphQLErrors.length > 0) {
          const graphQLError = result.graphQLErrors[0];
          const message = graphQLError.message || errorMessage;
          
          if (message.toLowerCase().includes('conflito') || 
              message.toLowerCase().includes('conflit') ||
              message.toLowerCase().includes('já existe') ||
              message.toLowerCase().includes('already exists')) {
            displayMessage = 'Conflito de horário: Já existe uma reserva neste período para esta sala.';
          } else {
            displayMessage = message;
          }
        }
        
        setSubmitError(displayMessage);
        showToast({ message: displayMessage, variant: 'destructive' });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao salvar reserva';
      setSubmitError(errorMsg);
      showToast({ message: errorMsg, variant: 'destructive' });
    }
  };

  const loading = creating || updating || loadingReserva || loadingSalas;

  // Data mínima é hoje
  const hoje = new Date().toISOString().split('T')[0];

  // Gera lista de horários de 08:00 a 17:00
  const todosHorarios = Array.from({ length: 10 }, (_, i) => {
    const hora = 8 + i;
    return `${String(hora).padStart(2, '0')}:00`;
  });

  if (isEdit && loadingReserva) {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6">
        <div className="text-center text-sm sm:text-base">Carregando reserva...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-4xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">{isEdit ? 'Editar Reserva' : 'Nova Reserva'}</CardTitle>
          <CardDescription>
            {isEdit
              ? 'Atualize as informações da reserva'
              : 'Selecione a sala, data e horário para criar uma nova reserva'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            {submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Seleção de Sala */}
            <FormItem>
              <FormLabel htmlFor="sala">
                Sala <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <select
                  id="sala"
                  value={salaSelecionada || ''}
                  onChange={(e) => {
                    setSalaSelecionada(e.target.value ? parseInt(e.target.value) : null);
                    setHoraSelecionada(null);
                  }}
                  disabled={loading || loadingSalas}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">-- Selecione uma sala --</option>
                  {salas.map((sala: Sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nome} - {sala.local}
                      {sala.capacidade && ` (${sala.capacidade} pessoas)`}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>

            {/* Seleção de Data */}
            <FormItem>
              <FormLabel htmlFor="data">
                Data <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => {
                    setData(e.target.value);
                    setHoraSelecionada(null);
                  }}
                  min={hoje}
                  disabled={loading}
                  required
                />
              </FormControl>
            </FormItem>

            {/* Horários Disponíveis */}
            {salaSelecionada && data && (
              <FormItem>
                <FormLabel>
                  Horário Disponível <span className="text-destructive">*</span>
                </FormLabel>
                {loadingHorarios ? (
                  <div className="text-sm text-muted-foreground py-4">Carregando horários disponíveis...</div>
                ) : horarios.length === 0 ? (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Não há horários disponíveis para esta sala nesta data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                    {todosHorarios.map((hora) => {
                      const disponivel = horarios.includes(hora);
                      const selecionado = horaSelecionada === hora;
                      const horaFim = `${String(parseInt(hora.split(':')[0]) + 1).padStart(2, '0')}:00`;

                      return (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => {
                            if (disponivel) {
                              setHoraSelecionada(hora);
                            }
                          }}
                          disabled={!disponivel || loading}
                          className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${
                              selecionado
                                ? 'bg-primary text-primary-foreground'
                                : disponivel
                                ? 'bg-background border-2 border-input hover:bg-accent hover:text-accent-foreground cursor-pointer'
                                : 'bg-muted text-muted-foreground border-2 border-muted cursor-not-allowed opacity-50'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {hora} - {horaFim}
                        </button>
                      );
                    })}
                  </div>
                )}
                {horaSelecionada && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Horário selecionado: {horaSelecionada} - {`${String(parseInt(horaSelecionada.split(':')[0]) + 1).padStart(2, '0')}:00`}
                  </p>
                )}
              </FormItem>
            )}

            {/* Seleção de Participantes */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-4">Participantes (Opcional)</h3>
              {loadingUsuarios ? (
                <div className="text-sm text-muted-foreground py-2">Carregando usuários...</div>
              ) : usuarios.length === 0 ? (
                <Alert className="mt-2">
                  <AlertDescription>
                    Nenhum usuário disponível para convidar.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <FormLabel>Selecione os participantes:</FormLabel>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                    {usuarios.map((usuario: User) => (
                      <label
                        key={usuario.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={participantesSelecionados.includes(usuario.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParticipantesSelecionados([...participantesSelecionados, usuario.id]);
                            } else {
                              setParticipantesSelecionados(
                                participantesSelecionados.filter(id => id !== usuario.id)
                              );
                            }
                          }}
                          disabled={loading}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          {usuario.nome || usuario.username} ({usuario.email})
                        </span>
                      </label>
                    ))}
                  </div>
                  {participantesSelecionados.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {participantesSelecionados.length} participante(s) selecionado(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Link Meet */}
            <div className="border-t pt-4 mt-4">
              <FormItem>
                <FormLabel htmlFor="linkMeet">Link Meet (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    id="linkMeet"
                    type="url"
                    value={linkMeet}
                    onChange={(e) => setLinkMeet(e.target.value)}
                    disabled={loading}
                    placeholder="https://meet.google.com/abc-defg-hij"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            {/* Opções de Café */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-4">Opções de Café (Opcional)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormItem>
                  <FormLabel htmlFor="cafeQuantidade">Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      id="cafeQuantidade"
                      type="number"
                      min="1"
                      value={cafeQuantidade}
                      onChange={(e) =>
                        setCafeQuantidade(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      disabled={loading}
                      placeholder="0"
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="cafeDescricao">Descrição</FormLabel>
                  <FormControl>
                    <Input
                      id="cafeDescricao"
                      value={cafeDescricao}
                      onChange={(e) => setCafeDescricao(e.target.value)}
                      disabled={loading}
                      placeholder="Ex: Café expresso, Cappuccino"
                    />
                  </FormControl>
                </FormItem>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/reservas')}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading
                  ? isEdit
                    ? 'Salvando...'
                    : 'Criando...'
                  : isEdit
                  ? 'Salvar'
                  : 'Criar Reserva'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

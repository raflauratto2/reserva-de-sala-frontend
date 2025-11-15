import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateReserva, useUpdateReserva, useReserva } from '@/controllers/useReservas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ReservaFormData } from '@/models/Reserva';

export const ReservaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { reserva, loading: loadingReserva } = useReserva(id || '');
  const { handleCreate, loading: creating } = useCreateReserva();
  const { handleUpdate, loading: updating } = useUpdateReserva();

  const [formData, setFormData] = useState<ReservaFormData>({
    local: '',
    sala: '',
    dataInicio: '',
    dataFim: '',
    responsavel: '',
    cafeQuantidade: undefined,
    cafeDescricao: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isEdit && reserva) {
      const dataInicio = new Date(reserva.dataInicio).toISOString().slice(0, 16);
      const dataFim = new Date(reserva.dataFim).toISOString().slice(0, 16);
      
      setFormData({
        local: reserva.local,
        sala: reserva.sala,
        dataInicio,
        dataFim,
        responsavel: reserva.responsavel,
        cafeQuantidade: reserva.cafe?.quantidade,
        cafeDescricao: reserva.cafe?.descricao || '',
      });
    }
  }, [isEdit, reserva]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.local.trim()) {
      newErrors.local = 'Local é obrigatório';
    }
    if (!formData.sala.trim()) {
      newErrors.sala = 'Sala é obrigatória';
    }
    if (!formData.dataInicio) {
      newErrors.dataInicio = 'Data/hora de início é obrigatória';
    }
    if (!formData.dataFim) {
      newErrors.dataFim = 'Data/hora de fim é obrigatória';
    }
    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório';
    }

    if (formData.dataInicio && formData.dataFim) {
      const inicio = new Date(formData.dataInicio);
      const fim = new Date(formData.dataFim);
      
      if (fim <= inicio) {
        newErrors.dataFim = 'Data/hora de fim deve ser posterior à data/hora de início';
      }
    }

    if (formData.cafeQuantidade && formData.cafeQuantidade <= 0) {
      newErrors.cafeQuantidade = 'Quantidade de café deve ser maior que zero';
    }

    if (formData.cafeQuantidade && !formData.cafeDescricao.trim()) {
      newErrors.cafeDescricao = 'Descrição do café é obrigatória quando quantidade é informada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    if (!validate()) {
      return;
    }

    try {
      let result;
      if (isEdit) {
        result = await handleUpdate(id!, formData);
      } else {
        result = await handleCreate(formData);
      }

      if (result.success) {
        navigate('/reservas');
      } else {
        const errorMessage = result.error || 'Erro ao salvar reserva';
        
        if (result.graphQLErrors && result.graphQLErrors.length > 0) {
          const graphQLError = result.graphQLErrors[0];
          const message = graphQLError.message || errorMessage;
          
          if (message.toLowerCase().includes('conflito') || 
              message.toLowerCase().includes('conflit') ||
              message.toLowerCase().includes('já existe') ||
              message.toLowerCase().includes('already exists')) {
            setSubmitError('Conflito de horário: Já existe uma reserva neste período para esta sala.');
          } else {
            setSubmitError(message);
          }
        } else {
          setSubmitError(errorMessage);
        }
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar reserva');
    }
  };

  const loading = creating || updating || loadingReserva;

  if (isEdit && loadingReserva) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando reserva...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Reserva' : 'Nova Reserva'}</CardTitle>
          <CardDescription>
            {isEdit
              ? 'Atualize as informações da reserva'
              : 'Preencha os dados para criar uma nova reserva'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            {submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <FormItem>
              <FormLabel htmlFor="local">
                Local <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) =>
                    setFormData({ ...formData, local: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Ex: Matriz, Filial SP"
                />
              </FormControl>
              {errors.local && <FormMessage>{errors.local}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="sala">
                Sala <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="sala"
                  value={formData.sala}
                  onChange={(e) =>
                    setFormData({ ...formData, sala: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Ex: Sala 1, Sala de Reuniões A"
                />
              </FormControl>
              {errors.sala && <FormMessage>{errors.sala}</FormMessage>}
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel htmlFor="dataInicio">
                  Data/Hora Início <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="dataInicio"
                    type="datetime-local"
                    value={formData.dataInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, dataInicio: e.target.value })
                    }
                    disabled={loading}
                  />
                </FormControl>
                {errors.dataInicio && <FormMessage>{errors.dataInicio}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="dataFim">
                  Data/Hora Fim <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="dataFim"
                    type="datetime-local"
                    value={formData.dataFim}
                    onChange={(e) =>
                      setFormData({ ...formData, dataFim: e.target.value })
                    }
                    disabled={loading}
                  />
                </FormControl>
                {errors.dataFim && <FormMessage>{errors.dataFim}</FormMessage>}
              </FormItem>
            </div>

            <FormItem>
              <FormLabel htmlFor="responsavel">
                Responsável <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavel: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Nome do responsável"
                />
              </FormControl>
              {errors.responsavel && <FormMessage>{errors.responsavel}</FormMessage>}
            </FormItem>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-4">Opções de Café (Opcional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel htmlFor="cafeQuantidade">Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      id="cafeQuantidade"
                      type="number"
                      min="0"
                      value={formData.cafeQuantidade || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cafeQuantidade: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      disabled={loading}
                      placeholder="0"
                    />
                  </FormControl>
                  {errors.cafeQuantidade && (
                    <FormMessage>{errors.cafeQuantidade}</FormMessage>
                  )}
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="cafeDescricao">Descrição</FormLabel>
                  <FormControl>
                    <Input
                      id="cafeDescricao"
                      value={formData.cafeDescricao}
                      onChange={(e) =>
                        setFormData({ ...formData, cafeDescricao: e.target.value })
                      }
                      disabled={loading}
                      placeholder="Ex: Café expresso, Cappuccino"
                    />
                  </FormControl>
                  {errors.cafeDescricao && (
                    <FormMessage>{errors.cafeDescricao}</FormMessage>
                  )}
                </FormItem>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/reservas')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
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
    </div>
  );
};


import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sala, SalaFormData } from '@/models/Sala';

interface SalaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SalaFormData) => Promise<{ success: boolean; error?: string }>;
  sala?: Sala | null;
  title?: string;
}

export const SalaModal = ({
  open,
  onOpenChange,
  onSave,
  sala,
  title,
}: SalaModalProps) => {
  const [formData, setFormData] = useState<SalaFormData>({
    nome: '',
    local: '',
    capacidade: undefined,
    descricao: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sala) {
      setFormData({
        nome: sala.nome,
        local: sala.local,
        capacidade: sala.capacidade || undefined,
        descricao: sala.descricao || '',
      });
    } else {
      setFormData({
        nome: '',
        local: '',
        capacidade: undefined,
        descricao: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [sala, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.local.trim()) {
      newErrors.local = 'Local é obrigatório';
    }

    if (formData.capacidade !== undefined && formData.capacidade < 1) {
      newErrors.capacidade = 'Capacidade deve ser maior que zero';
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

    setLoading(true);
    try {
      const result = await onSave(formData);
      if (result.success) {
        onOpenChange(false);
      } else {
        setSubmitError(result.error || 'Erro ao salvar sala');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar sala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || (sala ? 'Editar Sala' : 'Nova Sala')}</DialogTitle>
          <DialogDescription>
            {sala
              ? 'Atualize as informações da sala'
              : 'Preencha os dados para criar uma nova sala'}
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <FormItem>
            <FormLabel htmlFor="nome">Nome *</FormLabel>
            <FormControl>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Sala de Reuniões 1"
                disabled={loading}
                required
              />
            </FormControl>
            {errors.nome && (
              <p className="text-sm text-red-500 mt-1">{errors.nome}</p>
            )}
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="local">Local *</FormLabel>
            <FormControl>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) =>
                  setFormData({ ...formData, local: e.target.value })
                }
                placeholder="Ex: Edifício A"
                disabled={loading}
                required
              />
            </FormControl>
            {errors.local && (
              <p className="text-sm text-red-500 mt-1">{errors.local}</p>
            )}
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="capacidade">Capacidade</FormLabel>
            <FormControl>
              <Input
                id="capacidade"
                type="number"
                min="1"
                value={formData.capacidade || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacidade: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Ex: 10"
                disabled={loading}
              />
            </FormControl>
            {errors.capacidade && (
              <p className="text-sm text-red-500 mt-1">{errors.capacidade}</p>
            )}
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="descricao">Descrição</FormLabel>
            <FormControl>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Ex: Sala com projetor e quadro branco"
                disabled={loading}
              />
            </FormControl>
          </FormItem>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : sala ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


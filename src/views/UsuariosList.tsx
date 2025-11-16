import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUsuarios } from '@/controllers/useUsuarios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { EditUsuarioModal } from '@/components/EditUsuarioModal';
import { DeleteUsuarioModal } from '@/components/DeleteUsuarioModal';
import { User } from '@/models/User';
import { Pagination } from '@/components/Pagination';

export const UsuariosList = () => {
  const { showToast, ToastContainer } = useToast();
  
  // Paginação (frontend)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUsername, setFiltroUsername] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [filtroAdmin, setFiltroAdmin] = useState<'todos' | 'sim' | 'nao'>('todos');
  
  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroNome, filtroUsername, filtroEmail, filtroAdmin]);
  
  // Carrega mais dados do backend
  const { usuarios: todosUsuarios, loading, error, refetch, criarUsuarioAdmin, atualizarUsuarioAdmin, deletarUsuario } = useUsuarios(0, 1000);
  
  // Filtra usuários
  const usuariosFiltrados = useMemo(() => {
    return todosUsuarios.filter((usuario: User) => {
      // Filtro por nome
      if (filtroNome && !(usuario.nome || '').toLowerCase().includes(filtroNome.toLowerCase())) {
        return false;
      }
      
      // Filtro por username
      if (filtroUsername && !usuario.username.toLowerCase().includes(filtroUsername.toLowerCase())) {
        return false;
      }
      
      // Filtro por email
      if (filtroEmail && !usuario.email.toLowerCase().includes(filtroEmail.toLowerCase())) {
        return false;
      }
      
      // Filtro por admin
      if (filtroAdmin === 'sim' && !usuario.admin) {
        return false;
      }
      if (filtroAdmin === 'nao' && usuario.admin) {
        return false;
      }
      
      return true;
    });
  }, [todosUsuarios, filtroNome, filtroUsername, filtroEmail, filtroAdmin]);
  
  // Calcula paginação dos dados filtrados
  const totalItems = usuariosFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const usuarios = usuariosFiltrados.slice(startIndex, endIndex);
  
  // Estado do formulário de criação
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [formError, setFormError] = useState('');

  // Estado dos modais de edição e exclusão
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nome || !username || !email || !password || !confirmPassword) {
      setFormError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }

    if (password.length > 72) {
      setFormError('A senha não pode ter mais de 72 caracteres');
      return;
    }

    try {
      const result = await criarUsuarioAdmin({
        nome,
        username,
        email,
        password,
        admin,
      });
      
      if (result.success) {
        // Limpar formulário
        setNome('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAdmin(false);
        setShowForm(false);
        setCurrentPage(1); // Reset para primeira página
        
        showToast({ message: 'Usuário criado com sucesso!', variant: 'success' });
      } else {
        setFormError(result.error || 'Erro ao criar usuário');
        showToast({ message: result.error || 'Erro ao criar usuário', variant: 'destructive' });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao criar usuário. Verifique os dados informados.';
      setFormError(errorMsg);
      showToast({ message: errorMsg, variant: 'destructive' });
    }
  };

  const handleEdit = (usuario: User) => {
    setSelectedUsuario(usuario);
    setEditModalOpen(true);
  };

  const handleDelete = (usuario: User) => {
    setSelectedUsuario(usuario);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async (usuarioId: number, data: {
    nome?: string;
    email?: string;
    password?: string;
    admin?: boolean;
  }) => {
    const result = await atualizarUsuarioAdmin(usuarioId, data);
    
    if (result.success) {
      showToast({ message: 'Usuário atualizado com sucesso!', variant: 'success' });
      return { success: true };
    } else {
      showToast({ message: result.error || 'Erro ao atualizar usuário', variant: 'destructive' });
      return { success: false, error: result.error };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUsuario) return;

    const result = await deletarUsuario(selectedUsuario.id);
    
    if (result.success) {
      showToast({ message: 'Usuário excluído com sucesso!', variant: 'success' });
      setDeleteModalOpen(false);
      setSelectedUsuario(null);
    } else {
      showToast({ message: result.error || 'Erro ao excluir usuário', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando usuários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Erro ao carregar usuários: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Usuários</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Novo Usuário'}
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cadastrar Novo Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <Form onSubmit={handleSubmit}>
                  {formError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel htmlFor="nome">Nome</FormLabel>
                      <FormControl>
                        <Input
                          id="nome"
                          type="text"
                          placeholder="Nome completo"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <FormControl>
                        <Input
                          id="username"
                          type="text"
                          placeholder="usuario123"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel htmlFor="password">Senha</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          maxLength={72}
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="md:col-span-2">
                      <FormLabel htmlFor="confirmPassword">Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          maxLength={72}
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="admin-create"
                          checked={admin}
                          onChange={(e) => setAdmin(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <FormLabel htmlFor="admin-create" className="cursor-pointer">
                          Administrador
                        </FormLabel>
                      </div>
                    </FormItem>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button type="submit">
                      Criar Usuário
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setFormError('');
                        setNome('');
                        setUsername('');
                        setEmail('');
                        setPassword('');
                        setConfirmPassword('');
                        setAdmin(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Filtros */}
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Nome</label>
                <Input
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Username</label>
                <Input
                  placeholder="Buscar por username..."
                  value={filtroUsername}
                  onChange={(e) => setFiltroUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Email</label>
                <Input
                  placeholder="Buscar por email..."
                  value={filtroEmail}
                  onChange={(e) => setFiltroEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Admin</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={filtroAdmin}
                  onChange={(e) => setFiltroAdmin(e.target.value as 'todos' | 'sim' | 'nao')}
                >
                  <option value="todos">Todos</option>
                  <option value="sim">Apenas Administradores</option>
                  <option value="nao">Apenas Usuários</option>
                </select>
              </div>
            </div>
            {(filtroNome || filtroUsername || filtroEmail || filtroAdmin !== 'todos') && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltroNome('');
                    setFiltroUsername('');
                    setFiltroEmail('');
                    setFiltroAdmin('todos');
                  }}
                >
                  Limpar Filtros
                </Button>
                <span className="text-sm text-muted-foreground">
                  {usuariosFiltrados.length} de {todosUsuarios.length} usuário(s)
                </span>
              </div>
            )}
          </div>

          {todosUsuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.id}</TableCell>
                    <TableCell>{usuario.nome || '-'}</TableCell>
                    <TableCell>{usuario.username}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.admin ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Sim
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {usuario.createdAt
                        ? format(new Date(usuario.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(usuario)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {usuariosFiltrados.length > 0 && (
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
      
      <EditUsuarioModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        usuario={selectedUsuario}
        onSave={handleSaveEdit}
      />
      
      <DeleteUsuarioModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        usuario={selectedUsuario}
        onConfirm={handleConfirmDelete}
      />
      
      <ToastContainer />
    </div>
  );
};


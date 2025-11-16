# Sistema de Reserva de Salas de Reunião - Front-end

Este é o front-end web para um sistema de reservas de salas de reunião. Foi desenvolvido usando React com TypeScript, seguindo o padrão MVC e utilizando GraphQL para comunicação com a API.

Assista ao vídeo demonstrativo do sistema:

**[Assistir vídeo no Vimeo](https://vimeo.com/1137491148)**

## Tecnologias Utilizadas

O projeto foi construído com as seguintes tecnologias:

- React 18 para construção da interface
- TypeScript para tipagem estática
- Vite como ferramenta de build e servidor de desenvolvimento
- React Router para gerenciamento de rotas
- Apollo Client para integração com GraphQL
- Zustand para gerenciamento de estado global
- Componentes shadcn/ui para interface
- Tailwind CSS para estilização responsiva
- date-fns para manipulação e formatação de datas

## Estrutura do Projeto

O projeto segue o padrão MVC (Model-View-Controller) para manter uma organização clara do código:

```
src/
├── models/          # Modelos de dados e interfaces TypeScript
│   ├── Reserva.ts
│   ├── Sala.ts
│   └── User.ts
├── views/           # Componentes de visualização (páginas)
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── ReservasList.tsx
│   ├── ReservaForm.tsx
│   ├── SalasList.tsx
│   ├── Historico.tsx
│   └── UsuariosList.tsx
├── controllers/     # Lógica de negócio (custom hooks)
│   ├── useAuth.ts
│   ├── useReservas.ts
│   ├── useSalas.ts
│   ├── useUsuarios.ts
│   ├── useParticipantes.ts
│   ├── usePerfil.ts
│   └── useMeuPerfil.ts
├── components/      # Componentes reutilizáveis
│   ├── ui/          # Componentes base shadcn/ui
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   ├── AdminRoute.tsx
│   ├── DeleteReservaModal.tsx
│   ├── DeleteUsuarioModal.tsx
│   ├── EditPerfilModal.tsx
│   ├── EditUsuarioModal.tsx
│   ├── SalaModal.tsx
│   ├── NotificacoesModal.tsx
│   └── Pagination.tsx
├── graphql/         # Definições de queries e mutations GraphQL
│   ├── queries/
│   │   ├── auth.ts
│   │   ├── reservas.ts
│   │   ├── salas.ts
│   │   ├── usuarios.ts
│   │   └── participantes.ts
│   └── mutations/
│       ├── auth.ts
│       ├── reservas.ts
│       ├── salas.ts
│       ├── usuarios.ts
│       ├── participantes.ts
│       └── perfil.ts
├── store/           # Estado global com Zustand
│   └── auth-store.ts
├── contexts/        # Contextos React
│   └── ToastContext.tsx
└── lib/             # Utilitários e configurações
    ├── apollo-client.ts
    └── utils.ts
```

## Como Instalar e Executar

### Opção 1: Executar com Docker (Recomendado)

#### Pré-requisitos
- Docker instalado ([Download Docker](https://www.docker.com/get-started))
- Docker Compose instalado (geralmente vem junto com o Docker Desktop)

#### Passos para executar

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd reserva-de-sala-frontend
```

2. **Configure as variáveis de ambiente:**
```bash
# No Windows PowerShell
copy env.example .env

# No Linux/Mac
cp env.example .env
```

3. **Edite o arquivo `.env` e configure a URL da sua API GraphQL:**
```env
VITE_GRAPHQL_API_URL=http://localhost:8000/graphql
```

**Nota Importante sobre variáveis de ambiente:** 
- As variáveis de ambiente do Vite são embutidas no build. Se você precisar alterar a URL da API após o build, será necessário reconstruir a imagem.
- Se sua API estiver rodando em outro host (por exemplo, em outro container Docker), você pode precisar ajustar a URL:
  - Para acessar outros containers Docker na mesma rede, use o nome do serviço ou `host.docker.internal` no Windows/Mac
  - Se estiver usando Docker Compose com múltiplos serviços, você pode usar o nome do serviço do backend, por exemplo: `http://backend:8000/graphql`

4. **Build e execute com Docker Compose:**
```bash
# Primeira vez (ou quando houver mudanças no código)
docker-compose up -d --build

# Executar novamente (sem rebuild)
docker-compose up -d
```

A aplicação estará disponível em **http://localhost:3000**

#### Comandos úteis do Docker Compose

**Ver o status dos containers:**
```bash
docker-compose ps
```

**Ver os logs em tempo real:**
```bash
docker-compose logs -f
```

**Parar a aplicação:**
```bash
docker-compose down
```

**Parar e remover volumes (limpeza completa):**
```bash
docker-compose down -v
```

**Reiniciar a aplicação:**
```bash
docker-compose restart
```

**Rebuildar após mudanças no código:**
```bash
docker-compose up -d --build
```

#### Executar apenas com Docker (sem docker-compose)

Se preferir usar apenas Docker sem docker-compose:

1. **Construa a imagem com a URL da API:**
```bash
docker build --build-arg VITE_GRAPHQL_API_URL=http://localhost:8000/graphql -t reserva-sala-frontend .
```

Ou, se você tiver um arquivo `.env` configurado, pode usar:
```bash
# No Windows PowerShell
docker build --build-arg VITE_GRAPHQL_API_URL=$env:VITE_GRAPHQL_API_URL -t reserva-sala-frontend .

# No Linux/Mac
docker build --build-arg VITE_GRAPHQL_API_URL=$VITE_GRAPHQL_API_URL -t reserva-sala-frontend .
```

2. **Execute o container:**
```bash
docker run -d -p 3000:80 --name reserva-sala-frontend reserva-sala-frontend
```

A aplicação estará disponível em **http://localhost:3000**

3. **Comandos úteis:**
```bash
# Ver logs
docker logs -f reserva-sala-frontend

# Parar o container
docker stop reserva-sala-frontend

# Iniciar novamente
docker start reserva-sala-frontend

# Parar e remover o container
docker stop reserva-sala-frontend
docker rm reserva-sala-frontend

# Remover a imagem
docker rmi reserva-sala-frontend
```

#### Troubleshooting Docker

**Problema: Porta 3000 já está em uso**
```bash
# Verifique qual processo está usando a porta
# No Windows PowerShell
netstat -ano | findstr :3000

# No Linux/Mac
lsof -i :3000

# Ou altere a porta no docker-compose.yml (linha 11)
ports:
  - "3001:80"  # Altere 3000 para outra porta
```

**Problema: Erro ao buildar (TypeScript errors)**
- Certifique-se de que todos os arquivos foram commitados corretamente
- Verifique se o arquivo `src/vite-env.d.ts` existe
- Execute `npm run build` localmente para verificar erros antes do Docker

**Problema: Aplicação não conecta com a API**
- Verifique se a URL no `.env` está correta
- Se a API estiver em outro container, use o nome do serviço ou `host.docker.internal`
- Reconstrua a imagem após alterar o `.env`: `docker-compose up -d --build`

**Problema: Mudanças no código não aparecem**
- Reconstrua a imagem: `docker-compose up -d --build`
- Limpe o cache do Docker: `docker-compose build --no-cache`

**Verificar se o container está rodando:**
```bash
docker-compose ps
docker-compose logs frontend
```

### Opção 2: Executar Localmente (Desenvolvimento)

Primeiro, clone o repositório e instale as dependências:

```bash
npm install
```

Depois, configure as variáveis de ambiente. Copie o arquivo de exemplo:

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure a URL da sua API GraphQL. Por padrão, está configurado para:

```
VITE_GRAPHQL_API_URL=http://localhost:8000/graphql
```

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em http://localhost:5173

Para gerar o build de produção:

```bash
npm run build
```

E para visualizar o build de produção localmente:

```bash
npm run preview
```

## Funcionalidades Implementadas

### Design Responsivo

O sistema foi desenvolvido com foco em responsividade, funcionando perfeitamente em dispositivos móveis, tablets e desktops:

- **Layout Adaptativo**: Interface que se adapta automaticamente ao tamanho da tela
- **Versão Mobile**: Cards individuais para melhor visualização em telas pequenas
- **Versão Desktop**: Tabelas completas para visualização otimizada em telas maiores
- **Navegação Responsiva**: Menu e controles adaptados para diferentes tamanhos de tela
- **Título no Topo**: Em mobile, o título "Sistema de Reservas" fica sempre no topo do header
- **Breakpoints**: Utiliza breakpoints do Tailwind (sm, md, lg) para transições suaves

### Autenticação

O sistema possui autenticação completa com login, controle de sessão e rotas protegidas. O estado de autenticação é persistido no localStorage, então o usuário permanece logado mesmo após fechar o navegador.

- Login com username e senha
- Registro de novos usuários
- Controle de sessão com persistência
- Rotas protegidas que redirecionam para login se não autenticado
- Rotas administrativas para usuários admin
- Logout que limpa a sessão
- Edição de perfil do usuário

### CRUD de Reservas

Todas as operações básicas de reservas estão implementadas:

- **Listagem**: Visualização de todas as reservas com filtros avançados (sala, data, responsável, local)
- **Criação**: Formulário completo para criar novas reservas com seleção de horários disponíveis
- **Edição**: Formulário para editar reservas existentes (apenas o responsável pode editar)
- **Exclusão**: Modal de confirmação antes de excluir uma reserva
- **Participantes**: Sistema de adicionar/remover participantes nas reservas
- **Histórico**: Visualização do histórico pessoal de reuniões (como responsável ou participante)

### CRUD de Salas

Gerenciamento completo de salas de reunião (apenas para administradores):

- **Listagem**: Visualização de todas as salas com filtros (nome, local, status)
- **Criação**: Formulário para criar novas salas
- **Edição**: Atualização de informações das salas
- **Exclusão**: Remoção de salas
- **Status**: Ativação/desativação de salas
- **Horários Reservados**: Visualização de todos os horários reservados de uma sala

### Gerenciamento de Usuários

Sistema completo de gerenciamento de usuários (apenas para administradores):

- **Listagem**: Visualização de todos os usuários com filtros (nome, username, email, admin)
- **Criação**: Cadastro de novos usuários com opção de definir como administrador
- **Edição**: Atualização de informações do usuário (nome, email, senha, status admin)
- **Exclusão**: Remoção de usuários

### Dashboard

Painel administrativo com estatísticas e informações úteis:

- **Estatísticas de Salas**: Total, ativas e inativas
- **Estatísticas de Reservas**: Total, hoje e esta semana
- **Gráficos**: Visualização de status das salas e top 5 salas mais reservadas
- **Dias Livres**: Próximos dias disponíveis para reserva

### Validações

O formulário possui validações tanto no cliente quanto tratamento de erros vindos da API:

- Campos obrigatórios validados: sala, data, horário
- Validação de conflitos de horários - quando a API retorna erro de conflito, o sistema detecta e exibe mensagem amigável
- Validação de horários disponíveis - mostra apenas horários livres para a sala e data selecionadas
- Validação de campos de café - se quantidade for informada, descrição também é obrigatória
- Validação de senha - máximo de 72 caracteres

### Campos da Reserva

Os campos obrigatórios são:
- Sala
- Data
- Horário (selecionado de uma lista de horários disponíveis)

Os campos opcionais são:
- Participantes (múltiplos usuários)
- Link Meet (URL para reunião online)
- Café (quantidade e descrição)

## Integração com API GraphQL

O front-end espera uma API GraphQL com as seguintes operações disponíveis.

### Queries

- `reservas` - Retorna lista de todas as reservas
- `reserva(id: ID!)` - Busca uma reserva específica por ID

### Mutations

- `login(email: String!, password: String!)` - Autenticação do usuário
- `createReserva(input: ReservaInput!)` - Cria uma nova reserva
- `updateReserva(id: ID!, input: ReservaInput!)` - Atualiza uma reserva existente
- `deleteReserva(id: ID!)` - Exclui uma reserva

### Tipos GraphQL Esperados

A API deve implementar os seguintes tipos:

```graphql
type Reserva {
  id: ID!
  local: String!
  sala: String!
  dataInicio: String!
  dataFim: String!
  responsavel: String!
  cafe: Cafe
}

type Cafe {
  quantidade: Int!
  descricao: String!
}

input ReservaInput {
  local: String!
  sala: String!
  dataInicio: String!
  dataFim: String!
  responsavel: String!
  cafe: CafeInput
}

input CafeInput {
  quantidade: Int!
  descricao: String!
}
```

## Componentes UI

O projeto utiliza componentes baseados no shadcn/ui, que são componentes acessíveis e customizáveis. Os componentes utilizados incluem:

- **Button** - Botões para ações
- **Input** - Campos de formulário
- **Label** - Rótulos de formulário
- **Card** - Containers para agrupar conteúdo
- **Table** - Tabelas para listagens (desktop)
- **Dialog** - Modais e diálogos
- **Form** - Formulários com validação
- **Alert** - Mensagens de alerta e erro
- **Toast** - Notificações temporárias
- **Pagination** - Componente de paginação

### Componentes Customizados

- **Layout** - Layout principal com header responsivo e navegação
- **ProtectedRoute** - Rota protegida que requer autenticação
- **AdminRoute** - Rota que requer permissões de administrador
- **Pagination** - Componente de paginação reutilizável
- **Modais** - Vários modais para confirmações e formulários

## Tratamento de Erros

O sistema possui tratamento de erros em diferentes níveis:

- **Conflitos de Horário**: Quando a API retorna erro relacionado a conflito de horários, o sistema detecta automaticamente e exibe uma mensagem clara ao usuário
- **Validações de Formulário**: Validação client-side antes de enviar à API para melhor experiência do usuário
- **Erros de Rede**: Tratamento adequado de erros de conexão e respostas da API

## Observações Técnicas

Algumas decisões técnicas importantes:

- **Padrão MVC**: O projeto segue o padrão MVC para facilitar manutenção e organização
- **Componentes Reutilizáveis**: Componentes foram criados de forma reutilizável e modular
- **Estado Global**: Estado de autenticação é gerenciado com Zustand e persistido automaticamente
- **Cache GraphQL**: Apollo Client gerencia cache e faz refetch automático após mutations
- **Formatação de Datas**: Utiliza date-fns com locale pt-BR para exibição em português
- **Responsividade**: Design mobile-first com Tailwind CSS, utilizando breakpoints responsivos
- **Performance**: Paginação no frontend para melhor performance com grandes volumes de dados
- **Acessibilidade**: Componentes shadcn/ui seguem padrões de acessibilidade (WCAG)
- **TypeScript**: Tipagem forte em todo o projeto para maior segurança e produtividade

## Estrutura Responsiva

O sistema foi desenvolvido com uma abordagem mobile-first, garantindo excelente experiência em todos os dispositivos:

### Breakpoints Utilizados

- **Mobile**: < 640px (sm) - Layout em coluna, cards individuais
- **Tablet**: 640px - 768px (sm) - Layout intermediário
- **Desktop**: > 768px (md) - Layout completo com tabelas


## Sobre o Projeto

Este projeto é um sistema web completo para reserva de salas de reuniões, desenvolvido com foco em usabilidade.

A organização em MVC ajuda a separar responsabilidades, facilitando tanto o desenvolvimento quanto a manutenção do código ao longo do tempo. O sistema oferece uma experiência consistente e intuitiva em dispositivos móveis, tablets e desktops.

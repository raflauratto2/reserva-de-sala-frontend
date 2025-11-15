# Sistema de Reserva de Salas de Reunião - Front-end

Este é o front-end web para um sistema de reservas de salas de reunião. Foi desenvolvido usando React com TypeScript, seguindo o padrão MVC e utilizando GraphQL para comunicação com a API.

## Tecnologias Utilizadas

O projeto foi construído com as seguintes tecnologias:

- React 18 para construção da interface
- TypeScript para tipagem estática
- Vite como ferramenta de build e servidor de desenvolvimento
- React Router para gerenciamento de rotas
- Apollo Client para integração com GraphQL
- Zustand para gerenciamento de estado global
- Componentes shadcn/ui para interface
- Tailwind CSS para estilização
- date-fns para manipulação e formatação de datas

## Estrutura do Projeto

O projeto segue o padrão MVC (Model-View-Controller) para manter uma organização clara do código:

```
src/
├── models/          # Modelos de dados e interfaces TypeScript
│   ├── Reserva.ts
│   └── User.ts
├── views/           # Componentes de visualização (páginas)
│   ├── Login.tsx
│   ├── ReservasList.tsx
│   └── ReservaForm.tsx
├── controllers/     # Lógica de negócio (custom hooks)
│   ├── useAuth.ts
│   └── useReservas.ts
├── components/      # Componentes reutilizáveis
│   ├── ui/          # Componentes base shadcn/ui
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── DeleteReservaModal.tsx
├── graphql/         # Definições de queries e mutations GraphQL
│   ├── queries/
│   └── mutations/
├── store/           # Estado global com Zustand
│   └── auth-store.ts
└── lib/             # Utilitários e configurações
    ├── apollo-client.ts
    └── utils.ts
```

## Como Instalar e Executar

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
VITE_GRAPHQL_API_URL=http://localhost:4000/graphql
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

### Autenticação

O sistema possui autenticação completa com login, controle de sessão e rotas protegidas. O estado de autenticação é persistido no localStorage, então o usuário permanece logado mesmo após fechar o navegador.

- Login com email e senha
- Controle de sessão com persistência
- Rotas protegidas que redirecionam para login se não autenticado
- Logout que limpa a sessão

### CRUD de Reservas

Todas as operações básicas de reservas estão implementadas:

- **Listagem**: Visualização de todas as reservas em uma tabela organizada
- **Criação**: Formulário completo para criar novas reservas
- **Edição**: Formulário para editar reservas existentes
- **Exclusão**: Modal de confirmação antes de excluir uma reserva

### Validações

O formulário possui validações tanto no cliente quanto tratamento de erros vindos da API:

- Campos obrigatórios validados: local, sala, data/hora de início, data/hora de fim, responsável
- Validação de conflitos de horários - quando a API retorna erro de conflito, o sistema detecta e exibe mensagem amigável
- Validação de data/hora de fim deve ser posterior à data/hora de início
- Validação de campos de café - se quantidade for informada, descrição também é obrigatória

### Campos da Reserva

Os campos obrigatórios são:
- Local
- Sala
- Data/Hora de Início
- Data/Hora de Fim
- Responsável

Os campos opcionais são:
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

- Button para ações
- Input para campos de formulário
- Label para rótulos
- Card para containers
- Table para listagens
- Dialog para modais
- Form para formulários
- Alert para mensagens

## Tratamento de Erros

O sistema possui tratamento de erros em diferentes níveis:

- **Conflitos de Horário**: Quando a API retorna erro relacionado a conflito de horários, o sistema detecta automaticamente e exibe uma mensagem clara ao usuário
- **Validações de Formulário**: Validação client-side antes de enviar à API para melhor experiência do usuário
- **Erros de Rede**: Tratamento adequado de erros de conexão e respostas da API

## Observações Técnicas

Algumas decisões técnicas importantes:

- O projeto segue o padrão MVC para facilitar manutenção e organização
- Componentes foram criados de forma reutilizável e modular
- Estado de autenticação é gerenciado com Zustand e persistido automaticamente
- Apollo Client gerencia cache e faz refetch automático após mutations
- Formatação de datas utiliza date-fns com locale pt-BR para exibição em português

## Sobre o Projeto

Este projeto é para sistema web de reservar salas de reuniões.

A organização em MVC ajuda a separar responsabilidades, facilitando tanto o desenvolvimento quanto a manutenção do código ao longo do tempo.

# Projeto Docseq

## 📋 Visão Geral

- **Tipo**: Monorepo fullstack
- **Backend**: Spring Boot 4 (Java)
- **Frontend**: Next.js 16 (React)
- **Objetivo**: Um google drive para prefeituras e órgãos públicos guardarem seus arquivos em pdf

## 🏗️ Arquitetura do Monorepo

### Estrutura de Diretórios

```
docseq/
├── backend/           # Spring Boot 4
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/nergal/docseq
│   │   │   │                   ├── controllers/
│   │   │   │                   ├── services/
│   │   │   │                   ├── repositories/
│   │   │   │                   ├── entities/
│   │   │   │                   ├── dto/
│   │   │   │                   ├── helpers/
│   │   │   │                   ├── config/
│   │   │   │                   └── exception/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
└── frontend/
        ├── src/               # Next.js 16
        │   ├── app/           # App Router
        │   ├── components/
        │   ├── lib/
        │   └── types/
        ├── public/
        └── package.json
```

## 🔧 Backend - Spring Boot 4

### Tecnologias e Dependências

- Java 25
- Spring Boot 4.x
- Spring Data JPA
- Spring Security JWT
- Banco de dados: PostgreSQL
- AWS SDK: upload pela cloudflare R2

### Padrões de Código Backend

- **Arquitetura**: Camadas (Controllers, Services, Repositories)
- **Nomenclatura de pacotes**: `com.nergal.docseq`
- **DTOs**: Separados das entidades, usar para comunicação API
- **Validação**: Bean Validation (@Valid, @NotNull, etc)
- **Exceções**: Centralizadas em @ControllerAdvice
- **Documentação**: Sem documentação por swagger

### Endpoints Principais

```
GET    /register                                 # Cria usuário
GET    /get-me                                   # Dados do usuário logado
POST   /login                                    # Login
GET    /users                                    # Lista usuários
PATCH  /user/{id}                                # Atualiza usuário
DELETE /user/{id}                                # Remove usuário

GET    /town                                     # Lista municípios
POST   /town                                     # Cria município
PATCH  /town/{id}                                # Atualiza município
DELETE /town/{id}                                # Remove município

POST   /folders                                  # Cria pasta
PATCH  /folders/{folderId}                       # Renomeia pasta
GET    /folders/root                             # Pasta raiz
GET    /folders/{folderId}/children              # Conteúdo da pasta
GET    /folders/tree                             # Árvore de pastas
PATCH  /folders/{folderId}/favorite              # Favorita/Desfavorita pasta
PATCH  /folders/{folderId}/move/{targetFolderId} # Move pasta
DELETE /folders/{folderId}                       # Move para lixeira
GET    /folders/trash                            # Lista a lixeira
PATCH  /folders/{folderId}/restore               # Restaura pasta
DELETE /folders/{folderId}/permanent             # Remove a pasta permanentemente

POST   /files/upload                             # upload de arquivos
DELETE /files/{fileId}                           # move para a lixeira
POST   /files/{fileId}/restore                   # restaura
DELETE /files/{fileId}/permanent                 # remove permanentemente
PATCH  /files/{fileId}/rename                    # renomeia
PATCH  /files/{fileId}/move/{targetFolderId}     # move
PATCH  /files/{fileId}/favorite                  # Favorita/Desfavorita
GET    /files/{fileId}/view-url                  # Url de arquivo
```

### Configurações Importantes

- **Porta**: 9090
- **CORS**: Não configurado
- **Perfis**: dev, prod
- **Variáveis de ambiente**:
  - DB_PASSWORD,
  - ADM_USERNAME,
  - ADM_EMAIL,
  - ADM_PASSWORD,
  - CLOUDFLARE_R2_BUCKET_NAME
  - CLOUDFLARE_R2_ENDPOINT
  - CLOUDFLARE_R2_ACCESS_KEY
  - CLOUDFLARE_R2_SECRET_KEY

## 🎨 Frontend - Next.js 16

### Tecnologias e Dependências

- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS
- Bibliotecas de UI: shadcn/ui
- Gerenciamento de estado: Context API

### Padrões de Código Frontend

- **Estrutura**: App Router (não Pages Router)
- **Componentes**: Server Components por padrão, Client Components quando necessário
- **Nomenclatura**: PascalCase para componentes, camelCase para funções
- **Organização**: Feature-based (agrupar por funcionalidade)
- **API calls**: Centralizados em `lib/api/` ou serviços específicos

### Estrutura de Rotas

```
src/                 # Next.js 16
├── app/             # App Routers
│   └──(auth)/
│       ├── login/
│       └── register/
├── components/
├── lib/
└── types/
public/
package.json
```

### Integração com Backend

```typescript
// lib/api/config.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/';
```

## 🔗 Comunicação Frontend-Backend

### Formato de Dados

- **Request/Response**: JSON
- **Autenticação**: JWT / OAuth2
- **Headers padrão**:

```
  Content-Type: application/json
  Authorization: Bearer {token}
```

### Tratamento de Erros

- Backend retorna: `{ error: string }`
- Frontend exibe: Toast/Alert com mensagem amigável

## 🗃️ Banco de Dados

### Schema Principal

### Migrations

## 📝 Regras de Negócio

### Funcionalidade X

1. [Descrever fluxo importante]
2. [Validações necessárias]
3. [Comportamentos esperados]

### Funcionalidade Y

[...]

## 🧪 Testes

### Backend

- JUnit 5 + Mockito
- Testes de integração com @SpringBootTest
- Localização: `backend/src/test/`

### Frontend

- Jest + React Testing Library
- Testes E2E: Playwright / Cypress
- Localização: `frontend/__tests__/`

## 🚀 Deploy & DevOps

- **Backend**: [Docker, Cloud, etc]
- **Frontend**: Vercel / Netlify
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoramento**:

## 📚 Convenções e Boas Práticas

### Commits

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Escopo: `feat(backend):`, `fix(frontend):`

### Segurança

- Nunca commitar secrets
- Usar variáveis de ambiente
- Sanitizar inputs do usuário
- CORS configurado adequadamente

## 🎯 Próximos Passos / Roadmap

- **Backend**

1. - [ ] Busca Avançada: Implementar uma busca global que permita pesquisar por nome em arquivos e pastas, com filtros por data, tipo e outras propriedades.
2. - [ ] Controle de Acesso por Papel (RBAC): Expandir o sistema de permissões para permitir controle de acesso mais granular a pastas e arquivos.
   - Adicionar uma nova entidade Permissions
   - Vai permitir que usuários manager deem permissão aos basics de acessar pastas e arquivos especificos de suas respectivas towns.
   - Crie todos as rotas necessárias para dá e retirar as permissões.
3. - [ ] Log de Auditoria: Criar um serviço para registrar todas as ações importantes (criação, acesso, modificação, exclusão de arquivos/pastas) para fins de segurança e conformidade.
4. - [ ] Funcionalidade de Compartilhamento: Desenvolver a lógica para permitir que usuários compartilhem arquivos e pastas com outros usuários, gerando links seguros e controlando permissões
         de acesso.
5. - [ ] Versionamento de Arquivos: Implementar a capacidade de manter um histórico de versões dos arquivos, permitindo que os usuários visualizem e restaurem versões anteriores.
6. - [x] Configuração de CORS: Adicionar uma configuração de Cross-Origin Resource Sharing (CORS) para permitir que o frontend (executando em um domínio diferente) se comunique de forma segura
         com a API.
7. - [ ] Cobertura de Testes: Aumentar a cobertura de testes unitários e de integração, especialmente para os novos recursos, garantindo a estabilidade e a qualidade do código.

- **Frontend**

1. - [ ] Dashboard Principal: Construir a interface principal da aplicação, onde os usuários poderão navegar, visualizar e gerenciar suas pastas e arquivos após o login.
2. - [ ] Operações de Arquivos e Pastas: Implementar os componentes de UI e a lógica para todas as operações de CRUD (criar, renomear, mover, deletar) em arquivos e pastas, consumindo os
         endpoints da API.
3. - [x] Integração com a API: Criar um serviço de API centralizado no frontend (/lib/api) para gerenciar a comunicação com o backend, incluindo o tratamento de autenticação (JWT) e a exibição
         de feedback (toasts/alertas) para o usuário.
4. - [ ] Gerenciamento de Estado Global: Utilizar a Context API do React para gerenciar o estado da aplicação, como informações do usuário autenticado, a pasta atual e a lista de arquivos.
5. - [ ] Componentes da UI: Desenvolver uma biblioteca de componentes reutilizáveis com shadcn/ui para elementos como:
   * - [ ] Itens de lista para arquivos e pastas.
   * - [ ] Menus de contexto (clique com o botão direito).
   * - [ ] Modais para interações do usuário (criar pasta, renomear, etc.).
   * - [ ] Visualizações específicas para "Lixeira" e "Favoritos".
6. - [ ] Interface de Busca: Criar uma barra de pesquisa e uma página de resultados para interagir com a funcionalidade de busca do backend.
7. - [ ] Painel de Administração: Desenvolver uma área administrativa onde usuários com permissão (admin) possam gerenciar usuários e municípios.
8. - [ ] Design Responsivo: Garantir que a aplicação seja totalmente funcional e visualmente agradável em diferentes tamanhos de tela, de dispositivos móveis a desktops.

## 📖 Referências Úteis

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Next.js Docs](https://nextjs.org/docs)

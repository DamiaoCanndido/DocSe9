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

### Vulnerabilidades

1.  Mass Assignment (Atribuição em Massa) - Risco: Crítico
    Identifiquei que o UserUpdateDTO permite alterar campos sensíveis sem a devida validação de quem está fazendo a
    alteração.

- Ataque: Um usuário comum (basic) pode enviar uma requisição PATCH /user/{meu_id} com o campo "role": "admin".
- Vulnerabilidade: No UserService.java, o método updateUser permite que o próprio usuário atualize seu perfil, e o
  método applyUpdates aceita o role e townId do DTO sem verificar se o solicitante tem permissão para alterar esses
  campos específicos.
- Correção: Crie DTOs separados para atualização de perfil (usuário comum) e administração (admin/manager), ou
  adicione verificaciones manuais no applyUpdates para ignorar role e townId se o usuário logado não for admin.

2. Broken Object Level Authorization (BOLA/IDOR) - Risco: Alto
   Embora a maioria dos endpoints valide o townId, encontrei uma inconsistência na versão V1 do FileService.

- Ataque: Confirmação de existência de arquivos de outras organizações.
- Vulnerabilidade: No FileService.java, o método getRootFolderId chama fileRepository.findById(fileId) antes de
  verificar se o arquivo pertence à town do usuário. Isso permite que um atacante descubra se um UUID de arquivo
  existe em qualquer prefeitura do sistema.
- Correção: Sempre valide o townId na primeira consulta ao banco de dados, utilizando métodos como
  findByFileIdAndTownTownId....

3. Falha de Integridade no Upload - Risco: Médio
   O sistema confia cegamente no cabeçalho Content-Type enviado pelo cliente.

- Ataque: Um atacante pode enviar um script malicioso renomeado para .pdf e forçar o cabeçalho Content-Type:
  application/pdf.
- Vulnerabilidade: No FileV2Service.upload, a validação validatePdf verifica apenas se o arquivo está vazio e o tipo
  MIME retornado pelo MultipartFile.
- Correção: Utilize uma biblioteca como o Apache Tika para verificar os "Magic Bytes" do arquivo e garantir que ele é
  realmente um PDF antes de salvá-lo.

4. Força Bruta e DoS (Negação de Serviço) - Risco: Médio
   Não há mecanismos de proteção contra múltiplas tentativas de acesso.

- Ataque: Brute Force no endpoint /login ou /v2/reset-password. Além disso, um usuário pode subir milhares de
  arquivos pequenos para esgotar o storage (R2/Disco).
- Vulnerabilidade: A SecurityConfig não implementa Rate Limiting.
- Correção: Implemente o Spring Cloud Gateway RateLimiter ou uma biblioteca como Bucket4j para limitar requisições
  por IP ou usuário.

5. Configuração de Chaves JWT
   Atualmente, as chaves RSA são carregadas do classpath.

- Risco: Se o código-fonte for vazado ou o .jar for comprometido, as chaves de assinatura dos tokens são expostas.
- Correção: Em produção, mova app.key e app.pub para um serviço de segredos (como AWS Secrets Manager ou Vault) ou
  use variáveis de ambiente para injetar o conteúdo das chaves.

6. [x] Confiança no Content-Type do Cliente (Vulnerabilidade Crítica)
7. [x] Falta de Validação de "Magic Bytes"
8. [x] Risco de DoS por Exaustão de Memória
9. [x] Manipulação da Extensão do Arquivo

Recomendações:

1.  [x] Implementar Apache Tika: Validar o conteúdo real do arquivo no FileV2Service antes de chamar o R2StorageService.
2.  [x] Streaming de Upload: Alterar o upload para usar InputStream em vez de byte[].
3.  [x] Lista Branca de Extensões: No generateFileName, validar se a extensão extraída está em uma lista permitida (ex:
    apenas .pdf).

Resumo de Ações Recomendadas:

1.  Remover role e townId do UserUpdateDTO principal.
2.  [x] Sincronizar a segurança da V1 com a V2, garantindo que todas as consultas ao FileRepository incluam o townId (Validado e sincronizado para uploads).
3.  Adicionar Rate Limiting nos endpoints de autenticação.
4.  [x] Validar o conteúdo real (Magic Bytes) nos uploads de arquivos.

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

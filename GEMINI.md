# Contexto do Projeto DocSe9

## Estrutura

- **Backend:** Spring Boot (Java) localizado em `./backend`.
- **Frontend:** Nextjs (Typescript) localizado em `./frontend`.

## Endpoints Principais

- Base URL: `http://localhost:9090`

## Mapeamento de API (Endpoints)

### Autenticação

- `POST /login`: Recebe LoginDTO, retorna um LoginResponse.
- `POST /register`: Recebe RegisterUserDTO Cria novo usuário e retorna void.

### Testes

1. Analise o teste uniário em `./backend/src/test/java/com/docse9/repositories/UserRepositoryTest.java` e escreva outros testes nesse arquivo conforme necessário.

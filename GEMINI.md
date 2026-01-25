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

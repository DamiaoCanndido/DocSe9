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

1. Analise o teste unitário em `./backend/src/test/java/com/docseq/repositories/UserRepositoryTest.java` e escreva outros testes nesse arquivo conforme necessário.
2. Agora analise o arquivo `./backend/src/main/java/com/docseq/services/UserServices.java` e me escreva os testes necessários para cada metodo nesse arquivo.

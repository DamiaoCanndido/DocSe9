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

### Mudanças nas regras de negócio

1. A entidade em: `./backend/src/test/java/com/docseq/entities/User.java` o campo roles é um Set<Role> roles mas quero deixa-lo somente como Role role um manytoone mudando tambem vários outros arquivos como em:
   1. `./backend/src/test/java/com/docseq/dto/users`
   2. `./backend/src/test/java/com/docseq/config/AdminuserConfig.java`
   3. `./backend/src/test/java/com/docseq/entities/User.java`

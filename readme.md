# API RESTful com CRUD e Autenticação de Usuários

Uma API RESTful com operações de CRUD (Create, Read, Update, Delete) e autenticação de usuários, criada com o intuito de estudo.

## Principais Tecnologias Utilizadas
- NodeJS
- Sequelize
- MySQL
- Express

## Outras Bibliotecas
- Bcrypt
- Dotenv

## Pendências a Serem Implementadas
- Finalizar criação e configuração das rotas de atualização e deleção de usuários
- Implementar sistema de permissões de usuários (3 níveis)
- Implementar JWT (JSON Web Tokens)
- Criar testes (jest)

## Endpoints (passíveis de mudança na estrutura)

### 1. /users
   - `POST` e `GET`

### 2. /login
   - `POST` e `GET`

### 3. /logout
   - `POST`

### 4. /generate-password(?...params)
   - `GET`
   - Observação: Utilizará os parâmetros padrão caso não sejam informados.

Esta API foi criada como parte de um projeto de estudo e pode sofrer mudanças na estrutura dos endpoints e implementações futuras. 

# API RESTful com CRUD e Autenticação de Usuários

Uma API RESTful com operações de CRUD (Create, Read, Update, Delete) e autenticação de usuários, criada com o intuito de estudo.

## Principais Tecnologias Utilizadas
- NodeJS
- Sequelize
- MySQL
- Express
- JsonWebToken

## Outras Bibliotecas
- Bcrypt
- Dotenv

## Endpoints (passíveis de mudança na estrutura)

### 1. /dashboard/users
   - `POST` e `GET`

### 2. /dashboard/users/:id
   - `PUT`, `GET`, `PATCH` e `DELETE`

### 3. /auth/login
   - `POST` 

### 4. /auth/logout
   - `POST`

### 5. /auth/register
   - `POST`

## Pendências a Serem Implementadas
- [ ] Lógica para armazenar Log das atividades realizadas no banco de dados
- [ ] Criar testes (jest)

Esta API foi criada como parte de um projeto de estudo e pode sofrer mudanças na estrutura dos endpoints e implementações futuras. 

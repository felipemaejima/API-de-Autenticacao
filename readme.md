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

### 1. /users
   - `POST` e `GET`

### 2. /login
   - `POST` e `GET`

### 3. /logout
   - `POST`

### 4. /generate-password (?...params)
   - `GET`
   - Espera um array de numeros(4) [total de caracteres, quantidade de números , quantidade de símbolos, quantidade de letras maiúsculas], completanto o restante (caso haja) com letras minusculas.
   - Observação: Utilizará os parâmetros padrão no código caso não sejam informados

## Pendências a Serem Implementadas
- [ ] Finalizar criação e configuração das rotas de atualização e deleção de usuários
- [ ] Criar lógica para que somente administradores criem usuários de níveis maiores que usuários
- [ ] Lógica para armazenar Log das atividades realizadas no banco de dados
- [ ] Criar testes (jest)

Esta API foi criada como parte de um projeto de estudo e pode sofrer mudanças na estrutura dos endpoints e implementações futuras. 

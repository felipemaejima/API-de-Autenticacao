const request = require('supertest');
const app = require('../index.js'); 

describe('POST /register', () => {
  it('deve retornar 401 se a senha não for informada', async () => {
    const userData = {
      username: 'usuario_teste',
      email: 'usuario@teste.com',
      confirmPassword: '123456'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Senha não informada' });
  });

  it('deve retornar 401 se a senha tiver menos de 3 caracteres', async () => {
    const userData = {
      username: 'usuario_teste',
      email: 'usuario@teste.com',
      password: '12', // senha com menos de 3 caracteres
      confirmPassword: '12'
    };

    const response = await request(app)
      .post('auth/register')
      .send(userData);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'A senha deve ter pelo menos 3 caracteres' });
  });

  it('deve retornar 401 se as senhas não forem iguais', async () => {
    const userData = {
      username: 'usuario_teste',
      email: 'usuario@teste.com',
      password: '123456',
      confirmPassword: '1234567' // senhas diferentes
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'As senhas devem ser iguais' });
  });

  it('deve criar um novo usuário com sucesso', async () => {
    const userData = {
      username: 'usuario_teste',
      email: 'usuario@teste.com',
      password: '123456',
      confirmPassword: '123456'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Usuário criado com sucesso.' });
  });
});
/* eslint-disable no-undef */
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../index');
const User = require('../database/models/users');
const mongoose = require('../database/dbConection');
const UserService = require('../database/services/users');

describe('test the recipes API', () => {
  beforeAll(async () => {
    const password = bcrypt.hashSync('okay', 10);
    await User.create({
      username: 'admin',
      password,
    });
  });

  afterAll(async () => {
    await User.deleteMany();
    mongoose.disconnect();
  });

  describe('POST /login', () => {
    it('authenticates user and sign in', async () => {
      const user = {
        username: 'admin',
        password: 'okay',
      };

      const res = await request(app)
        .post('/login')
        .send(user);

      token = res.body.accessToken;

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          accessToken: res.body.accessToken,
          success: true,
          data: expect.objectContaining({
            id: res.body.data.id,
            username: res.body.data.username,
          }),
        }),
      );
    });

    it('cant sign in with empty password', async () => {
      const user = {
        username: 'admin',
      };

      const res = await request(app)
        .post('/login')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: 'username or password can not be empty',
        }),
      );
    });

    it('cant sign in with empty username', async () => {
      const user = {
        password: 'okay',
      };

      const res = await request(app)
        .post('/login')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: 'username or password can not be empty',
        }),
      );
    });

    it('cant sign in with non existing username', async () => {
      const user = {
        username: 'notexist',
        password: 'okay',
      };

      const res = await request(app)
        .post('/login')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: 'Incorrect username or password',
        }),
      );
    });

    it('cant sign in with in correct password', async () => {
      const user = {
        username: 'admin',
        password: 'notokay',
      };

      const res = await request(app)
        .post('/login')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: 'Incorrect username or password',
        }),
      );
    });

    it('cant sign in, internal server error', async () => {
      const user = {
        username: 'admin',
        password: 'okay',
      };

      jest.spyOn(UserService, 'findByUsername')
        .mockRejectedValueOnce(new Error());

      const res = await request(app)
        .post('/login')
        .send(user);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
        }),
      );
    });
  });

  describe('POST /recipes', () => {

  });

  describe('GET /recipes', () => {
    it('should retrieve all the recipes in db', async () => {
      const res = await request(app)
        .get('/recipes');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        }),
      );
    });
  });

  describe('GET /recipes/:id', () => {
    it('should not retrieve recipes with any id', async () => {
      const falseId = '3253212r12r3256234f2';
      const res = await request(app)
        .get(`/recipes/${falseId}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: `Recipe with id ${falseId} does not exist`,
        }),
      );
    });
  });
});

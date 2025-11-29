// Integration-like tests for PostController with supertest
// We build an Express app instance, mount the router, and mock the service via ESM mock.
import { jest } from '@jest/globals';

import express from 'express';
import request from 'supertest';

// ESM mock for the post service used by the controller
const serviceMethods = {
  createPost: jest.fn(),
  getPostsById: jest.fn(),
  deletePost: jest.fn(),
  addLike: jest.fn(),
  getPostsByAuthor: jest.fn(),
  addComment: jest.fn(),
  getPostsByTags: jest.fn(),
  getPostsByPeriod: jest.fn(),
  updatePost: jest.fn()
};

jest.unstable_mockModule('../service/post.service.js', () => ({
  default: serviceMethods
}));

// Import router and error handler AFTER mocking service
const { default: router } = await import('../routes/post.routs.js');
const { default: errorHandler } = await import('../middlewares/error.middleware.js');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/forum', router);
  app.use(errorHandler);
  return app;
};

describe('PostController (integration with supertest, service mocked)', () => {
  let app;
  beforeEach(() => {
    app = buildApp();
    Object.values(serviceMethods).forEach(fn => fn.mockReset());
  });

  test('POST /forum/post/:author -> 201 created', async () => {
    const dto = { title: 't', content: 'c', tags: ['a'] };
    const created = { id: '1', ...dto, author: 'Ann' };
    serviceMethods.createPost.mockResolvedValueOnce(created);

    const res = await request(app)
      .post('/forum/post/Ann')
      .send(dto)
      .expect(201);

    expect(serviceMethods.createPost).toHaveBeenCalledWith('Ann', dto);
    expect(res.body).toEqual(created);
  });

  test('GET /forum/post/:id -> 201 returns post', async () => {
    const post = { id: '42' };
    serviceMethods.getPostsById.mockResolvedValueOnce(post);
    const res = await request(app).get('/forum/post/42').expect(201);
    expect(res.body).toEqual(post);
  });

  test('DELETE /forum/post/:id -> 200 returns deleted post', async () => {
    const deleted = { id: '5' };
    serviceMethods.deletePost.mockResolvedValueOnce(deleted);
    const res = await request(app).delete('/forum/post/5').expect(200);
    expect(res.body).toEqual(deleted);
  });

  test('PATCH /forum/post/:id/like -> 204 no content', async () => {
    serviceMethods.addLike.mockResolvedValueOnce({ id: '7', likes: 3 });
    await request(app).patch('/forum/post/7/like').expect(204);
  });

  test('GET /forum/posts/author/:author -> 200 returns list', async () => {
    const list = [{ id: '1' }];
    serviceMethods.getPostsByAuthor.mockResolvedValueOnce(list);
    const res = await request(app).get('/forum/posts/author/Dan').expect(200);
    expect(res.body).toEqual(list);
  });

  test('PATCH /forum/post/:id/comment/:user -> 200 returns updated post', async () => {
    const updated = { id: '9', comments: [{ user: 'Kate', message: 'Hi' }] };
    serviceMethods.addComment.mockResolvedValueOnce(updated);
    const res = await request(app)
      .patch('/forum/post/9/comment/Kate')
      .send({ message: 'Hi' })
      .expect(200);
    expect(res.body).toEqual(updated);
  });

  test('GET /forum/posts/tags?values=a,b -> 200 returns list', async () => {
    const list = [{ id: 't1' }];
    serviceMethods.getPostsByTags.mockResolvedValueOnce(list);
    const res = await request(app).get('/forum/posts/tags?values=a,b').expect(200);
    expect(res.body).toEqual(list);
  });

  test('GET /forum/posts/period?dateFrom=2020-01-01&dateTo=2020-12-31 -> 200 returns list', async () => {
    const list = [{ id: 'p1' }];
    serviceMethods.getPostsByPeriod.mockResolvedValueOnce(list);
    const res = await request(app)
      .get('/forum/posts/period?dateFrom=2020-01-01&dateTo=2020-12-31')
      .expect(200);
    expect(res.body).toEqual(list);
  });

  test('PATCH /forum/post/:id -> 200 returns updated', async () => {
    const updated = { id: '3', title: 'new' };
    serviceMethods.updatePost.mockResolvedValueOnce(updated);
    const res = await request(app).patch('/forum/post/3').send({ title: 'new' }).expect(200);
    expect(res.body).toEqual(updated);
  });

  test('Controller passes service errors to error handler (404)', async () => {
    serviceMethods.getPostsById.mockRejectedValueOnce(new Error('Post with id 13 not found'));
    const res = await request(app).get('/forum/post/13').expect(404);
    expect(res.body).toMatchObject({ code: 404, status: 'Not Found' });
  });
});

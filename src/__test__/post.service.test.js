// Unit tests for PostService with ESM mock of repository
// Run by Jest with ESM support (see package.json script)
import { jest } from '@jest/globals';

// Prepare ESM mock BEFORE importing the service
const repoMethods = {
  createPost: jest.fn(),
  findPostById: jest.fn(),
  deletePost: jest.fn(),
  addLike: jest.fn(),
  getPostsByAuthor: jest.fn(),
  addComment: jest.fn(),
  getPostsByTags: jest.fn(),
  getPostsByPeriod: jest.fn(),
  updatePost: jest.fn()
};

jest.unstable_mockModule('../repositories/post.repository.js', () => ({
  default: repoMethods
}));

// Import service AFTER mocking dependency
const { default: postService } = await import('../service/post.service.js');

describe('PostService (unit, repository mocked)', () => {
  beforeEach(() => {
    Object.values(repoMethods).forEach(fn => fn.mockReset());
  });

  test('createPost delegates to repository and returns created post', async () => {
    const input = { title: 't', content: 'c', tags: ['a'] };
    const created = { id: '1', ...input, author: 'john' };
    repoMethods.createPost.mockResolvedValueOnce(created);

    const result = await postService.createPost('john', input);
    expect(repoMethods.createPost).toHaveBeenCalledWith({ ...input, author: 'john' });
    expect(result).toEqual(created);
  });

  test('getPostsById returns post when found', async () => {
    const post = { id: '42' };
    repoMethods.findPostById.mockResolvedValueOnce(post);
    await expect(postService.getPostsById('42')).resolves.toEqual(post);
    expect(repoMethods.findPostById).toHaveBeenCalledWith('42');
  });

  test('getPostsById throws when not found', async () => {
    repoMethods.findPostById.mockResolvedValueOnce(null);
    await expect(postService.getPostsById('x')).rejects.toThrow(/not found/i);
  });

  test('addLike returns success when repository updates', async () => {
    const updated = { id: '1', likes: 2 };
    repoMethods.addLike.mockResolvedValueOnce(updated);
    await expect(postService.addLike('1')).resolves.toEqual(updated);
  });

  test('addLike throws when post not found', async () => {
    repoMethods.addLike.mockResolvedValueOnce(null);
    await expect(postService.addLike('missing')).rejects.toThrow(/not found/i);
  });

  test('getPostsByAuthor delegates', async () => {
    const list = [{ id: '1' }];
    repoMethods.getPostsByAuthor.mockResolvedValueOnce(list);
    await expect(postService.getPostsByAuthor('Ann')).resolves.toBe(list);
  });

  test('addComment returns post with comment when found', async () => {
    const postWithComment = { id: '1', comments: [{ user: 'u', message: 'm' }] };
    repoMethods.addComment.mockResolvedValueOnce(postWithComment);
    await expect(postService.addComment('1', 'u', 'm')).resolves.toBe(postWithComment);
    expect(repoMethods.addComment).toHaveBeenCalledWith('1', 'u', 'm');
  });

  test('addComment throws when post not found', async () => {
    repoMethods.addComment.mockResolvedValueOnce(null);
    await expect(postService.addComment('no', 'u', 'm')).rejects.toThrow(/not found/i);
  });

  test('deletePost returns deleted entity', async () => {
    const deleted = { id: '3' };
    repoMethods.deletePost.mockResolvedValueOnce(deleted);
    await expect(postService.deletePost('3')).resolves.toBe(deleted);
  });

  test('deletePost throws when not found', async () => {
    repoMethods.deletePost.mockResolvedValueOnce(null);
    // Service uses error message including "not found"; assert via regex to be resilient
    await expect(postService.deletePost('404')).rejects.toThrow(/not found/i);
  });

  test('getPostsByTags delegates', async () => {
    const list = [{ id: 't1' }];
    repoMethods.getPostsByTags.mockResolvedValueOnce(list);
    await expect(postService.getPostsByTags('js,node')).resolves.toBe(list);
  });

  test('getPostsByPeriod delegates', async () => {
    const list = [{ id: 'p1' }];
    repoMethods.getPostsByPeriod.mockResolvedValueOnce(list);
    await expect(postService.getPostsByPeriod('2020-01-01', '2020-12-31')).resolves.toBe(list);
  });

  test('updatePost returns updated entity', async () => {
    const updated = { id: '7', title: 'new' };
    repoMethods.updatePost.mockResolvedValueOnce(updated);
    await expect(postService.updatePost('7', { title: 'new' })).resolves.toBe(updated);
    expect(repoMethods.updatePost).toHaveBeenCalledWith('7', { title: 'new' });
  });

  test('updatePost throws when not found', async () => {
    repoMethods.updatePost.mockResolvedValueOnce(null);
    await expect(postService.updatePost('777', { title: 'x' })).rejects.toThrow(/not found/i);
  });
});

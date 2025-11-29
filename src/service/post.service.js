import postRepository from '../repositories/post.repository.js';

class PostService {
    async createPost(author, data) {
        return await postRepository.createPost({...data, author});
    };
    async getPostsById(id) {
        const post = await postRepository.findPostById(id);
        if (!post) {
            throw new Error(`Post with id ${id} not found`);
        }
        return post;
    };
    async addLike(id) {
        const success = await postRepository.addLike(id);
        if (!success) {
            throw new Error(`Post with id ${id} not found`);
        }
        return success;
    };
    async getPostsByAuthor(author) {
        return await postRepository.getPostsByAuthor(author)
    };
    async addComment(id, commenter, message) {
        const postWithComment =  await postRepository.addComment(id, commenter, message);
        if (!postWithComment) {
            throw new Error(`Post with id ${id} not found`);
        }
        return postWithComment;

    };
    async deletePost(id) {
        const post = await postRepository.deletePost(id);
        if (!post) {
            throw new Error(`Post with id ${id} not found`);
        }
        return post;
    };
    async getPostsByTags(tagsString) {
        return await postRepository.getPostsByTags(tagsString);
    };
    async getPostsByPeriod(dateFrom, dateTo) {
        return await postRepository.getPostsByPeriod(dateFrom, dateTo);
    };
    async updatePost(id, data) {
        const post = await postRepository.updatePost(id,{...data});
        if (!post) {
            throw new Error(`Post with id ${id} not found`);
        }
        return post;
    };
}

export default new PostService();
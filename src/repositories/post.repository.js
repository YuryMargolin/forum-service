import Post from '../model/post.model.js';
import commentSchema from "../model/comment.model.js";
import {get} from "mongoose";

class PostRepository {
    async createPost(postData) {
        const post = new Post(postData);
        return post.save();
    }

    async findPostById(id) {
        return Post.findById(id);
    }

    async deletePost(id) {
        return Post.findByIdAndDelete(id)
    }

    async addLike(id) {
        return Post.findByIdAndUpdate(id, {$inc: {likes: 1}}, {new: true});
    }

    async getPostsByAuthor(author) {
        return Post.find({author: new RegExp(`^${author}$`, "i")})
    }

    async addComment(id, commenter, message) {
        return Post.findByIdAndUpdate(id, {$push: {comments: {user: commenter, message: message}}}, {new: true});
    }

    async getPostsByTags(tagsString) {
        const tags = tagsString.split(',').map(tag => new RegExp(`^${tag}$`, 'i'));
        return Post.find({tags: {$in: tags}});
    }

    async getPostsByPeriod(dateFrom, dateTo) {
        const dateToAllDay = new Date(dateTo).setHours(23, 59, 59, 999);
        return Post.find({dateCreated: {$gte: new Date(dateFrom), $lte: new Date(dateToAllDay)}});
    }

    async updatePost(id, data) {
        return Post.findByIdAndUpdate(id, data, {new: true});
    }
}

export default new PostRepository();
import {
  getUserById,
  getPostById,
  getPostsByUserId,
  getCommentsByPostId,
  createComment,
} from "../data/mock-data";

export const restHandlers = {
  getUser: ({ params }: { params: { id: string } }) => {
    const user = getUserById(params.id);
    if (!user) {
      return { error: "User not found", status: 404 };
    }
    return user;
  },

  getUserPosts: ({ params }: { params: { id: string } }) => {
    const user = getUserById(params.id);
    if (!user) {
      return { error: "User not found", status: 404 };
    }
    const posts = getPostsByUserId(params.id);
    return posts;
  },

  getPost: ({ params }: { params: { id: string } }) => {
    const post = getPostById(params.id);
    if (!post) {
      return { error: "Post not found", status: 404 };
    }
    return post;
  },

  getPostAuthor: ({ params }: { params: { id: string } }) => {
    const post = getPostById(params.id);
    if (!post) {
      return { error: "Post not found", status: 404 };
    }
    const author = getUserById(post.authorId);
    if (!author) {
      return { error: "Author not found", status: 404 };
    }
    return author;
  },

  getPostComments: ({ params }: { params: { id: string } }) => {
    const post = getPostById(params.id);
    if (!post) {
      return { error: "Post not found", status: 404 };
    }
    const comments = getCommentsByPostId(params.id);
    return comments;
  },

  getComment: ({ params }: { params: { id: string } }) => {
    const { comments } = require("../data/mock-data");
    const comment = comments.find((c: { id: string }) => c.id === params.id);
    if (!comment) {
      return { error: "Comment not found", status: 404 };
    }
    return comment;
  },

  getCommentAuthor: ({ params }: { params: { id: string } }) => {
    const { comments } = require("../data/mock-data");
    const comment = comments.find((c: { id: string }) => c.id === params.id);
    if (!comment) {
      return { error: "Comment not found", status: 404 };
    }
    const author = getUserById(comment.authorId);
    if (!author) {
      return { error: "Author not found", status: 404 };
    }
    return author;
  },

  createComment: ({ body }: { body: unknown }) => {
    const bodyData = body as { postId?: string; authorId?: string; content?: string };
    const { postId, authorId, content } = bodyData;

    if (!postId || !authorId || !content) {
      return { error: "Missing required fields", status: 400 };
    }

    const post = getPostById(postId);
    if (!post) {
      return { error: "Post not found", status: 404 };
    }

    const author = getUserById(authorId);
    if (!author) {
      return { error: "Author not found", status: 404 };
    }

    const newComment = createComment(postId, authorId, content);
    return newComment;
  },
};


import {
  getUserById,
  getPostById,
  getPostsByUserId,
  getCommentsByPostId,
  createComment,
  users,
  posts,
  comments,
  type User,
  type Post,
  type Comment,
} from "../data/mock-data";

export const typeDefs = `
  type Query {
    """Get a user by ID"""
    user(id: ID!): User
    
    """Get a post by ID"""
    post(id: ID!): Post
    
    """Get all users"""
    users: [User!]!
    
    """Get all posts"""
    posts: [Post!]!
  }

  type Mutation {
    """Create a new comment on a post"""
    createComment(postId: ID!, authorId: ID!, content: String!): Comment
  }

  """A user in the system"""
  type User {
    """Unique identifier for the user"""
    id: ID!
    
    """User's full name"""
    name: String!
    
    """User's email address"""
    email: String!
    
    """All posts created by this user"""
    posts: [Post!]!
  }

  """A blog post"""
  type Post {
    """Unique identifier for the post"""
    id: ID!
    
    """Title of the post"""
    title: String!
    
    """Content/body of the post"""
    content: String!
    
    """The user who created this post"""
    author: User!
    
    """All comments on this post"""
    comments: [Comment!]!
    
    """Number of likes on this post"""
    likes: Int!
  }

  """A comment on a post"""
  type Comment {
    """Unique identifier for the comment"""
    id: ID!
    
    """Content of the comment"""
    content: String!
    
    """The user who created this comment"""
    author: User!
    
    """The post this comment belongs to"""
    post: Post!
    
    """When the comment was created"""
    createdAt: String!
  }
`;

export const resolvers = {
  Query: {
    user: (_parent: unknown, args: { id: string }) => {
      return getUserById(args.id);
    },
    post: (_parent: unknown, args: { id: string }) => {
      return getPostById(args.id);
    },
    users: () => {
      return users;
    },
    posts: () => {
      return posts;
    },
  },

  Mutation: {
    createComment: (
      _parent: unknown,
      args: { postId: string; authorId: string; content: string }
    ) => {
      const post = getPostById(args.postId);
      if (!post) {
        throw new Error("Post not found");
      }
      const author = getUserById(args.authorId);
      if (!author) {
        throw new Error("Author not found");
      }
      return createComment(args.postId, args.authorId, args.content);
    },
  },

  User: {
    posts: (parent: User) => {
      return getPostsByUserId(parent.id);
    },
  },

  Post: {
    author: (parent: Post) => {
      return getUserById(parent.authorId);
    },
    comments: (parent: Post) => {
      return getCommentsByPostId(parent.id);
    },
  },

  Comment: {
    author: (parent: Comment) => {
      return getUserById(parent.authorId);
    },
    post: (parent: Comment) => {
      return getPostById(parent.postId);
    },
  },
};


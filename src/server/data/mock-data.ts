export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  likes: number;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
}

export const users: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com" },
  { id: "4", name: "Diana Prince", email: "diana@example.com" },
  { id: "5", name: "Eve Adams", email: "eve@example.com" },
];

export const posts: Post[] = [
  {
    id: "1",
    title: "Getting Started with GraphQL",
    content: "GraphQL is a query language for APIs that allows clients to request exactly the data they need.",
    authorId: "1",
    likes: 42,
  },
  {
    id: "2",
    title: "REST API Best Practices",
    content: "REST APIs have been the standard for web services for many years. Here are some best practices.",
    authorId: "1",
    likes: 35,
  },
  {
    id: "3",
    title: "Understanding TypeScript",
    content: "TypeScript adds static typing to JavaScript, making it easier to catch errors at compile time.",
    authorId: "2",
    likes: 58,
  },
  {
    id: "4",
    title: "Modern Web Development",
    content: "The web development landscape is constantly evolving with new frameworks and tools.",
    authorId: "3",
    likes: 27,
  },
  {
    id: "5",
    title: "AI and LLMs in 2025",
    content: "Large Language Models are transforming how we interact with technology.",
    authorId: "4",
    likes: 91,
  },
  {
    id: "6",
    title: "Database Design Principles",
    content: "Good database design is crucial for scalable applications.",
    authorId: "2",
    likes: 44,
  },
  {
    id: "7",
    title: "API Design Patterns",
    content: "Choosing the right API design pattern can significantly impact your application's performance.",
    authorId: "5",
    likes: 63,
  },
];

export const comments: Comment[] = [
  {
    id: "1",
    content: "Great introduction! Very helpful.",
    postId: "1",
    authorId: "2",
    createdAt: "2025-11-01T10:30:00Z",
  },
  {
    id: "2",
    content: "I've been using GraphQL for a year now and love it.",
    postId: "1",
    authorId: "3",
    createdAt: "2025-11-01T11:15:00Z",
  },
  {
    id: "3",
    content: "How does this compare to REST in terms of performance?",
    postId: "1",
    authorId: "4",
    createdAt: "2025-11-01T14:20:00Z",
  },
  {
    id: "4",
    content: "REST is still very relevant for many use cases.",
    postId: "2",
    authorId: "5",
    createdAt: "2025-11-01T09:45:00Z",
  },
  {
    id: "5",
    content: "Thanks for sharing these best practices!",
    postId: "2",
    authorId: "3",
    createdAt: "2025-11-01T16:00:00Z",
  },
  {
    id: "6",
    content: "TypeScript has made my code so much more maintainable.",
    postId: "3",
    authorId: "1",
    createdAt: "2025-11-02T08:30:00Z",
  },
  {
    id: "7",
    content: "Do you recommend TypeScript for small projects too?",
    postId: "3",
    authorId: "4",
    createdAt: "2025-11-02T10:15:00Z",
  },
  {
    id: "8",
    content: "The type system can be challenging at first but it's worth it.",
    postId: "3",
    authorId: "5",
    createdAt: "2025-11-02T12:00:00Z",
  },
  {
    id: "9",
    content: "What frameworks do you recommend for 2025?",
    postId: "4",
    authorId: "1",
    createdAt: "2025-11-02T14:30:00Z",
  },
  {
    id: "10",
    content: "I'm excited about the future of web development!",
    postId: "4",
    authorId: "2",
    createdAt: "2025-11-02T15:45:00Z",
  },
  {
    id: "11",
    content: "LLMs are changing everything. Great article!",
    postId: "5",
    authorId: "1",
    createdAt: "2025-11-03T07:00:00Z",
  },
  {
    id: "12",
    content: "I've been experimenting with Claude API and it's amazing.",
    postId: "5",
    authorId: "2",
    createdAt: "2025-11-03T08:30:00Z",
  },
  {
    id: "13",
    content: "How do you see LLMs being used in APIs?",
    postId: "5",
    authorId: "3",
    createdAt: "2025-11-03T09:15:00Z",
  },
  {
    id: "14",
    content: "The token efficiency of GraphQL with LLMs is really interesting.",
    postId: "5",
    authorId: "5",
    createdAt: "2025-11-03T10:00:00Z",
  },
  {
    id: "15",
    content: "Normalization vs denormalization is always a tough choice.",
    postId: "6",
    authorId: "4",
    createdAt: "2025-11-02T11:00:00Z",
  },
  {
    id: "16",
    content: "Good database design saves so much time in the long run.",
    postId: "6",
    authorId: "1",
    createdAt: "2025-11-02T13:30:00Z",
  },
  {
    id: "17",
    content: "GraphQL vs REST is exactly what I needed to read about!",
    postId: "7",
    authorId: "3",
    createdAt: "2025-11-03T08:00:00Z",
  },
  {
    id: "18",
    content: "The pattern you choose should match your data structure.",
    postId: "7",
    authorId: "4",
    createdAt: "2025-11-03T09:30:00Z",
  },
];

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getPostById(id: string): Post | undefined {
  return posts.find((post) => post.id === id);
}

export function getPostsByUserId(userId: string): Post[] {
  return posts.filter((post) => post.authorId === userId);
}

export function getCommentsByPostId(postId: string): Comment[] {
  return comments.filter((comment) => comment.postId === postId);
}

export function createComment(
  postId: string,
  authorId: string,
  content: string
): Comment {
  const newComment: Comment = {
    id: String(comments.length + 1),
    content,
    postId,
    authorId,
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  return newComment;
}


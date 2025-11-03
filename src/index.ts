import { Elysia } from "elysia";
import { yoga } from "@elysiajs/graphql-yoga";
import { typeDefs, resolvers } from "./graphql/schema";
import { restHandlers } from "./rest/handlers";

const app = new Elysia()
  .get("/", () => ({
    message: "GraphQL vs REST Demo Server",
    endpoints: {
      graphql: "/graphql",
      rest: {
        users: "/rest/users/:id",
        userPosts: "/rest/users/:id/posts",
        posts: "/rest/posts/:id",
        postAuthor: "/rest/posts/:id/author",
        postComments: "/rest/posts/:id/comments",
        comments: "/rest/comments/:id",
        commentAuthor: "/rest/comments/:id/author",
        createComment: "POST /rest/comments",
      },
    },
  }))
  .use(
    yoga({
      typeDefs,
      resolvers: resolvers as never,
    })
  )
  .get("/rest/users/:id", restHandlers.getUser)
  .get("/rest/users/:id/posts", restHandlers.getUserPosts)
  .get("/rest/posts/:id", restHandlers.getPost)
  .get("/rest/posts/:id/author", restHandlers.getPostAuthor)
  .get("/rest/posts/:id/comments", restHandlers.getPostComments)
  .get("/rest/comments/:id", restHandlers.getComment)
  .get("/rest/comments/:id/author", restHandlers.getCommentAuthor)
  .post("/rest/comments", restHandlers.createComment)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📊 GraphQL endpoint: http://localhost:3000/graphql`);
console.log(`🔗 REST endpoints: http://localhost:3000/rest/*`);

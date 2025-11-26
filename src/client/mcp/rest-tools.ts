import Anthropic from "@anthropic-ai/sdk";


export const REST_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_user",
    description: "Get a user by their ID. Returns user information including id, name, and email.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the user to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_user_posts",
    description: "Get all posts created by a specific user.",
    input_schema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The ID of the user whose posts to retrieve",
        },
      },
      required: ["userId"],
    },
  },
  {
    name: "get_post",
    description: "Get a post by its ID. Returns post information including id, title, content, authorId, and likes.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the post to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_post_author",
    description: "Get the author of a specific post.",
    input_schema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "The ID of the post whose author to retrieve",
        },
      },
      required: ["postId"],
    },
  },
  {
    name: "get_post_comments",
    description: "Get all comments on a specific post.",
    input_schema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "The ID of the post whose comments to retrieve",
        },
      },
      required: ["postId"],
    },
  },
  {
    name: "get_comment_author",
    description: "Get the author of a specific comment.",
    input_schema: {
      type: "object",
      properties: {
        commentId: {
          type: "string",
          description: "The ID of the comment whose author to retrieve",
        },
      },
      required: ["commentId"],
    },
  },
  {
    name: "create_comment",
    description: "Create a new comment on a post.",
    input_schema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "The ID of the post to comment on",
        },
        authorId: {
          type: "string",
          description: "The ID of the user creating the comment",
        },
        content: {
          type: "string",
          description: "The content of the comment",
        },
      },
      required: ["postId", "authorId", "content"],
    },
  },
];



import { Elysia } from "elysia";

/*
	* high level concepts:
	* I'm preparing a presentation for AI meetup.
	* The talk is why GraphQL-like tools should be used for hierarhical data over REST type of interfaces
	* Using GraphQL over REST for LLMs to limit the amount of roundtrips as well as improve tool calling
	* Idea would be to pass in the description the schema of the graphql
*
	*
	* Example schema i thought of: type Query {
  user(id: ID!): User
  post(id: ID!): Post
}

type Mutation {
  createComment(postId: ID!, content: String!): Comment
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  likes: Int!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  createdAt: String!
}
*
	*
	*
	* Projet will have to provide minimalistic example of server woring with A) REST B) GraphQL.
	* There will be 2 agents, one using A and second using B.
	*
	* The data should be mocked and functions should use built-in fucntions to operate on the data. There will be NO database involved, this is purely for experimental purposes.
	*
	* The end goal is for the agents to have tools (one for REST-like api, one for GraphQL-api) and to be able to compare how code looks like in one scenario and how in the other.
	* FOr that reason, agents should use separate piece s of code
	* 
	* ## Presentation parts
	* 
	* ### Agent A (REST)
	* ### AGENT B (GraphQL)
	* 
	* ### Takeaways
	* The result should indicate the token savings of graphql over rest. There shall be a note in graphql statement that the schemas require descriptions in order to have better precision for tool calling
	* 
	* #### Specifics
	* A and B should have separate files used for the code. The underlying data that is queried shall be mocked and identical for both scenarios.
	* 
	* Things that also could be cover: when there is no benefit from such approach (not hierarhical data)
	* YOu can use any libraries you wish to use. I will be using anthropic claude sonent 4.5 as an LLM.
	*
		*
	*
	*
	*
	*
	*
	*
	*
	*
	*
	*
	*
	* */

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

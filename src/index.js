const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const app = express();

const notes = [
  { id: '1', content: 'Learn Graphql', author: 'Kaung Khant Thar' },
  { id: '2', content: 'Learn Nextjs and Graphql', author: 'Sayargyi' },
  { id: '3', content: 'Learn Python', author: 'KKT' }
];

const typeDefs = gql`
  type Query {
    hello: String!
    notes: [Note!]!
    note(id: ID!): Note
  }
  type Mutation {
    newNote(content: String!): Note!
  }
  type Note {
    id: ID!
    content: String!
    author: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello world graphql',
    notes: () => notes,
    note: (parent, args) => {
      const note = notes.find(note => note.id === args.id);

      return note;
    }
  },
  Mutation: {
    newNote: (parent, args) => {
      const newNote = {
        id: String(notes.length + 1),
        content: args.content,
        author: 'Kaung Khant Thar'
      };
      notes.push(newNote);
      return newNote;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app, path: '/api' });

const port = process.env.PORT || 4000;

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);

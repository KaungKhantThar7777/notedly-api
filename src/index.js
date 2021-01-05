require('dotenv').config();

const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

const db = require('./db');
const models = require('./models');

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
    notes: async () => {
      return await models.Note.find();
    },
    note: async (parent, args) => {
      return await models.Note.findById(args.id);
    }
  },
  Mutation: {
    newNote: async (parent, args) => {
      return await models.Note.create({
        content: args.content,
        author: 'Kaung Khant Thar'
      });
    }
  }
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app, path: '/api' });

const DB_HOST = process.env.DB_HOST;
db.connect(DB_HOST);
const port = process.env.PORT || 4000;

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');

const Mutation = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: 'Kaung Khant Thar'
    });
  },
  updateNote: async (parent, { id, content }, { models }) => {
    return await models.Note.findOneAndUpdate(
      { _id: id },
      { $set: { content } },
      { new: true }
    );
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (error) {
      return false;
    }
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);
    email = email.trim().toLowerCase();
    try {
      const user = await models.User.create({
        username,
        email,
        password: hashed,
        avatar
      });

      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      throw new AuthenticationError('User Not Found');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Passwords not match');
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};

module.exports = Mutation;

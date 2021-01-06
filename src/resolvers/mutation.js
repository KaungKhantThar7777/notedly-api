const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

const gravatar = require('../util/gravatar');

const Mutation = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note.');
    }

    console.log(user);
    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id)
    });
  },
  updateNote: async (parent, { id, content }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note.');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user._id) {
      throw new ForbiddenError("You don't permissions to delete the note.");
    }
    return await models.Note.findOneAndUpdate(
      { _id: id },
      { $set: { content } },
      { new: true }
    );
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note.');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user._id) {
      throw new ForbiddenError("You don't permissions to delete the note.");
    }
    try {
      await note.remove();
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
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    const noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.includes(user.id);
    console.log(user);
    if (hasUser) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true
        }
      );
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      );
    }
  }
};

module.exports = Mutation;

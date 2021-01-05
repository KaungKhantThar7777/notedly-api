const mongoose = require('mongoose');

module.exports = {
  connect: DB_HOST => {
    // Use the Mongo driver's updated URL string parser
    mongoose.set('useNewUrlParser', true);
    // Use findOneAndUpdate() in place of findAndModify()
    mongoose.set('useFindAndModify', false);
    // Use createIndex() in place of ensureIndex()
    mongoose.set('useCreateIndex', true);
    // Use the new server discovery and monitoring engine
    mongoose.set('useUnifiedTopology', true);

    mongoose.connect(DB_HOST);

    mongoose.connection.on('error', err => {
      console.log(err);
      console.log(
        'Failed to connect to mongodb. Please make sure mongodb is running'
      );
      process.exit(1);
    });
  },
  close: () => {
    mongoose.connection.close();
  }
};

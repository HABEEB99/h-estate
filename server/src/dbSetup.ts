import Logger from 'bunyan';
import mongoose from 'mongoose';
import { config } from '@root/config';

const log: Logger = config.createLogger('DataBase');

const dbConnect = () => {
  const connect = () => {
    mongoose
      .connect(`${config.MONGODB_URL}`)
      .then(() => log.info('Connected to DB'))
      .catch((error) => {
        log.error('Connection Error:', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};

export default dbConnect;

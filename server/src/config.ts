import dotenv from 'dotenv';
import bunyan from 'bunyan';

dotenv.config({});

class Config {
  CLIENT_BASE_URL: string | undefined;
  MONGODB_URL: string | undefined;
  NODE_ENV: string | undefined;
  JWT_TOKEN: string | undefined;
  FIRST_SECRET_KEY: string | undefined;
  SECOND_SECRET_KEY: string | undefined;
  REDIS_HOST: string | undefined;

  constructor() {
    this.CLIENT_BASE_URL = process.env.CLIENT_BASE_URL;
    this.MONGODB_URL = process.env.MONGODB_URL;
    this.NODE_ENV = process.env.NODE_ENV;
    this.JWT_TOKEN = process.env.JWT_TOKEN;
    this.FIRST_SECRET_KEY = process.env.FIRST_SECRET_KEY;
    this.SECOND_SECRET_KEY = process.env.SECOND_SECRET_KEY;
    this.REDIS_HOST = process.env.REDIS_HOST;
  }

  createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }
}

export const config: Config = new Config();

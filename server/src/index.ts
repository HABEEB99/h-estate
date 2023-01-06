import { HestateServer } from './serverSetup';
import express, { Express } from 'express';
import dbConnect from './dbSetup';
import { config } from './config';

class App {
  initialize(): void {
    this.#loadConfig;
    dbConnect();
    const app: Express = express();
    const server: HestateServer = new HestateServer(app);
    server.startApp();
  }

  #loadConfig(): void {
    config.validateConfig();
  }
}

const application: App = new App();

application.initialize();

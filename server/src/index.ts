import express, { Express } from 'express';
import { HestateServer } from '@root/serverSetup';
import dbConnect from '@root/dbSetup';
import { config } from '@root/config';

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

import { Application, NextFunction, Request, Response, urlencoded, json } from 'express';
import Logger from 'bunyan';
import http from 'http';
import cors from 'cors';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import compression from 'compression';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import { config } from '@root/config';
import appRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/errorHandler';

const log: Logger = config.createLogger('Server');

const PORT = 4000;

export class HestateServer {
  #app: Application;
  constructor(app: Application) {
    this.#app = app;
  }

  startApp(): void {
    this.#securityMiddleware(this.#app);
    this.#standardMiddleware(this.#app);
    this.#routesMiddleware(this.#app);
    this.#globalErrorHandler(this.#app);
    this.#startServer(this.#app);
  }

  #securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.FIRST_SECRET_KEY!, config.SECOND_SECRET_KEY!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );

    app.use(hpp());

    app.use(helmet());

    app.use(
      cors({
        origin: config.CLIENT_BASE_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  #standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  #routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  #globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  async #createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_BASE_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  async #startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.#createSocketIO(httpServer);
      this.#startHttpServer(httpServer);
      this.#socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  #startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(PORT, () => {
      log.info(`Server running on PORT ${PORT}`);
    });
  }

  #socketIOConnections(io: Server): void {
    log.info('Socket');
  }
}

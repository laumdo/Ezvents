import express from 'express';
import usuariosApiRouter from './usuarios/api/router.js';

const apiRouter = express.Router();
apiRouter.use(express.json());

apiRouter.use('/usuarios', usuariosApiRouter);

export default apiRouter;
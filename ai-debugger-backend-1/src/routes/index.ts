import { Router } from 'express';
import IndexController from '../controllers/index';

const router = Router();
const indexController = new IndexController();

export const setRoutes = (app: any) => {
  app.use('/api/debugger', router);

  router.post('/explain', indexController.explain);
  router.post('/debug', indexController.debug);
  router.post('/simulate', indexController.simulate);
  router.post('/decorations', indexController.decorations);
  router.post('/upload-abi', indexController.uploadAbi);
};
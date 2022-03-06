import { Router } from 'express';
import v1ApiRouter from './v1.api';


const routes = Router();

routes.use('/api/v1', v1ApiRouter);


export default routes;
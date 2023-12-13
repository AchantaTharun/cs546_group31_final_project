import adminRouter from './adminRoutes.js';
import eventRouter from './eventRoutes.js';
import gymRouter from './gymRoutes.js';
import postRouter from './postRoutes.js';
import userRouter from './userRoutes.js';
import trainerRouter from './trainerRoutes.js';
import sessionRouter from './sessionRoutes.js';
import mealPlanRouter from './mealPlanRoutes.js';
import trainerWebRoutes from './web/trainerWebRoutes.js';
import accountRoutes from './accountRoutes.js';
import userWebRoutes from './web/userWebRoutes.js';
import gymWebRoutes from './web/gymWebRoutes.js';

const constructorMethod = (app) => {
  // Routes
  app.use('/', accountRoutes);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/events', eventRouter);
  app.use('/api/v1/gym', gymRouter);
  app.use('/api/v1/posts', postRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/trainer', trainerRouter);
  app.use('/api/v1/session', sessionRouter);
  app.use('/api/v1', mealPlanRouter);

  app.use('/trainer', trainerWebRoutes);
  app.use('/user', userWebRoutes);
  app.use('/gym', gymWebRoutes);

  app.all('*', (req, res) => {
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`,
    });
  });
};

export default constructorMethod;

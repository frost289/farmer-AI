import { Router } from 'express';
import { authenticate } from './middleware/authenticate.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import farmsRoutes from './modules/farms/farms.routes.js';
import plantingsRoutes from './modules/plantings/plantings.routes.js';
import diagnosesRoutes from './modules/diagnoses/diagnoses.routes.js';
import advisoryRoutes from './modules/advisory/advisory.routes.js';
import weatherRoutes from './modules/weather/weather.routes.js';
import recommendationsRoutes from './modules/recommendations/recommendations.routes.js';
import outbreaksRoutes from './modules/outbreaks/outbreaks.routes.js';
import alertsRoutes from './modules/alerts/alerts.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes); // auth.routes.js applies its own rate limiter
router.use('/users', authenticate, usersRoutes);
router.use('/farms/:id/plantings', authenticate, plantingsRoutes);
router.use('/farms', authenticate, farmsRoutes);
router.use('/diagnoses', authenticate, diagnosesRoutes);
router.use('/advisory', authenticate, advisoryRoutes);
router.use('/weather', authenticate, weatherRoutes);
router.use('/', authenticate, recommendationsRoutes); // /recommendations/crops, /planting-readiness
router.use('/outbreaks', authenticate, outbreaksRoutes);
router.use('/alerts', authenticate, alertsRoutes);
router.use('/admin', authenticate, adminRoutes);

export default router;

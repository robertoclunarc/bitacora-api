import { Router } from 'express';

import { sendReunionNotification } from '../controllers/mailer.controller';

const router = Router();

router.post('/reunion', sendReunionNotification);

export default router;
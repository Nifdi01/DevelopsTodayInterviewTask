import { Router } from 'express';
import { handleAgentQuery } from '../controllers/AgentController';

const router = Router();

router.post('/', handleAgentQuery);

export default router;
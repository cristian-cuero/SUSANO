import express from 'express';
import { conversar } from '../controllers/aiController.js';

const router = express.Router();

router.post('/conversar', conversar);

export default router;
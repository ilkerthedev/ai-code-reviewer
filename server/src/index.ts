import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { reviewRouter } from './routes/review';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/review', reviewRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
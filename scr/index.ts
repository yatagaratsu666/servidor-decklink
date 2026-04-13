import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './modules/auth/routes/authRoutes';
import cartaRoutes from './modules/cartas/routes/CartaRoutes';
import loteRoutes from './modules/lotes/routes/LotesRoutes';


import { connectMongo } from './config/mongo';

dotenv.config();

const PORT = process.env['PORT'] || 3000;

const app = express();

app.use(cors({ origin: 'http://localhost:8081' })); // ya despues pongo q se pueda con el q sea en el env xdxdxd

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use(express.json());

connectMongo();

app.use('/api/auth', authRoutes);
app.use('/api/cartas', cartaRoutes);
app.use('/api/lotes', loteRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
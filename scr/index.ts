import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './modules/auth/routes/authRoutes';
import cartaRoutes from './modules/cartas/routes/CartaRoutes';
import loteRoutes from './modules/lotes/routes/LotesRoutes';

// 🔥 NUEVO
import { connectMongo } from './config/mongo';

dotenv.config();

const PORT = process.env['PORT'] || 3000;

const app = express();

// ✅ CORS limpio
app.use(cors({ origin: 'http://localhost:8081' }));

// ✅ JSON
app.use(express.json());

// 🔥 CONECTAR MONGO
connectMongo();

// ✅ RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/cartas', cartaRoutes);
app.use('/api/lotes', loteRoutes);

// ✅ SERVER
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
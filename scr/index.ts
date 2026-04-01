import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/routes/authRoutes';
import cartaRoutes from './modules/cartas/routes/CartaRoutes';
import loteRoutes from './modules/lotes/routes/LotesRoutes';
dotenv.config();

const PORT = process.env['PORT'] || 3000;

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cartas', cartaRoutes);
app.use('/api/lotes', loteRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
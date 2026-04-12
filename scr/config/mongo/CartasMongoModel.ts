import mongoose from "mongoose";

const CartaSchema = new mongoose.Schema({
  id_carta: String,
  nombre: String,
  juego: String,
  edicion: String,
  numero: String,
  rareza: String,
  imagen_url: String,
  descripcion: String,
  tipo: [String]
});

export const CartaMongo = mongoose.model("Carta", CartaSchema);
export interface Carta {
  id_carta?: string;
  nombre: string;
  juego?: string;
  edicion?: string;
  numero?: string;
  rareza?: string;
  imagen_url?: string;
  descripcion?: string;
  id_usuario?: number;
  tipo?: string[];
}
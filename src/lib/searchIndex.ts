/**
 * Tipos compartidos del sistema de búsqueda.
 *
 * La carga masiva del índice fue eliminada: el buscador ahora hace
 * consultas en tiempo real con debounce a /api/search?q=<término>.
 */

export interface SearchItem {
  nombre:      string;
  descripcion: string;
  marca:       string;
  categoria:   string;
  seccion:     string;
  href:        string;
  imagen?:     string;
}

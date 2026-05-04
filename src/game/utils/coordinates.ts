// Convierte una posicion del tablero a texto para guardarla facilmente en un Set.
export function coordToString(col: number, row: number): string {
  return `${col},${row}`;
}

// Recupera columna y fila desde el formato usado internamente para las fichas.
export function stringToCoord(coord: string): { col: number; row: number } {
  const [col, row] = coord.split(',').map(Number);
  return { col, row };
}

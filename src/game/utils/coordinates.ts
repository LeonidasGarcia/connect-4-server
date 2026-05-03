export function coordToString(col: number, row: number): string {
  return `${col},${row}`;
}

export function stringToCoord(coord: string): { col: number; row: number } {
  const [col, row] = coord.split(',').map(Number);
  return { col, row };
}
import { COLS, Square } from "./consts";
import { Position, Board as BoardType, Move } from "./types";

export class Board implements BoardType {
  public readonly rows: number;
  public readonly cols: number;
  public readonly board: Square[][];
  private col_names: string;

  constructor(board: Square[][]) {
    this.board = board;
    this.cols = board.length;
    this.rows = board[0].length;
    this.col_names = COLS.substring(0, this.cols).split("").reverse().join("");
  }
  get(pos: Position) {
    let [row, col] = this.get_index(pos);
    return this.board[row][col];
  }

  get_index(pos: Position) {
    let indexes: [number, number] = [
      Number(pos.substring(1)),
      this.col_names.indexOf(pos[0]),
    ];
    return indexes;
  }

  move(move: Move) {
    let parts = move.split("-");
    let [r1, c1] = this.get_index(parts[0] as Position);
    let [r2, c2] = this.get_index(parts[1] as Position);
    let [r3, c3] = this.get_index(parts[2] as Position);

    this.board[r2][c2] = this.board[r1][c1];
    this.board[r1][c1] = Square.EMPTY;
    this.board[r3][c3] = Square.ARROW;
  }

  undo(move: Move) {
    let parts = move.split("-");
    let [r1, c1] = this.get_index(parts[0] as Position);
    let [r2, c2] = this.get_index(parts[1] as Position);
    let [r3, c3] = this.get_index(parts[2] as Position);

    this.board[r3][c3] = Square.EMPTY;
    this.board[r1][c1] = this.board[r2][c2];
    this.board[r2][c2] = Square.EMPTY;
  }
}

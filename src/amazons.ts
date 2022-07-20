import { DEFAULT_POSITIONS, LAYOUT_MAP } from "./consts";
import { Engine } from "./engine";
import { FEN, Move, Piece, SqColor, Square, Validation } from "./types";
import { assert } from "./util";
import {
  is_valid_fen,
  is_default_size,
  is_square_in_range,
} from "./validation";

export const Amazons = (fen_or_size?: number | FEN) => {
  // INITIAL SETUP
  let engine = try_load(fen_or_size);

  // VARIABLES
  let { rows, cols } = engine;

  let moves: Move[];
  let moves_dict: { [sq: string]: Square[] };
  let pieces: { [piece: string]: Square[] };

  let update = () => {
    // update list
    moves = engine.moves();

    // update dict
    moves_dict = {};
    for (let m of moves) {
      let [start, end] = m;
      if (!moves_dict[start]) moves_dict[start] = [];
      if (end) moves_dict[start].push(end);
    }

    // update pieces
    let new_pieces = engine.get_pieces();
    pieces = {};
    for (let [k, v] of Object.entries(new_pieces)) {
      pieces[LAYOUT_MAP[k]] = v;
    }
  };

  // initial values
  update();

  // RETURN OBJECT
  return {
    ascii: (flip = false) => engine.ascii(flip),
    board: () => engine.board,
    // clear
    // delete_comment
    // delete_comments
    fen: () => engine.fen(),
    game_over: () => moves.length === 0,
    get: (sq: Square) => {
      assert(is_square_in_range(sq, rows, cols));
      return engine.get(sq);
    },
    // get_comment
    // header
    history: () => engine.history,
    in_endgame: null, //TODO
    load: (fen_or_size: any) => {
      try {
        let eng = try_load(fen_or_size);
        engine = eng;
        ({ rows, cols } = eng);
        update();
        return true;
      } catch {
        return false;
      }
    },
    // load_pgn
    move: (m: Move) => {
      if (moves.some((v) => v[0] === m[0] && v[1] === m[1] && v[2] === m[2])) {
        engine.move(m);
        update();
        // TODO return move object
        return true;
      }
      return false;
    },
    random_move: () => {
      if (moves.length === 0) return false;
      engine.move(moves[Math.floor(Math.random() * moves.length)]);
      update();
      return true;
    },
    move_num: () => engine.move_num,
    moves: () => {
      return moves;
    },
    moves_dict: () => moves_dict,
    pieces: () => pieces,
    // pgn
    put: (piece: Piece, sq: Square) => {
      assert(is_square_in_range(sq, rows, cols));
      engine.put(piece, sq);
    },
    remove: (sq: Square) => {
      assert(is_square_in_range(sq, rows, cols));
      let p = engine.get(sq);
      engine.put(Piece.EMPTY, sq);
      return p;
    },
    // reset
    // set_comment
    shooting: () => engine.shooting_sq !== null,
    shooting_sq: () => engine.shooting_sq,
    square_color: (sq: Square) => {
      assert(is_square_in_range(sq, rows, cols));
      // TODO square to coords
      // let color = engine.sq_color(sq)
      let color;
      return color === SqColor.LIGHT ? "light" : "dark";
    },
    turn: () => engine.turn,
    half_undo: () => {
      engine.half_undo();
      moves = engine.moves();
    },
    undo: () => {
      engine.undo();
      moves = engine.moves();
    },
    validate_fen: (fen: string) => is_valid_fen(fen),
  };
};

function try_load(fen_or_size) {
  let fen: FEN;
  let engine: Engine;

  switch (typeof fen_or_size) {
    case "undefined":
      fen = DEFAULT_POSITIONS[10];
      break;

    case "number":
      fen = assert(is_default_size(fen_or_size)).fen;
      break;

    case "string":
      fen = fen_or_size.toLowerCase() as FEN;
      engine = assert(is_valid_fen(fen)).engine;
      break;

    default:
      throw new Error(
        "parameter must be either a board size or a string representing a FEN."
      );
  }

  if (typeof engine === "undefined") engine = new Engine(fen);

  return engine;
}

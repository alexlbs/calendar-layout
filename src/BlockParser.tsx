import { useCallback } from "react";
import { Block, EndOfLineState } from "typescript";

export interface BlockData {
  from: Date;
  to: Date;
  text?: string;
  color?: string;
}

function parseLine(line: string): BlockData | null {
  const res = /^(.+)-(.+) (#?\w+) (.*)$/.exec(line)
  if (!res)
    return null;
  return {
    from: new Date("2022-09-01 " + res[1].trim() + " UTC"),
    to: new Date("2022-09-01 " + res[2].trim() + " UTC"),
    color: res[3].trim(),
    text: res[4]
  }
}

export function parseBlockData(text: string): {blocks: BlockData[], error: string} {
  const lines = text.split("\n");
  const blocks = lines.map(parseLine)
  const errors = lines.map((line, idx) => !blocks[idx]? line: "").filter(v => !!v);
  return {
    blocks: blocks.filter((block): block is BlockData => !!block),
    error: errors.join("\n"),
  };
} 
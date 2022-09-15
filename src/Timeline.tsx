import { FC, useMemo } from "react";
import Block from "./Block";
import { BlockData } from "./BlockParser";
import { BlockLayout } from "./Block"

interface TimelineProps {
  blocks: BlockData[];
}

const MsPerDay = 24 * 60 * 60 * 1000;

const DayLineWidth = 300;

interface TimeInterval {
  start: number; // ms from 00:00
  end: number;
  line: number;
  block: BlockData;
  index: number;
}

interface TimeEvent {
  time: number;
  start: boolean;
  interval: TimeInterval;
}

function getLine(lines: number[]): number {
  let min_idx = 0;
  for (let i = 1; i < lines.length; i++)
    if (lines[min_idx] > lines[i])
      min_idx = i;
  const res = lines[min_idx];
  lines.splice(min_idx, 1);
  return res;
}

function isFree(lineEvents: TimeEvent[], from: number, to: number) {
  for (let i = 0; i + 1 < lineEvents.length; i += 2) {
    if (lineEvents[i].time < to && from < lineEvents[i + 1].time){
      return false;
    }
  }
  return true;
}

function removeInterval(lineEvents: TimeEvent[], interval: TimeInterval) {
  for (let i = 0; i < lineEvents.length; i += 2) {
    if (lineEvents[i].interval === interval) {
      lineEvents.splice(i, 2);
    }
  }
}

function addInterval(lineEvents: TimeEvent[], interval: TimeInterval) {
  let i = 0;
  while (i < lineEvents.length && lineEvents[i].time < interval.start)
    i += 2;
  lineEvents.splice(i, 0, 
    {time: interval.start, start: true, interval}, 
    {time: interval.end, start: false, interval});
}

function layoutBlocks(blocks: BlockData[]): BlockLayout[] {

  const intervals = blocks.map<TimeInterval>((b, index) => {
    const start = b.from.getTime() % MsPerDay;
    const end = b.to.getTime() % MsPerDay;
    return {
      start: Math.min(start, end), 
      end: Math.max(start, end),
      line: 0,
      block: b,
      index,
    };
  });

  const events: TimeEvent[] = [];
  intervals.forEach(interval => {
    events.push({time: interval.start, start: true, interval});
    events.push({time: interval.end, start: false, interval});
  })
  events.sort((a, b) => {
    let res = a.time - b.time;
    if (res === 0)
      res = +a.start - +b.start;
    return res;
  });
  
  let freeLines: number[] = [];
  let lineCount = 0;
  let lineEvents: TimeEvent[][] = [];
  const layout = Array<BlockLayout>(blocks.length);
  
  const getBestPos = (line: number, from: number, to: number): number[] => {
    let p = 0;
    let bestPos = line;
    let bestLen = 1;
    while (p < lineCount) {
      while (p < lineCount && p !== line && !isFree(lineEvents[p], from ,to))
        p++;
      const ps = p;
      while (p < lineCount && (p === line || isFree(lineEvents[p], from ,to)))
        p++;
      if (p - ps > bestLen) {
        bestPos = ps;
        bestLen = p - ps;
      }
    }
    return [bestPos, bestLen];
  }

  const processLines = () => {
    const lineWidth = DayLineWidth / lineCount;
    for (let line = lineCount - 1; line >= 0; line--) {
      for (let i = lineEvents[line].length - 2; i >= 0; i -= 2) {
        const e = lineEvents[line][i];
        const iv = e.interval;
        if (layout[iv.index])
          continue;
        const [first, len] = getBestPos(line, iv.start, iv.end);
        if (line < first || first + len <= line) {
          removeInterval(lineEvents[line], iv);
        }
        for (let j = first; j < first + len; j++) {
          if (j !== line) {
            addInterval(lineEvents[j], iv);
          }
        }
//        console.log("layout block ", iv.block.text, "line ", first, len);
        layout[iv.index] = {
          top: iv.start,
          bottom: iv.end,
          width: lineWidth * len,
          offset: first * lineWidth,
          block: iv.block,
        };
      }
    }
    lineCount = 0;
    lineEvents = [];
    freeLines = [];
  }

  for (let e of events) {
    if (e.start) {
      const line = (freeLines.length > 0)? getLine(freeLines): lineCount++;
      e.interval.line = line;
      if (lineEvents.length === line)
        lineEvents.push([]);
      lineEvents[line].push(e);
    } else {
      const line = e.interval.line;
      freeLines.push(line);
      lineEvents[line].push(e);

      if (freeLines.length === lineCount) {
        processLines();
      }
    }
  }
  processLines();
  return layout;
}

const Timeline: FC<TimelineProps> = ({blocks}) => {
//  console.log("TIme line");
  const layout = useMemo(() => layoutBlocks(blocks), [blocks]);
  //const layout: BlockLayout[] =[];
  return (<div className="tm">
    { layout.map(v => (<Block layout={v} />)) }
  </div>);
} 

export default Timeline;

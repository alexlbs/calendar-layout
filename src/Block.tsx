import { FC } from "react";
import { BlockData } from "./BlockParser";

interface BlockProps {
  layout: BlockLayout;
}

export const MsPerDay = 24 * 60 * 60 * 1000;

export interface BlockLayout {
  top: number;
  bottom: number;
  offset: number;
  width: number;
  block: BlockData;
}

const Block: FC<BlockProps> = ({layout}) => {
  const {color, text} = layout.block;
  return (<div className="block"
    style={{
      top: `${layout.top * 100 / MsPerDay}%`,
      bottom: `${(MsPerDay - layout.bottom) * 100 / MsPerDay}%`,
      left: layout.offset,
      right: 300 - (layout.offset + layout.width),
      backgroundColor: color
    }}>
    {text}
  </div>)
} 

export default Block;

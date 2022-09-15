import React, { useState } from 'react';
import logo from './logo.svg';
import { BlockData, parseBlockData } from './BlockParser';
import './App.css';
import Timeline from './Timeline';

const testData = `
0:00 - 5:00 lightblue 1
2:00 - 7:00 yellow 2
5:00 - 6:00 lightgreen 3
5:00 - 6:00 lightgreen 4
5:00 - 6:00 lightgreen 5
5:00 - 6:00 lightgreen 6
6:00 - 9:00 pink 7
6:00 - 9:00 pink 8
10:00 - 15:00 purple 9
17:00 - 20:00 orange 10
17:00 - 22:00 orange 11
`;

function App() {
  const [blocks, setBlocks] = useState<BlockData[]>(parseBlockData(testData).blocks);
  const [parseError, setParseError] = useState("");
  return (
    <div className="App">
      <div style={{width: '100%', display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
        <Timeline blocks={blocks}/>
        <div>
        <textarea style={{display:"flex", width: '300px', height: '60vh'}} defaultValue={testData}
          onChange={(e) => {
            const {blocks, error} = parseBlockData(e.target.value);
            setBlocks(blocks);
            setParseError(error);
          }}
        ></textarea>
        <pre style={{color: "red"}}>{parseError && `Parse Error:\n ${parseError}`}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;

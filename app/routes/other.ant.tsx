import type { MetaFunction } from "@remix-run/cloudflare";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "~/components/Button";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("other", "ant");
};

const GRID_WIDTH = 160;
const GRID_HEIGHT = 90;
const CELL_SIZE = 6;
const DIRECTIONS = [
  [-1, 0], // up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];

interface Ant {
  x: number;
  y: number;
  direction: number;
  color: string;
  id: number;
}

export default function LangtonsAnt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generation, setGeneration] = useState(0);
  const [antsCount, setAntsCount] = useState(1);
  const gridRef = useRef<number[][]>(
    Array(GRID_HEIGHT)
      .fill(0)
      .map(() => Array(GRID_WIDTH).fill(0))
  );
  const antsRef = useRef<Ant[]>([]);
  const animationFrameRef = useRef<number>();
  const [running, setRunning] = useState(false);
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cellValue = gridRef.current[y][x];
        if (cellValue !== 0) {
          const ant = antsRef.current.find((a) => a.id === cellValue);
          if (ant) {
            ctx.fillStyle = ant.color;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
  }, []);
  const update = useCallback(() => {
    const newGrid = gridRef.current.map((row) => [...row]);
    for (const ant of antsRef.current) {
      const currentCell = gridRef.current[ant.y][ant.x];
      if (currentCell === 0) {
        ant.direction = (ant.direction + 1) % 4;
        newGrid[ant.y][ant.x] = ant.id;
      } else {
        ant.direction = (ant.direction + 3) % 4;
        newGrid[ant.y][ant.x] = 0;
      }
      ant.x = (ant.x + DIRECTIONS[ant.direction][1] + GRID_WIDTH) % GRID_WIDTH;
      ant.y =
        (ant.y + DIRECTIONS[ant.direction][0] + GRID_HEIGHT) % GRID_HEIGHT;
    }
    gridRef.current = newGrid;
    drawGrid();
  }, [drawGrid]);
  const animate = useCallback(() => {
    if (!running) return;
    update();
    setGeneration((prev) => prev + 1);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [running, update]);
  const handleReset = useCallback(() => {
    setRunning(false);
    setGeneration(0);
    setAntsCount(1);
    gridRef.current = Array(GRID_HEIGHT)
      .fill(0)
      .map(() => Array(GRID_WIDTH).fill(0));
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    antsRef.current = [
      {
        x: startX,
        y: startY,
        direction: 0,
        color: "rgb(255, 0, 0)",
        id: 1,
      },
    ];
    drawGrid();
  }, [drawGrid]);
  const handleAdd = useCallback(() => {
    const newId = antsRef.current.length + 1;
    const newAnt: Ant = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
      direction: Math.floor(Math.random() * 4),
      color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
      id: newId,
    };
    antsRef.current.push(newAnt);
    setAntsCount((prev) => prev + 1);
  }, []);
  useEffect(() => {
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    antsRef.current = [
      {
        x: startX,
        y: startY,
        direction: 0,
        color: "rgb(255, 0, 0)",
        id: 1,
      },
    ];
  }, []);
  useEffect(() => {
    if (running) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [running, animate]);
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);
  return (
    <div>
      <h1 className="text-2xl font-bold">{getTitle("other", "ant")}</h1>
      <div className="p-2">
        <div className="flex space-x-2 mb-2">
          <div>Generation: {generation}, </div>
          <div>Ants: {antsCount}</div>
        </div>
        <div className="mb-2">
          <canvas ref={canvasRef} className="border border-gray-300 w-full" />
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setRunning(!running)}>
            {running ? "Stop" : "Start"}
          </Button>
          <Button onClick={handleReset} disabled={generation === 0}>
            Reset
          </Button>
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </div>
    </div>
  );
}

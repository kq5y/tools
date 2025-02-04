import type { MetaFunction } from "@remix-run/cloudflare";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "~/components/Button";
import { ValidatedNumberInput } from "~/components/ValidatedNumberInput";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("simulation", "sorting");
};

interface SortStep {
  bars: number[];
  comparisons: number[];
}

const generateRandomBars = (count: number, range = 290, start = 10): number[] =>
  Array.from(
    { length: count },
    () => Math.floor(Math.random() * range) + start
  );

function* insertionSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      yield { bars: arr.slice(), comparisons: [j, j + 1] };
      j--;
    }
    arr[j + 1] = key;
    yield { bars: arr.slice(), comparisons: [j + 1] };
  }
  yield { bars: arr.slice(), comparisons: [] };
}

function* bubbleSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  let n = arr.length;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      yield { bars: arr.slice(), comparisons: [i, i + 1] };
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
        yield { bars: arr.slice(), comparisons: [i, i + 1] };
      }
    }
    n--;
  }
  yield { bars: arr.slice(), comparisons: [] };
}

function* selectionSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  for (let i = 0; i < arr.length - 1; i++) {
    let min_j = i;
    for (let j = i + 1; j < arr.length; j++) {
      yield { bars: arr.slice(), comparisons: [min_j, j] };
      if (arr[j] < arr[min_j]) {
        min_j = j;
        yield { bars: arr.slice(), comparisons: [i, min_j] };
      }
    }
    if (min_j !== i) {
      [arr[i], arr[min_j]] = [arr[min_j], arr[i]];
      yield { bars: arr.slice(), comparisons: [i, min_j] };
    }
  }
  yield { bars: arr.slice(), comparisons: [] };
}

function* mergeSort(initial: number[]): Generator<SortStep> {
  function* merge(
    arr: number[],
    left: number,
    mid: number,
    right: number
  ): Generator<SortStep> {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;
    while (i < leftArr.length && j < rightArr.length) {
      yield { bars: arr.slice(), comparisons: [k, left + i, mid + 1 + j] };
      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++];
      } else {
        arr[k++] = rightArr[j++];
      }
      yield { bars: arr.slice(), comparisons: [k - 1] };
    }
    while (i < leftArr.length) {
      arr[k++] = leftArr[i++];
      yield { bars: arr.slice(), comparisons: [k - 1] };
    }
    while (j < rightArr.length) {
      arr[k++] = rightArr[j++];
      yield { bars: arr.slice(), comparisons: [k - 1] };
    }
  }
  function* sort(
    arr: number[],
    left: number,
    right: number
  ): Generator<SortStep> {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      yield* sort(arr, left, mid);
      yield* sort(arr, mid + 1, right);
      yield* merge(arr, left, mid, right);
    }
  }
  const arr = initial.slice();
  yield* sort(arr, 0, arr.length - 1);
  yield { bars: arr.slice(), comparisons: [] };
}

function* quickSort(initial: number[]): Generator<SortStep> {
  function* partition(
    arr: number[],
    low: number,
    high: number
  ): Generator<SortStep, number, unknown> {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      yield { bars: arr.slice(), comparisons: [j, high] };
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        yield { bars: arr.slice(), comparisons: [i, j] };
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    yield { bars: arr.slice(), comparisons: [i + 1, high] };
    return i + 1;
  }
  function* sort(
    arr: number[],
    low: number,
    high: number
  ): Generator<SortStep> {
    if (low < high) {
      const partGen = partition(arr, low, high);
      let result = partGen.next();
      while (!result.done) {
        yield result.value;
        result = partGen.next();
      }
      const pivot = result.value as number;
      yield* sort(arr, low, pivot - 1);
      yield* sort(arr, pivot + 1, high);
    }
    yield { bars: arr.slice(), comparisons: [] };
  }
  const arr = initial.slice();
  yield* sort(arr, 0, arr.length - 1);
  yield { bars: arr.slice(), comparisons: [] };
}

function* countingSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  for (let i = 0; i < arr.length; i++) {
    count[arr[i] - min]++;
    yield { bars: arr.slice(), comparisons: [i] };
  }
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
  }
  const output = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    const idx = arr[i] - min;
    count[idx]--;
    output[count[idx]] = arr[i];
    const newArr = Array.from({ length: arr.length }, (_, index) =>
      output[index] === undefined ? arr[index] : output[index]
    );
    yield { bars: newArr, comparisons: [i] };
  }
  yield { bars: output.slice(), comparisons: [] };
}

function* combSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  let gap = arr.length;
  let swapped = true;
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    swapped = false;
    for (let i = 0; i + gap < arr.length; i++) {
      yield { bars: arr.slice(), comparisons: [i, i + gap] };
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swapped = true;
        yield { bars: arr.slice(), comparisons: [i, i + gap] };
      }
    }
  }
  yield { bars: arr.slice(), comparisons: [] };
}

function* radixSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);
    for (let i = 0; i < arr.length; i++) {
      count[Math.floor(arr[i] / exp) % 10]++;
    }
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
    for (let i = arr.length - 1; i >= 0; i--) {
      output[--count[Math.floor(arr[i] / exp) % 10]] = arr[i];
      yield { bars: output.slice(), comparisons: [i] };
    }
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
    exp *= 10;
  }
  yield { bars: arr.slice(), comparisons: [] };
}

function* shellSort(initial: number[]): Generator<SortStep> {
  const arr = initial.slice();
  let gap = Math.floor(arr.length / 2);
  while (gap > 0) {
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        yield { bars: arr.slice(), comparisons: [j, j - gap] };
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
      yield { bars: arr.slice(), comparisons: [j] };
    }
    gap = Math.floor(gap / 2);
  }
  yield { bars: arr.slice(), comparisons: [] };
}

const sortingAlgorithms: {
  [key: string]: {
    name: string;
    gen: (arr: number[]) => Generator<SortStep>;
  };
} = {
  insertion: {
    name: "Insertion Sort",
    gen: insertionSort,
  },
  bubble: {
    name: "Bubble Sort",
    gen: bubbleSort,
  },
  selection: {
    name: "Selection Sort",
    gen: selectionSort,
  },
  merge: {
    name: "Merge Sort",
    gen: mergeSort,
  },
  quick: {
    name: "Quick Sort",
    gen: quickSort,
  },
  counting: {
    name: "Counting Sort",
    gen: countingSort,
  },
  comb: {
    name: "Comb Sort",
    gen: combSort,
  },
  radix: {
    name: "Radix Sort",
    gen: radixSort,
  },
  shell: {
    name: "Shell Sort",
    gen: shellSort,
  },
};

export default function Sort() {
  const [barCount, setBarCount] = useState<number>(50);
  const [processInterval, setProcessInterval] = useState<number>(20);
  const [sortStep, setSortStep] = useState<SortStep>({
    bars: [],
    comparisons: [],
  });
  const [running, setRunning] = useState<boolean>(false);
  const [algorithm, setAlgorithm] =
    useState<keyof typeof sortingAlgorithms>("insertion");
  const sortGeneratorRef = useRef<Generator<SortStep> | null>(null);
  const timerRef = useRef<number | null>(null);
  const step = () => {
    if (!sortGeneratorRef.current) return;
    const { value, done } = sortGeneratorRef.current.next();
    if (done) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRunning(false);
    } else if (value) {
      setSortStep(value);
    }
  };
  const handleStartStop = useCallback(() => {
    if (running) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRunning(false);
    } else {
      sortGeneratorRef.current = sortingAlgorithms[algorithm].gen(
        sortStep.bars
      );
      setRunning(true);
      timerRef.current = window.setInterval(step, processInterval);
    }
  }, [sortStep.bars, running, algorithm, processInterval]);
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setSortStep({ bars: generateRandomBars(barCount), comparisons: [] });
  }, [barCount]);
  useEffect(() => {
    setSortStep({ bars: generateRandomBars(barCount), comparisons: [] });
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [barCount]);
  return (
    <div>
      <h1 className="text-2xl font-bold">
        {getTitle("simulation", "sorting")}
      </h1>
      <div className="p-2">
        <div className="flex space-x-4 mb-2">
          <div>
            <label>
              Bar
              <ValidatedNumberInput
                className="ml-2 w-16"
                value={barCount}
                onChange={(value) => setBarCount(value)}
                disabled={running}
                min={1}
                max={100}
                aria-label="bar count input"
              />
            </label>
          </div>
          <div>
            <label>
              Interval
              <ValidatedNumberInput
                className="ml-2 w-16"
                value={processInterval}
                onChange={(value) => setProcessInterval(value)}
                disabled={running}
                min={1}
                max={100}
                aria-label="process interval input"
              />
            </label>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-end h-[300px] border space-x-0.5">
            {sortStep.bars.map((height, index) => (
              <div
                key={index.toString()}
                style={{ height: `${height}px`, width: `${100 / barCount}%` }}
                className={
                  sortStep.comparisons.includes(index)
                    ? "bg-red-500"
                    : "bg-indigo-500"
                }
              />
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleStartStop}>
            {running ? "Stop" : "Start"}
          </Button>
          <Button onClick={handleReset}>Reset</Button>
          <select
            value={algorithm}
            onChange={(e) =>
              setAlgorithm(e.target.value as keyof typeof sortingAlgorithms)
            }
            className="border p-1 rounded"
            disabled={running}
            aria-label="sorting algorithm select"
          >
            {Object.entries(sortingAlgorithms).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";

interface DataLoadingProgressProps {
  current: number;
  total: number;
  percentage: number;
}

export function DataLoadingProgress({ current, total, percentage }: DataLoadingProgressProps) {
  return (
    <motion.div
      className="fixed bottom-24 left-0 right-0 z-50 mx-auto w-11/12 max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 border border-lime-200 dark:border-zinc-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-lime-700 dark:text-lime-400">
            Loading inventory data...
          </span>
          <span className="text-sm font-medium text-lime-700 dark:text-lime-400">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-lime-100 dark:bg-zinc-800 rounded-full h-2.5">
          <div 
            className="bg-lime-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-lime-600 dark:text-lime-500">
          Loaded {current.toLocaleString()} of {total.toLocaleString()} items
        </div>
      </div>
    </motion.div>
  );
} 
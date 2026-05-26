import { useCallback, useRef, useState, useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  debounceMs?: number;
}

function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  debounceMs = 300,
}: PaginationProps) {
  const [displayPage, setDisplayPage] = useState(currentPage);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync displayPage when currentPage changes from parent
  useEffect(() => {
    setDisplayPage(currentPage);
  }, [currentPage]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setDisplayPage(newPage);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onPageChange(newPage);
        debounceTimerRef.current = null;
      }, debounceMs);
    },
    [onPageChange, debounceMs]
  );

  const handlePrevious = () => {
    if (displayPage > 1) {
      handlePageChange(displayPage - 1);
    }
  };

  const handleNext = () => {
    if (displayPage < totalPages) {
      handlePageChange(displayPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold">{(displayPage - 1) * limit + 1}</span> to{" "}
        <span className="font-semibold">{Math.min(displayPage * limit, total)}</span> of{" "}
        <span className="font-semibold">{total}</span> leads
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={displayPage === 1}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          Previous
        </button>
        <div className="px-4 py-2 text-gray-700 font-medium">
          Page <span className="text-blue-600">{displayPage}</span> of{" "}
          <span className="text-blue-600">{totalPages}</span>
        </div>
        <button
          onClick={handleNext}
          disabled={displayPage === totalPages}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

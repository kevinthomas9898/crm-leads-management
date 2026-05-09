import { useEffect, useState } from "react";

import { globalSearch } from "../api/leadApi";

import type { Lead } from "../types/lead";

function GlobalSearch() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<
    Lead[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);

      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const data =
          await globalSearch(query);

        setResults(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="mb-6 relative">
      <input
        type="text"
        placeholder="Global Search..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 bg-white"
      />

      {query && (
        <div className="absolute mt-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {loading ? (
            <p className="p-4">
              Searching...
            </p>
          ) : results.length > 0 ? (
            results.map((lead) => (
              <div
                key={lead._id}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <h3 className="font-semibold">
                  {lead.name}
                </h3>

                <p className="text-sm text-gray-600">
                  {lead.email}
                </p>

                <p className="text-sm text-gray-500">
                  {lead.company}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4">
              No Results
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
import { useEffect, useState } from "react";

import { globalSearch } from "../api/leadApi";

import type { Lead } from "../types/lead";

interface GlobalSearchProps {
  onLeadSelect?: (lead: Lead) => void;
}

function GlobalSearch({ onLeadSelect }: GlobalSearchProps) {
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

  const handleLeadClick = (lead: Lead) => {
    setQuery("");
    setResults([]);
    if (onLeadSelect) {
      onLeadSelect(lead);
    }
  };

  return (
    <div className="mb-6 relative">
      <input
        type="text"
        placeholder="Global Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
      />

      {query && (
        <div 
          className="absolute mt-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden"
          style={{ maxHeight: "320px", overflowY: "auto" }}
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((lead) => (
              <div
                key={lead._id}
                onClick={() => handleLeadClick(lead)}
                className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{lead.email}</p>
                <p className="text-sm text-gray-500 mt-1">{lead.company}</p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {lead.status}
                  </span>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    {lead.owner}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
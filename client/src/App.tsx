import { lazy, Suspense } from "react";

import GlobalSearch from "./components/GlobalSearch";

const LeadsPage = lazy(
  () => import("./pages/LeadsPage")
);

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          CRM Leads Management
        </h1>

        <GlobalSearch />

        <Suspense fallback={<h2>Loading...</h2>}>
          <LeadsPage />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
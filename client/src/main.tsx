import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system">
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
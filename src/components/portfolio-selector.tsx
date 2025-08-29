"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FolderOpen } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Portfolio {
    id: string;
    name: string;
}

interface PortfolioSelectorProps {
    onPortfolioChange: (portfolioName: string) => void;
    currentPortfolio?: string;
}

export function PortfolioSelector({ onPortfolioChange, currentPortfolio }: PortfolioSelectorProps) {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolios = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/meisterplan/portfolios", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                const data = await res.json();
                setPortfolios(data.items || []);
            } catch (e: any) {
                setError(e.message);
                console.error("Fehler beim Laden der Portfolios:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolios();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 rounded-lg">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-zinc-400">Lade...</span>
            </div>
        );
    }

    if (error || portfolios.length === 0) {
        return null; // Verstecke den Selector bei Fehlern oder leeren Portfolios
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 hover:bg-zinc-800/80 rounded-lg transition-colors text-sm">
                    <FolderOpen className="h-4 w-4" />
                    <span className="max-w-32 truncate">
                        {currentPortfolio || "Portfolio wählen"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-900 border-zinc-800"
                sideOffset={8}
            >
                <AnimatePresence>
                    {portfolios.map((portfolio, index) => (
                        <motion.div
                            key={portfolio.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <DropdownMenuItem
                                onClick={() => onPortfolioChange(portfolio.name)}
                                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                            >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                <span className="truncate">{portfolio.name}</span>
                            </DropdownMenuItem>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

"use client";

import type { ChangeEvent, FormEvent, InputHTMLAttributes } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  BarChart3,
  Bell,
  BookmarkPlus,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Globe2,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Loader2,
  Moon,
  Newspaper,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  WalletCards,
  X
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AuthControls } from "@/components/auth-controls";
import { useAuthState } from "@/components/auth-state-provider";
import { canUseFeature, getBillingPlan, getSaveLimitLabel } from "@/lib/billing-plans";

type Holding = {
  _id: Id<"holdings">;
  clerkUserId?: string;
  userId?: string;
  ticker: string;
  companyName?: string;
  shares: number;
  averageBuyPrice: number;
  sector?: string;
  thesis?: string;
  conviction?: string;
  targetPrice?: number;
};

type Quote = {
  symbol: string;
  price: number | null;
  change: number;
  changePercent: string;
  latestTradingDay: string | null;
  error?: string;
};

type QuoteState = {
  data?: Quote;
  isLoading?: boolean;
  error?: string;
};

type NewsItem = {
  title: string;
  url: string | null;
  source: string;
  publishedAt: string | null;
  sentiment: string | null;
  summary: string | null;
};

type SearchResult = {
  ticker: string;
  companyName: string;
  exchange: string;
  sector: string | null;
};

type ImportRow = {
  id: string;
  sourceRow: number;
  ticker: string;
  companyName?: string;
  shares: number;
  averageBuyPrice?: number;
  sector?: string;
  targetPrice?: number;
  conviction?: string;
  thesis?: string;
  skipped?: boolean;
  skipReason?: string;
};

type ImportParseResult = {
  rows: ImportRow[];
  errors: string[];
  warnings: string[];
  headers: string[];
  mapping: ImportColumnMapping;
  unmappedColumns: string[];
  skippedRows: number;
};

type BrokerKey = "generic" | "robinhood" | "fidelity" | "schwab" | "etrade" | "webull" | "coinbase";
type AtlasImportField = "ticker" | "company" | "shares" | "avgBuy" | "sector" | "target" | "conviction" | "thesis";
type ImportColumnMapping = Partial<Record<AtlasImportField, string>>;

type ChartPoint = {
  date: string;
  close: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
};

type ChartData = {
  symbol: string;
  companyName: string;
  exchange: string | null;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  range: string;
  points: ChartPoint[];
  error?: string;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact"
});
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const starterCompanies = [
  { ticker: "MSFT", companyName: "Microsoft", sector: "Cloud software", color: "#0f8a8a" },
  { ticker: "NVDA", companyName: "NVIDIA", sector: "AI semiconductors", color: "#16a34a" },
  { ticker: "AAPL", companyName: "Apple", sector: "Consumer devices", color: "#111827" },
  { ticker: "TSLA", companyName: "Tesla", sector: "EVs and energy", color: "#ea580c" }
];

const sidebarNavItems = [
  { href: "/portfolio", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portfolio", icon: BriefcaseBusiness, label: "Portfolio" },
  { href: "/discover", icon: Search, label: "Discover" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/research", icon: FileText, label: "Research" }
];

const marketNews = [
  { title: "Mega-cap tech leads a measured morning rally", source: "Market desk", time: "Today" },
  { title: "Cloud spending estimates remain resilient into earnings", source: "Research note", time: "Today" },
  { title: "Rate-cut expectations steady after fresh inflation data", source: "Macro brief", time: "Yesterday" }
];

const portfolioPath = [38, 41, 43, 40, 46, 49, 47, 53, 57, 55, 61, 64];
const selectedPath = [44, 46, 43, 48, 51, 49, 54, 58, 56, 61, 65, 68];
const emptyHoldings: Holding[] = [];
const atlasImportFields: { key: AtlasImportField; label: string; required?: boolean }[] = [
  { key: "ticker", label: "Ticker", required: true },
  { key: "company", label: "Company" },
  { key: "shares", label: "Shares", required: true },
  { key: "avgBuy", label: "Avg buy", required: true },
  { key: "sector", label: "Sector" },
  { key: "target", label: "Target" },
  { key: "conviction", label: "Conviction" },
  { key: "thesis", label: "Thesis" }
];
const brokerOptions: { key: BrokerKey; label: string; template: string }[] = [
  {
    key: "generic",
    label: "Generic CSV",
    template: "ticker,company,shares,avgBuy,sector,target,conviction,thesis\nMSFT,Microsoft,10,418.50,Cloud software,525,Core holding,AI and cloud margin expansion\n"
  },
  {
    key: "robinhood",
    label: "Robinhood",
    template: "Symbol,Name,Quantity,Average Cost,Instrument\nMSFT,Microsoft Corp,10,418.50,Stock\n"
  },
  {
    key: "fidelity",
    label: "Fidelity",
    template: "Symbol,Description,Quantity,Cost Basis Per Share,Asset Class\nMSFT,Microsoft Corp,10,418.50,Equity\n"
  },
  {
    key: "schwab",
    label: "Schwab",
    template: "Symbol,Security Name,Shares,Cost Basis / Share,Type\nMSFT,Microsoft Corp,10,418.50,Equity\n"
  },
  {
    key: "etrade",
    label: "E*TRADE",
    template: "Symbol,Description,Quantity,Purchase Price,Security Type\nMSFT,Microsoft Corp,10,418.50,Stock\n"
  },
  {
    key: "webull",
    label: "Webull",
    template: "Symbol,Name,Quantity,Avg Cost,Asset Type\nMSFT,Microsoft Corp,10,418.50,Stock\n"
  },
  {
    key: "coinbase",
    label: "Coinbase",
    template: "Currency,Name,Amount,Average Cost\nBTC,Bitcoin,0.25,65000\n"
  }
];
const defaultFieldAliases: Record<AtlasImportField, string[]> = {
  ticker: ["ticker", "symbol", "asset", "instrument", "currency"],
  company: ["company", "name", "description", "security name"],
  shares: ["shares", "quantity", "units", "amount"],
  avgBuy: ["avgbuy", "avg buy", "average cost", "avg cost", "cost basis / share", "cost basis per share", "purchase price"],
  sector: ["sector", "asset class", "asset type", "type", "security type", "instrument type"],
  target: ["target", "target price", "price target"],
  conviction: ["conviction", "rating", "tag"],
  thesis: ["thesis", "notes", "memo"]
};
const brokerFieldAliases: Record<BrokerKey, Partial<Record<AtlasImportField, string[]>>> = {
  generic: {},
  robinhood: {
    ticker: ["symbol"],
    company: ["name"],
    shares: ["quantity"],
    avgBuy: ["average cost"]
  },
  fidelity: {
    company: ["description"],
    avgBuy: ["cost basis per share"]
  },
  schwab: {
    company: ["security name"],
    avgBuy: ["cost basis / share"]
  },
  etrade: {
    company: ["description"],
    avgBuy: ["purchase price"]
  },
  webull: {
    company: ["name"],
    avgBuy: ["avg cost"]
  },
  coinbase: {
    ticker: ["currency", "asset"],
    company: ["name", "currency"],
    shares: ["amount", "quantity"],
    avgBuy: ["average cost", "avg cost"]
  }
};
const cashLikeTerms = ["cash", "money market", "sweep", "usd cash", "spaxx", "fdrxx", "vmfxx", "core position"];

function formatCurrency(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function formatCompactCurrency(value: number) {
  return compactCurrency.format(Number.isFinite(value) ? value : 0);
}

function toPositiveNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalPositiveNumber(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === "") return undefined;
  return toPositiveNumber(value) ?? undefined;
}

function cleanText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function cleanCsvText(value: string | undefined) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  rows.push(row);
  return rows;
}

function normalizeImportHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getBrokerTemplate(broker: BrokerKey) {
  return brokerOptions.find((option) => option.key === broker) ?? brokerOptions[0];
}

function getBrokerTemplateHref(broker: BrokerKey) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(getBrokerTemplate(broker).template)}`;
}

function parseCsvNumber(value: string | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const isNegative = text.startsWith("(") && text.endsWith(")");
  const normalized = text.replace(/[,$%]/g, "").replace(/[()]/g, "").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return isNegative ? -parsed : parsed;
}

function parseOptionalCsvNumber(value: string | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  const parsed = parseCsvNumber(text);
  return parsed === null ? null : parsed > 0 ? parsed : null;
}

function autoMapColumns(headers: string[], broker: BrokerKey): ImportColumnMapping {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeImportHeader(header), header]));
  const mapping: ImportColumnMapping = {};

  for (const field of atlasImportFields) {
    const aliases = [...(brokerFieldAliases[broker][field.key] ?? []), ...defaultFieldAliases[field.key]];
    const match = aliases.map(normalizeImportHeader).find((alias) => normalizedHeaders.has(alias));
    if (match) {
      mapping[field.key] = normalizedHeaders.get(match);
    }
  }

  return mapping;
}

function mergeColumnMapping(autoMapping: ImportColumnMapping, overrides: ImportColumnMapping): ImportColumnMapping {
  const merged: ImportColumnMapping = { ...autoMapping };
  for (const field of atlasImportFields) {
    if (Object.prototype.hasOwnProperty.call(overrides, field.key)) {
      const value = overrides[field.key];
      if (value) {
        merged[field.key] = value;
      } else {
        delete merged[field.key];
      }
    }
  }
  return merged;
}

function isCashLikeRow(ticker: string, companyName?: string, sector?: string) {
  const haystack = [ticker, companyName, sector].filter(Boolean).join(" ").toLowerCase();
  return cashLikeTerms.some((term) => haystack.includes(term));
}

function parsePortfolioCsv(
  text: string,
  broker: BrokerKey,
  existingTickers: string[],
  currentPlan: ReturnType<typeof getBillingPlan>,
  includeCashRows: boolean,
  mappingOverrides: ImportColumnMapping = {}
): ImportParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsedRows = parseCsv(text.replace(/^\uFEFF/, ""));
  const header = parsedRows.shift()?.map((column) => column.trim()) ?? [];

  if (header.length === 0 || header.every((column) => !column)) {
    return {
      rows: [],
      errors: ["CSV file is empty. Use a broker template before importing."],
      warnings: [],
      headers: [],
      mapping: {},
      unmappedColumns: [],
      skippedRows: 0
    };
  }

  const autoMapping = autoMapColumns(header, broker);
  const mapping = mergeColumnMapping(autoMapping, mappingOverrides);
  const headerIndex = new Map(header.map((column, index) => [column, index]));
  const mappedColumns = new Set(Object.values(mapping).filter(Boolean).map((column) => normalizeImportHeader(column)));
  const unmappedColumns = header.filter((column) => column && !mappedColumns.has(normalizeImportHeader(column)));
  const rows: ImportRow[] = [];
  const existingTickerSet = new Set(existingTickers.map((ticker) => ticker.toUpperCase()));
  const importedTickerSet = new Set<string>();
  let skippedRows = 0;

  if (!mapping.ticker) errors.push("Map a ticker column before importing.");
  if (!mapping.shares) errors.push("Map a shares column before importing.");
  if (!mapping.avgBuy) errors.push("Map an avgBuy column before importing. Broker exports without cost basis need a manual mapping before save.");
  if (unmappedColumns.length > 0) {
    warnings.push(`Unmapped columns: ${unmappedColumns.join(", ")}.`);
  }

  parsedRows.forEach((columns, index) => {
    const sourceRow = index + 2;
    const isBlank = columns.every((column) => !column.trim());
    if (isBlank) return;

    const value = (field: AtlasImportField) => {
      const column = mapping[field];
      const columnIndex = column ? headerIndex.get(column) : undefined;
      return columnIndex === undefined ? undefined : columns[columnIndex];
    };
    const ticker = String(value("ticker") ?? "").trim().toUpperCase();
    const companyName = cleanCsvText(value("company")) ?? (broker === "coinbase" && ticker ? ticker : undefined);
    const shares = parseCsvNumber(value("shares"));
    const averageBuyPrice = parseCsvNumber(value("avgBuy"));
    const targetPrice = parseOptionalCsvNumber(value("target"));
    const sector = cleanCsvText(value("sector"));

    if (!ticker) {
      errors.push(`Row ${sourceRow}: ticker is required.`);
    }
    if (shares === null) {
      errors.push(`Row ${sourceRow}: shares must be a number.`);
    } else if (shares <= 0) {
      errors.push(`Row ${sourceRow}: shares must be greater than 0.`);
    }
    if (averageBuyPrice === null) {
      errors.push(`Row ${sourceRow}: avgBuy is required before saving. Map a broker cost-basis column or use a template with avgBuy.`);
    } else if (averageBuyPrice <= 0) {
      errors.push(`Row ${sourceRow}: avgBuy must be greater than 0.`);
    }
    if (targetPrice === null) {
      errors.push(`Row ${sourceRow}: target must be a number when provided.`);
    }

    if (ticker && isCashLikeRow(ticker, companyName, sector) && !includeCashRows) {
      skippedRows += 1;
      return;
    }

    if (!ticker || shares === null || shares <= 0 || targetPrice === null) {
      return;
    }

    rows.push({
      id: `${sourceRow}-${ticker}`,
      sourceRow,
      ticker,
      companyName,
      shares,
      averageBuyPrice: averageBuyPrice && averageBuyPrice > 0 ? averageBuyPrice : undefined,
      sector,
      targetPrice,
      conviction: cleanCsvText(value("conviction")),
      thesis: cleanCsvText(value("thesis"))
    });

    if (!existingTickerSet.has(ticker)) {
      importedTickerSet.add(ticker);
    }
  });

  if (rows.length === 0 && errors.length === 0) {
    errors.push("No valid portfolio rows found. Blank rows were ignored.");
  }
  if (skippedRows > 0) {
    warnings.push(`${skippedRows} cash or money market ${skippedRows === 1 ? "row was" : "rows were"} skipped.`);
  }

  if (currentPlan.saveLimit !== "unlimited" && existingTickerSet.size + importedTickerSet.size > currentPlan.saveLimit) {
    const remaining = Math.max(0, currentPlan.saveLimit - existingTickerSet.size);
    errors.push(`${currentPlan.name} can save ${currentPlan.saveLimit} stocks. This import adds ${importedTickerSet.size} new tickers, but you have room for ${remaining}.`);
  }

  return { rows, errors, warnings, headers: header, mapping, unmappedColumns, skippedRows };
}

export function PortfolioDashboard() {
  const pathname = usePathname();
  const { clerkEnabled, isLoaded: isAuthLoaded, isSignedIn, userId, plan } = useAuthState();
  const clerkUserId = userId;
  const currentPlan = getBillingPlan(plan);
  const planCanSaveStocks = canUseFeature(plan, "saveStocks");
  const canLoadHoldings = Boolean(isAuthLoaded && isSignedIn && clerkUserId && planCanSaveStocks);
  const holdingsQuery = useQuery(api.holdings.list, canLoadHoldings && clerkUserId ? { clerkUserId } : "skip");
  const holdings = (holdingsQuery ?? emptyHoldings) as Holding[];
  const isStarterAtLimit = currentPlan.saveLimit !== "unlimited" && holdings.length >= currentPlan.saveLimit;
  const canSaveStocks = Boolean(canLoadHoldings && !isStarterAtLimit);
  const isHoldingsLoading = canLoadHoldings && holdingsQuery === undefined;
  const saveLimitLabel = getSaveLimitLabel(plan);
  const addHolding = useMutation(api.holdings.add);
  const deleteHolding = useMutation(api.holdings.remove);
  const [quotes, setQuotes] = useState<Record<string, QuoteState>>({});
  const [selectedTicker, setSelectedTicker] = useState("MSFT");
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importBroker, setImportBroker] = useState<BrokerKey>("generic");
  const [includeCashRows, setIncludeCashRows] = useState(false);
  const [importRawCsv, setImportRawCsv] = useState("");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importMapping, setImportMapping] = useState<ImportColumnMapping>({});
  const [importUnmappedColumns, setImportUnmappedColumns] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsError, setNewsError] = useState("");
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [chartRange, setChartRange] = useState("6mo");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartError, setChartError] = useState("");
  const [isChartLoading, setIsChartLoading] = useState(false);

  const savedTickers = useMemo(() => holdings.map((holding) => holding.ticker).sort(), [holdings]);
  const quoteTickers = useMemo(
    () => Array.from(new Set([...savedTickers, selectedTicker].filter(Boolean))).sort(),
    [savedTickers, selectedTicker]
  );
  const selectedHolding = holdings.find((holding) => holding.ticker === selectedTicker);
  const selectedStarter = starterCompanies.find((company) => company.ticker === selectedTicker);
  const selectedCompany = {
    ticker: selectedTicker,
    companyName: chartData?.companyName ?? selectedHolding?.companyName ?? selectedStarter?.companyName ?? selectedTicker,
    sector: selectedHolding?.sector ?? selectedStarter?.sector ?? chartData?.exchange ?? "Equity research",
    thesis: selectedHolding?.thesis ?? "Add notes to Convex to turn this into your research memo.",
    conviction: selectedHolding?.conviction ?? "Watch",
    targetPrice: selectedHolding?.targetPrice
  };
  const selectedQuote = quotes[selectedTicker]?.data;
  const livePrice = chartData?.price || selectedQuote?.price || null;
  const liveChange = chartData?.change ?? selectedQuote?.change ?? 0;
  const liveChangePercent = chartData ? `${chartData.changePercent.toFixed(2)}%` : selectedQuote?.changePercent;
  const chartNotice = chartError.includes("Alpha Vantage")
    ? "Chart data is temporarily rate limited. Showing the fallback trend."
    : chartError;
  const hasProFeatures = canUseFeature(plan, "analytics");
  const hasPremiumFeatures = canUseFeature(plan, "aiSummaries");
  const saveRestriction = !clerkEnabled
    ? "Add Clerk keys in Vercel to enable secure portfolio saves."
    : !isSignedIn
        ? "Sign in to save stocks to your portfolio."
        : !planCanSaveStocks
          ? "Upgrade to unlock saved stocks."
        : isStarterAtLimit
          ? `${currentPlan.name} includes up to ${currentPlan.saveLimit} saved stocks. ${plan === "free" ? "Upgrade to Starter for 15 saves." : "Upgrade to Pro for unlimited saves."}`
          : "";

  useEffect(() => {
    setIsDarkMode(window.localStorage.getItem("atlas-theme") !== "light");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("atlas-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Search unavailable.");
        }

        setSearchResults(payload.items as SearchResult[]);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadChart() {
      setIsChartLoading(true);
      setChartError("");

      try {
        const response = await fetch(
          `/api/chart?symbol=${encodeURIComponent(selectedTicker)}&range=${encodeURIComponent(chartRange)}`
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Chart unavailable.");
        }

        if (!cancelled) {
          setChartData(payload as ChartData);
          setChartError(typeof payload.error === "string" ? payload.error : "");
        }
      } catch (error) {
        if (!cancelled) {
          setChartData(null);
          setChartError(error instanceof Error ? error.message : "Chart unavailable.");
        }
      } finally {
        if (!cancelled) {
          setIsChartLoading(false);
        }
      }
    }

    loadChart();

    return () => {
      cancelled = true;
    };
  }, [selectedTicker, chartRange]);

  useEffect(() => {
    if (savedTickers.length > 0 && !savedTickers.includes(selectedTicker)) {
      setSelectedTicker(savedTickers[0]);
    }
  }, [savedTickers, selectedTicker]);

  useEffect(() => {
    if (quoteTickers.length === 0) return;

    let cancelled = false;

    async function loadQuotes() {
      setQuotes((current) => {
        const next = { ...current };
        for (const ticker of quoteTickers) {
          next[ticker] = { ...next[ticker], isLoading: true, error: undefined };
        }
        return next;
      });

      await Promise.all(
        quoteTickers.map(async (ticker) => {
          try {
            const response = await fetch(`/api/quote?symbol=${encodeURIComponent(ticker)}`);
            const payload = await response.json();

            if (!response.ok) {
              throw new Error(payload.error ?? "Quote unavailable.");
            }

            if (!cancelled) {
              if (typeof payload.price !== "number" || !Number.isFinite(payload.price)) {
                throw new Error(payload.error ?? "Quote unavailable.");
              }

              setQuotes((current) => ({
                ...current,
                [ticker]: { data: payload as Quote, isLoading: false }
              }));
            }
          } catch (error) {
            if (!cancelled) {
              setQuotes((current) => ({
                ...current,
                [ticker]: {
                  ...current[ticker],
                  isLoading: false,
                  error: error instanceof Error ? error.message : "Quote unavailable."
                }
              }));
            }
          }
        })
      );
    }

    loadQuotes();

    return () => {
      cancelled = true;
    };
  }, [quoteTickers]);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setIsNewsLoading(true);
      setNewsError("");

      try {
        const response = await fetch(`/api/news?symbol=${encodeURIComponent(selectedTicker)}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "News unavailable.");
        }

        if (!cancelled) {
          setNews(payload.items as NewsItem[]);
        }
      } catch (error) {
        if (!cancelled) {
          setNews([]);
          setNewsError(error instanceof Error ? error.message : "News unavailable.");
        }
      } finally {
        if (!cancelled) {
          setIsNewsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [selectedTicker]);

  const totals = holdings.reduce(
    (acc, holding) => {
      const invested = holding.shares * holding.averageBuyPrice;
      const quote = quotes[holding.ticker]?.data;
      const currentValue = typeof quote?.price === "number" ? holding.shares * quote.price : invested;

      acc.invested += invested;
      acc.currentValue += currentValue;
      acc.profitLoss += currentValue - invested;
      return acc;
    },
    { invested: 0, currentValue: 0, profitLoss: 0 }
  );

  const gainPercent = totals.invested ? (totals.profitLoss / totals.invested) * 100 : 0;
  const allocation = holdings.slice(0, 4).map((holding, index) => {
    const quote = quotes[holding.ticker]?.data;
    const value = typeof quote?.price === "number" ? quote.price * holding.shares : holding.shares * holding.averageBuyPrice;
    return {
      ticker: holding.ticker,
      value,
      color: ["#0f8a8a", "#16a34a", "#ea580c", "#2563eb"][index % 4]
    };
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!clerkUserId) {
      setFormError("Sign in to save stocks to your portfolio.");
      return;
    }

    if (!planCanSaveStocks) {
      setFormError("Upgrade to unlock saved stocks.");
      return;
    }

    if (isStarterAtLimit) {
      setFormError(
        `${currentPlan.name} includes up to ${currentPlan.saveLimit} saved stocks. ${
          plan === "free" ? "Upgrade to Starter for 15 saves." : "Upgrade to Pro for unlimited saves."
        }`
      );
      return;
    }

    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const ticker = String(formData.get("ticker") ?? "").trim().toUpperCase();
    const shares = toPositiveNumber(formData.get("shares"));
    const averageBuyPrice = toPositiveNumber(formData.get("averageBuyPrice"));

    if (!ticker || shares === null || averageBuyPrice === null) {
      setFormError("Enter a ticker, shares, and average buy price.");
      setIsSaving(false);
      return;
    }

    try {
      await addHolding({
        clerkUserId,
        ticker,
        companyName: cleanText(formData.get("companyName")),
        shares,
        averageBuyPrice,
        sector: cleanText(formData.get("sector")),
        thesis: cleanText(formData.get("thesis")),
        conviction: cleanText(formData.get("conviction")),
        targetPrice: parseOptionalPositiveNumber(formData.get("targetPrice"))
      });
      setSelectedTicker(ticker);
      event.currentTarget.reset();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save stock.");
    } finally {
      setIsSaving(false);
    }
  }

  function openImportModal() {
    setImportErrors([]);
    setImportWarnings([]);
    setImportRows([]);
    setImportHeaders([]);
    setImportMapping({});
    setImportUnmappedColumns([]);
    setImportRawCsv("");
    setImportFileName("");
    setImportSuccess("");
    setIncludeCashRows(false);
    setIsImportOpen(true);
  }

  function closeImportModal() {
    if (isImporting) return;
    setIsImportOpen(false);
  }

  function applyImportParseResult(result: ImportParseResult) {
    setImportRows(result.rows);
    setImportErrors(result.errors);
    setImportWarnings(result.warnings);
    setImportHeaders(result.headers);
    setImportMapping(result.mapping);
    setImportUnmappedColumns(result.unmappedColumns);
  }

  function reparseImportCsv(nextBroker: BrokerKey, nextIncludeCashRows: boolean, nextMapping: ImportColumnMapping) {
    if (!importRawCsv) return;
    const result = parsePortfolioCsv(
      importRawCsv,
      nextBroker,
      holdings.map((holding) => holding.ticker),
      currentPlan,
      nextIncludeCashRows,
      nextMapping
    );
    applyImportParseResult(result);
  }

  function handleImportBrokerChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextBroker = event.target.value as BrokerKey;
    setImportBroker(nextBroker);
    setImportSuccess("");
    if (importRawCsv) {
      const result = parsePortfolioCsv(
        importRawCsv,
        nextBroker,
        holdings.map((holding) => holding.ticker),
        currentPlan,
        includeCashRows
      );
      applyImportParseResult(result);
    } else {
      setImportMapping({});
      setImportHeaders([]);
      setImportUnmappedColumns([]);
      setImportWarnings([]);
      setImportErrors([]);
      setImportRows([]);
    }
  }

  function handleIncludeCashRowsChange(event: ChangeEvent<HTMLInputElement>) {
    const nextIncludeCashRows = event.target.checked;
    setIncludeCashRows(nextIncludeCashRows);
    setImportSuccess("");
    reparseImportCsv(importBroker, nextIncludeCashRows, importMapping);
  }

  function handleImportMappingChange(field: AtlasImportField, column: string) {
    const nextMapping: ImportColumnMapping = { ...importMapping, [field]: column || undefined };
    setImportSuccess("");
    reparseImportCsv(importBroker, includeCashRows, nextMapping);
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImportSuccess("");
    setImportRows([]);
    setImportErrors([]);
    setImportWarnings([]);
    setImportHeaders([]);
    setImportMapping({});
    setImportUnmappedColumns([]);
    setImportRawCsv("");
    setImportFileName(file?.name ?? "");

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportErrors(["Upload a CSV file using an Atlas or broker template."]);
      return;
    }

    try {
      const text = await file.text();
      setImportRawCsv(text);
      const result = parsePortfolioCsv(
        text,
        importBroker,
        holdings.map((holding) => holding.ticker),
        currentPlan,
        includeCashRows
      );
      applyImportParseResult(result);
    } catch {
      setImportErrors(["Could not read that CSV file. Try exporting it again and re-uploading."]);
    } finally {
      event.target.value = "";
    }
  }

  async function confirmImport() {
    setImportSuccess("");

    if (!clerkUserId) {
      setImportErrors(["Sign in to import stocks to your portfolio."]);
      return;
    }
    if (!planCanSaveStocks) {
      setImportErrors(["Upgrade to unlock saved stocks."]);
      return;
    }
    if (importRows.length === 0) {
      setImportErrors(["Upload a valid CSV before importing."]);
      return;
    }

    const latestValidation = importRawCsv
      ? parsePortfolioCsv(
          importRawCsv,
          importBroker,
          holdings.map((holding) => holding.ticker),
          currentPlan,
          includeCashRows,
          importMapping
        )
      : { rows: importRows, errors: importErrors, warnings: importWarnings, headers: importHeaders, mapping: importMapping, unmappedColumns: importUnmappedColumns, skippedRows: 0 };

    if (latestValidation.errors.length > 0) {
      applyImportParseResult(latestValidation);
      return;
    }
    if (latestValidation.rows.some((row) => row.averageBuyPrice === undefined)) {
      setImportErrors(["Every imported row needs avgBuy before saving. Map the broker cost-basis column or use a template with avgBuy."]);
      return;
    }

    setIsImporting(true);
    try {
      for (const row of latestValidation.rows) {
        if (row.averageBuyPrice === undefined) continue;
        await addHolding({
          clerkUserId,
          ticker: row.ticker,
          companyName: row.companyName,
          shares: row.shares,
          averageBuyPrice: row.averageBuyPrice,
          sector: row.sector,
          thesis: row.thesis,
          conviction: row.conviction,
          targetPrice: row.targetPrice
        });
      }

      setSelectedTicker(latestValidation.rows[0]?.ticker ?? selectedTicker);
      setImportRows([]);
      setImportErrors([]);
      setImportWarnings([]);
      setImportHeaders([]);
      setImportMapping({});
      setImportUnmappedColumns([]);
      setImportRawCsv("");
      setImportFileName("");
      setImportSuccess(`Imported ${latestValidation.rows.length} ${latestValidation.rows.length === 1 ? "stock" : "stocks"} into your portfolio.`);
    } catch (error) {
      setImportErrors([error instanceof Error ? error.message : "Could not import portfolio."]);
    } finally {
      setIsImporting(false);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticker = searchTerm.trim().toUpperCase();
    if (!ticker) return;
    setSelectedTicker(ticker);
    setSearchTerm("");
    setSearchResults([]);
  }

  function selectSearchResult(result: SearchResult) {
    setSelectedTicker(result.ticker);
    setSearchTerm("");
    setSearchResults([]);
  }

  function isActivePath(href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <main className={`stock-app atlas-dashboard min-h-screen bg-[#05080d] text-ink ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#dfe7ec] bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
            <div className="mb-7 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#6ee7d8]/30 bg-[#6ee7d8]/10 text-[#6ee7d8] shadow-[0_0_32px_rgba(20,184,166,0.18)]">
                <LineChart size={20} />
              </div>
              <div>
                <p className="text-base font-black tracking-normal">Atlas Invest</p>
                <p className="text-xs font-semibold text-muted">Market command</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {sidebarNavItems.map((item) => (
                <NavItem
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={item.label === "Dashboard" ? pathname === "/portfolio" : item.href !== "/portfolio" && isActivePath(item.href)}
                />
              ))}
            </nav>

            <div className="premium-card mt-auto p-3">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-[#6ee7d8] shadow-sm">
                <ShieldCheck size={18} />
              </div>
              <p className="text-sm font-bold">Paper portfolio</p>
              <p className="mt-1 text-xs leading-5 text-muted">Saved stocks are persisted in Convex. Brokerage trading is not connected.</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-7">
          <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-[#0f172a] sm:text-4xl">Portfolio cockpit</h1>
              <p className="mt-2 text-sm font-semibold text-muted">Search, research, and save companies into your Convex-backed portfolio.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:w-[360px]">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#d9e2e7] bg-white/80 px-3 shadow-sm"
                >
                  <Search size={18} className="shrink-0 text-muted" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search ticker or company"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                  />
                  <button className="premium-button rounded-md px-3 py-1.5 text-xs font-bold" type="submit">
                    View
                  </button>
                </form>
                {searchTerm.trim().length >= 2 ? (
                  <div className="premium-card absolute left-0 right-0 top-12 z-20 overflow-hidden">
                    {isSearchLoading ? (
                      <div className="grid gap-2 px-3 py-3">
                        <SkeletonLine className="h-4 w-2/3" />
                        <SkeletonLine className="h-3 w-1/2" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={`${result.ticker}-${result.exchange}`}
                          type="button"
                          onClick={() => selectSearchResult(result)}
                          className="flex w-full items-center justify-between gap-3 border-b border-[#edf2f5] px-3 py-3 text-left last:border-0 hover:bg-[#f6faf8]"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{result.ticker}</span>
                            <span className="block truncate text-xs font-semibold text-muted">{result.companyName}</span>
                          </span>
                          <span className="shrink-0 text-xs font-bold text-[#0f8a8a]">{result.exchange}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-sm font-bold text-muted">No matching equities found</div>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={openImportModal}
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d9e2e7] bg-white px-3 text-sm font-bold text-[#102a2c] shadow-sm transition hover:border-[#0f8a8a]"
              >
                <Upload size={17} />
                <span className="hidden sm:inline">Import Portfolio</span>
                <span className="sm:hidden">Import</span>
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white text-slate-600 shadow-sm" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button
                className="theme-toggle flex h-11 w-11 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white text-slate-600 shadow-sm transition"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDarkMode}
                type="button"
                onClick={() => setIsDarkMode((current) => !current)}
                title={isDarkMode ? "Light mode" : "Dark mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <AuthControls />
            </div>
          </header>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MarketPill label="S&P 500" value="5,322.18" change="+0.42%" tone="gain" />
            <MarketPill label="Nasdaq" value="16,388.24" change="+0.61%" tone="gain" />
            <MarketPill label="Dow" value="39,872.99" change="-0.08%" tone="loss" />
            <MarketPill label="VIX" value="13.72" change="-1.20%" tone="gain" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_280px]">
                <Panel className="p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-muted">Portfolio value</p>
                      <div className="mt-1 flex flex-wrap items-end gap-3">
                        <h2 className="text-4xl font-semibold tracking-normal">{formatCompactCurrency(totals.currentValue)}</h2>
                        <span className={`mb-1 flex items-center gap-1 text-sm font-bold ${totals.profitLoss >= 0 ? "text-gain" : "text-loss"}`}>
                          {totals.profitLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {formatCurrency(totals.profitLoss)} ({gainPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-right">
                      <Metric label="Cash" value={formatCompactCurrency(Math.max(0, totals.currentValue - totals.invested))} />
                      <Metric label="Holdings" value={String(holdings.length)} />
                    </div>
                  </div>
                  <AreaChart values={portfolioPath} />
                </Panel>

                <Panel className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold">Allocation</h2>
                    <WalletCards size={18} className="text-[#0f8a8a]" />
                  </div>
                  <AllocationDonut items={allocation} total={totals.currentValue} />
                  <div className="mt-5 space-y-3">
                    {(allocation.length ? allocation : starterCompanies.slice(0, 3).map((company) => ({ ticker: company.ticker, value: 0, color: company.color }))).map((item) => (
                      <div key={item.ticker} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-bold">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.ticker}
                        </span>
                        <span className="font-semibold text-muted">{totals.currentValue ? `${((item.value / totals.currentValue) * 100).toFixed(0)}%` : "0%"}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </section>

              <section className="grid gap-5">
                <Panel className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold">Add stock</h2>
                      <p className="mt-1 text-xs font-semibold text-muted">
                        {canSaveStocks ? `Saved records write to Convex. ${saveLimitLabel}.` : saveRestriction}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={openImportModal}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9e2e7] bg-white px-3 text-xs font-bold text-[#102a2c] transition hover:border-[#0f8a8a]"
                      >
                        <FileUp size={15} />
                        Import CSV
                      </button>
                      <BookmarkPlus size={19} className="text-[#0f8a8a]" />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <LabeledInput label="Ticker" name="ticker" placeholder="MSFT" autoCapitalize="characters" required />
                      <LabeledInput label="Company" name="companyName" placeholder="Microsoft" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <LabeledInput label="Shares" name="shares" type="number" min="0" step="any" placeholder="12" required />
                      <LabeledInput label="Avg. buy" name="averageBuyPrice" type="number" min="0" step="any" placeholder="418.50" required />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <LabeledInput label="Sector" name="sector" placeholder="Cloud software" />
                      <LabeledInput label="Target" name="targetPrice" type="number" min="0" step="any" placeholder="525" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <LabeledInput label="Conviction" name="conviction" placeholder="Core holding" />
                      <LabeledInput label="Thesis" name="thesis" placeholder="AI and cloud margin expansion" />
                    </div>

                    {formError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-loss">{formError}</p> : null}
                    {importSuccess ? (
                      <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-gain">
                        <CheckCircle2 size={16} />
                        {importSuccess}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      className="mt-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#102a2c] px-4 text-sm font-bold text-white transition hover:bg-[#173b3e] disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isSaving || !canSaveStocks}
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
                      {canSaveStocks ? "Save to portfolio" : isSignedIn ? "Upgrade to save" : "Sign in to save"}
                    </button>
                    {!canSaveStocks && clerkEnabled && !isSignedIn ? (
                      <SignInButton mode="modal" fallbackRedirectUrl="/portfolio" forceRedirectUrl="/portfolio">
                        <button
                          type="button"
                          className="flex h-10 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white px-4 text-sm font-bold text-[#102a2c] transition hover:border-[#0f8a8a]"
                        >
                          Sign in or create an account
                        </button>
                      </SignInButton>
                    ) : null}
                    {!canSaveStocks && clerkEnabled && isSignedIn ? (
                      <Link
                        href="/pricing"
                        className="flex h-10 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white px-4 text-sm font-bold text-[#102a2c] transition hover:border-[#0f8a8a]"
                      >
                        View upgrade options
                      </Link>
                    ) : null}
                    {!canSaveStocks && !clerkEnabled ? (
                      <p className="rounded-lg border border-amber-300/40 bg-amber-950/40 px-3 py-2 text-xs font-bold leading-5 text-amber-100">
                        {saveRestriction}
                      </p>
                    ) : null}
                  </form>
                </Panel>

                <Panel className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#e4ebf0] px-5 py-4">
                    <div>
                      <h2 className="text-base font-bold">Saved companies</h2>
                      <p className="mt-1 text-xs font-semibold text-muted">{holdings.length} portfolio records</p>
                    </div>
                    {isHoldingsLoading ? <Loader2 className="animate-spin text-muted" size={18} /> : <BarChart3 className="text-[#0f8a8a]" size={19} />}
                  </div>

                  {!canLoadHoldings ? (
                    <div className="p-5">
                      <div className="rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-4">
                        <p className="text-sm font-bold">{isSignedIn ? "Portfolio saves are locked" : "Portfolio is private"}</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-muted">
                          {isSignedIn
                            ? "Sign in to save up to 3 stocks on Free, or upgrade for higher portfolio limits."
                            : "Sign in to view saved companies and keep your watchlist synced with Convex."}
                        </p>
                        {isSignedIn ? (
                          <Link
                            href="/pricing"
                            className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#102a2c] px-3 text-xs font-bold text-white"
                          >
                            Compare plans
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ) : holdings.length === 0 ? (
                    <div className="grid gap-3 p-5">
                      {starterCompanies.map((company) => (
                        <button
                          key={company.ticker}
                          type="button"
                          onClick={() => setSelectedTicker(company.ticker)}
                          className="flex items-center justify-between rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-3 text-left transition hover:border-[#0f8a8a]"
                        >
                          <span>
                            <span className="block text-sm font-bold">{company.ticker}</span>
                            <span className="mt-1 block text-xs font-semibold text-muted">{company.companyName}</span>
                          </span>
                          <ChevronRight size={17} className="text-muted" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#edf2f5]">
                      {holdings.map((holding) => {
                        const quote = quotes[holding.ticker]?.data;
                        const invested = holding.shares * holding.averageBuyPrice;
                        const currentValue = typeof quote?.price === "number" ? holding.shares * quote.price : invested;
                        const profitLoss = currentValue - invested;
                        const isGain = profitLoss >= 0;

                        return (
                          <article
                            key={holding._id}
                            className={`grid gap-3 px-5 py-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_auto] sm:items-center ${
                              selectedTicker === holding.ticker ? "bg-[#f3fbf8]" : "bg-white"
                            }`}
                          >
                            <button className="min-w-0 text-left" type="button" onClick={() => setSelectedTicker(holding.ticker)}>
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-[#102a2c] px-2.5 py-1 text-xs font-bold text-white">{holding.ticker}</span>
                                <span className="truncate text-sm font-bold">{holding.companyName ?? holding.ticker}</span>
                              </div>
                              <p className="mt-1 truncate text-xs font-semibold text-muted">{number.format(holding.shares)} shares at {formatCurrency(holding.averageBuyPrice)}</p>
                            </button>
                            <ValueBlock label="Value" value={formatCurrency(currentValue)} />
                            <ValueBlock label="P/L" value={formatCurrency(profitLoss)} tone={isGain ? "gain" : "loss"} />
                            <button
                              type="button"
                              onClick={() => clerkUserId && deleteHolding({ id: holding._id, clerkUserId })}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-red-100 text-loss transition hover:bg-red-50"
                              aria-label={`Delete ${holding.ticker}`}
                              disabled={!clerkUserId}
                            >
                              <Trash2 size={16} />
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </section>
            </div>

            <aside className="space-y-5">
              <Panel className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-muted">{selectedCompany.sector}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-normal">{selectedCompany.companyName}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-md bg-[#102a2c] px-2.5 py-1 text-xs font-bold text-white">{selectedCompany.ticker}</span>
                      <span className="text-xs font-bold text-[#0f8a8a]">{selectedCompany.conviction}</span>
                    </div>
                  </div>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white text-[#0f8a8a]" aria-label="Save company">
                    <Star size={18} />
                  </button>
                </div>

                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-bold text-muted">Latest quote</p>
                    <p className="mt-1 text-3xl font-semibold">{livePrice ? formatCurrency(livePrice) : "Unavailable"}</p>
                  </div>
                  {liveChangePercent ? (
                    <span className={`mb-1 flex items-center gap-1 text-sm font-bold ${liveChange >= 0 ? "text-gain" : "text-loss"}`}>
                      {liveChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {liveChangePercent}
                    </span>
                  ) : null}
                </div>

                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex rounded-lg border border-[#d9e2e7] bg-[#fbfcfd] p-1">
                    {["1d", "1mo", "6mo", "1y", "5y"].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setChartRange(range)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase ${
                          chartRange === range ? "bg-[#102a2c] text-white" : "text-muted"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                  {isChartLoading ? <Loader2 className="animate-spin text-muted" size={17} /> : null}
                </div>

                {isChartLoading && !chartData ? (
                  <div className="grid h-[125px] gap-3 rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-4">
                    <SkeletonLine className="h-5 w-1/3" />
                    <SkeletonLine className="h-16 w-full" />
                    <SkeletonLine className="h-4 w-2/3" />
                  </div>
                ) : (
                  <PerformanceChart points={chartData?.points ?? []} fallbackValues={selectedPath} />
                )}
                {chartNotice ? <p className="mt-2 text-xs font-bold text-muted">{chartNotice}</p> : null}

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Metric label="Exchange" value={chartData?.exchange ?? "--"} />
                  <Metric label="Shares" value={selectedHolding ? number.format(selectedHolding.shares) : "--"} />
                  <Metric label="Target" value={selectedCompany.targetPrice ? formatCurrency(selectedCompany.targetPrice) : "--"} />
                  <Metric label="Cost" value={selectedHolding ? formatCurrency(selectedHolding.averageBuyPrice) : "--"} />
                  <Metric label="Range" value={chartRange.toUpperCase()} />
                  <Metric label="Points" value={chartData?.points.length ? number.format(chartData.points.length) : "--"} />
                </div>

                <div className="mt-4 rounded-lg bg-[#f6faf8] p-3">
                  <p className="text-xs font-bold uppercase text-muted">Research memo</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#213234]">{selectedCompany.thesis}</p>
                </div>
              </Panel>

              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold">Latest company news</h2>
                  {isNewsLoading ? <Loader2 className="animate-spin text-muted" size={18} /> : <Newspaper size={18} className="text-[#0f8a8a]" />}
                </div>
                <div className="space-y-3">
                  {isNewsLoading && news.length === 0 ? (
                    <>
                      <NewsSkeleton />
                      <NewsSkeleton />
                      <NewsSkeleton />
                    </>
                  ) : news.length > 0 ? (
                    news.slice(0, 4).map((item) => (
                      <a
                        key={`${item.source}-${item.title}`}
                        href={item.url ?? undefined}
                        target={item.url ? "_blank" : undefined}
                        rel="noreferrer"
                        className="block rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-3 transition hover:border-[#0f8a8a]"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-muted">{item.source}</span>
                          <span className="text-xs font-semibold text-muted">{item.publishedAt ?? "Recent"}</span>
                        </div>
                        <p className="text-sm font-bold leading-5">{item.title}</p>
                        {item.sentiment ? <p className="mt-2 text-xs font-bold text-[#0f8a8a]">{item.sentiment}</p> : null}
                      </a>
                    ))
                  ) : (
                    <div className="rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-3">
                      <p className="text-sm font-bold">News will appear here</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-muted">{newsError || "Select a ticker to load the latest company stories."}</p>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold">Research queue</h2>
                  <Sparkles size={18} className="text-[#ea580c]" />
                </div>
                <div className="space-y-3">
                  {hasProFeatures ? (
                    <>
                      <ResearchItem icon={Activity} title="Analytics" detail="Review allocation, performance drift, and concentration." />
                      <ResearchItem icon={CalendarDays} title="Alerts" detail="Track earnings, target prices, and portfolio events." />
                    </>
                  ) : (
                    <LockedFeature title="Analytics and alerts" detail="Upgrade to Pro to unlock portfolio analytics and alerts." />
                  )}
                  {hasPremiumFeatures ? (
                    <>
                      <ResearchItem icon={Sparkles} title="AI summaries" detail="Condense news, earnings, and thesis notes into quick briefs." />
                      <ResearchItem icon={Globe2} title="Advanced analytics" detail="Compare deeper signals across watchlist and holdings." />
                    </>
                  ) : (
                    <LockedFeature title="AI summaries and exports" detail="Upgrade to Premium for AI summaries, exports, and advanced analytics." />
                  )}
                </div>
              </Panel>

              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold">Market notes</h2>
                  <Newspaper size={18} className="text-[#0f8a8a]" />
                </div>
                <div className="space-y-3">
                  {marketNews.map((item) => (
                    <div key={item.title} className="border-b border-[#edf2f5] pb-3 last:border-0 last:pb-0">
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-muted">
                        <span>{item.source}</span>
                        <span>{item.time}</span>
                      </div>
                      <p className="text-sm font-bold leading-5">{item.title}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </aside>
          </div>
        </section>
      </div>
      {isImportOpen ? (
        <ImportPortfolioModal
          broker={importBroker}
          canSaveStocks={canSaveStocks}
          fileName={importFileName}
          headers={importHeaders}
          includeCashRows={includeCashRows}
          isImporting={isImporting}
          mapping={importMapping}
          errors={importErrors}
          warnings={importWarnings}
          rows={importRows}
          saveRestriction={saveRestriction}
          unmappedColumns={importUnmappedColumns}
          onBrokerChange={handleImportBrokerChange}
          onClose={closeImportModal}
          onConfirm={confirmImport}
          onFileChange={handleImportFileChange}
          onIncludeCashRowsChange={handleIncludeCashRowsChange}
          onMappingChange={handleImportMappingChange}
        />
      ) : null}
    </main>
  );
}

function ImportPortfolioModal({
  broker,
  canSaveStocks,
  fileName,
  headers,
  includeCashRows,
  isImporting,
  mapping,
  errors,
  warnings,
  rows,
  saveRestriction,
  unmappedColumns,
  onBrokerChange,
  onClose,
  onConfirm,
  onFileChange,
  onIncludeCashRowsChange,
  onMappingChange
}: {
  broker: BrokerKey;
  canSaveStocks: boolean;
  fileName: string;
  headers: string[];
  includeCashRows: boolean;
  isImporting: boolean;
  mapping: ImportColumnMapping;
  errors: string[];
  warnings: string[];
  rows: ImportRow[];
  saveRestriction: string;
  unmappedColumns: string[];
  onBrokerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onClose: () => void;
  onConfirm: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onIncludeCashRowsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMappingChange: (field: AtlasImportField, column: string) => void;
}) {
  const canConfirm = canSaveStocks && rows.length > 0 && errors.length === 0 && !isImporting;

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-[#020407]/70 px-3 py-3 backdrop-blur-md sm:items-center sm:justify-center sm:p-6">
      <section className="max-h-[92vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#071016] text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:max-w-5xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6ee7d8]">Broker CSV import</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Import broker portfolio</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#8fa1b3]">
              Pick a broker, upload a CSV, review mapped columns, then confirm the rows to save.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8fa1b3] transition hover:text-white"
            aria-label="Close import modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-86px)] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#8fa1b3]">
              Broker
              <select
                value={broker}
                onChange={onBrokerChange}
                className="h-11 rounded-lg border border-white/10 bg-[#0a141b] px-3 text-sm font-black normal-case tracking-normal text-white outline-none focus:border-[#6ee7d8]"
              >
                {brokerOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#6ee7d8]/35 bg-[#6ee7d8]/10 px-4 py-6 text-center transition hover:border-[#6ee7d8] hover:bg-[#6ee7d8]/14">
              <FileUp className="mb-3 text-[#6ee7d8]" size={26} />
              <span className="text-sm font-black">{fileName || "Choose a CSV file"}</span>
              <span className="mt-1 text-xs font-semibold text-[#8fa1b3]">Auto-maps broker headers. Blank rows are ignored.</span>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={onFileChange} />
            </label>
            <a
              href={getBrokerTemplateHref(broker)}
              download={`atlas-${broker}-portfolio-template.csv`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:border-[#6ee7d8]/40"
            >
              <Download size={16} />
              Template
            </a>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm font-bold text-[#c5d2df]">
            <input
              type="checkbox"
              checked={includeCashRows}
              onChange={onIncludeCashRowsChange}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0a141b] accent-[#6ee7d8]"
            />
            <span>
              Include cash-like rows
              <span className="mt-1 block text-xs font-semibold text-[#8fa1b3]">
                Off by default. Skips cash, sweep, money market, SPAXX, FDRXX, VMFXX, and similar rows.
              </span>
            </span>
          </label>

          {!canSaveStocks ? (
            <p className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-100">{saveRestriction}</p>
          ) : null}

          {headers.length > 0 ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-black">Column mapping</h3>
                  <p className="mt-1 text-xs font-semibold text-[#8fa1b3]">Adjust any field that Atlas did not detect correctly.</p>
                </div>
                {unmappedColumns.length > 0 ? (
                  <span className="text-xs font-bold text-amber-100">{unmappedColumns.length} unmapped</span>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {atlasImportFields.map((field) => (
                  <label key={field.key} className="grid gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#8fa1b3]">
                    {field.label}
                    {field.required ? <span className="sr-only">required</span> : null}
                    <select
                      value={mapping[field.key] ?? ""}
                      onChange={(event) => onMappingChange(field.key, event.target.value)}
                      className="h-10 rounded-lg border border-white/10 bg-[#0a141b] px-3 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-[#6ee7d8]"
                    >
                      <option value="">Not mapped</option>
                      {headers.map((header) => (
                        <option key={`${field.key}-${header}`} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4">
              <p className="text-sm font-black text-amber-100">Warnings</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold leading-6 text-amber-100/90">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {errors.length > 0 ? (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <p className="text-sm font-black text-red-100">Fix these before importing:</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold leading-6 text-red-100/90">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <h3 className="text-sm font-black">Preview</h3>
              <span className="text-xs font-bold text-[#8fa1b3]">{rows.length} mapped rows</span>
            </div>
            {rows.length > 0 ? (
              <div className="max-h-72 overflow-auto">
                <table className="min-w-[860px] w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[#0a141b] text-xs uppercase text-[#8fa1b3]">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Ticker</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Shares</th>
                      <th className="px-4 py-3">Avg Buy</th>
                      <th className="px-4 py-3">Sector</th>
                      <th className="px-4 py-3">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => (
                      <tr key={row.id} className="bg-white/[0.02]">
                        <td className="px-4 py-3 font-semibold text-[#8fa1b3]">{row.sourceRow}</td>
                        <td className="px-4 py-3 font-black text-[#6ee7d8]">{row.ticker}</td>
                        <td className="px-4 py-3 font-semibold">{row.companyName ?? row.ticker}</td>
                        <td className="px-4 py-3 font-semibold">{number.format(row.shares)}</td>
                        <td className={`px-4 py-3 font-semibold ${row.averageBuyPrice ? "" : "text-amber-100"}`}>
                          {row.averageBuyPrice ? formatCurrency(row.averageBuyPrice) : "Needs mapping"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#8fa1b3]">{row.sector ?? "--"}</td>
                        <td className="px-4 py-3 font-semibold text-[#8fa1b3]">{row.targetPrice ? formatCurrency(row.targetPrice) : "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 text-sm font-semibold leading-6 text-[#8fa1b3]">Upload a CSV to preview validated rows before they are saved.</div>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canConfirm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6ee7d8] px-4 text-sm font-black text-[#061012] transition hover:bg-[#8df3e8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
              Confirm import
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`premium-card border border-[#dfe7ec] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.06)] ${className}`}>{children}</section>;
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: typeof LayoutDashboard; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
        active ? "bg-[#6ee7d8]/12 text-[#6ee7d8] ring-1 ring-[#6ee7d8]/25" : "text-slate-600 hover:bg-white/[0.06] hover:text-ink"
      }`}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}

function MarketPill({ label, value, change, tone }: { label: string; value: string; change: string; tone: "gain" | "loss" }) {
  return (
    <div className="premium-card flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-xs font-bold text-muted">{label}</p>
        <p className="mt-1 text-sm font-bold">{value}</p>
      </div>
      <span className={`text-xs font-bold ${tone === "gain" ? "text-gain" : "text-loss"}`}>{change}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e4ebf0] bg-[#fbfcfd]/80 p-3">
      <p className="text-[11px] font-bold uppercase text-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function LabeledInput(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase text-slate-600">
      {label}
      <input
        {...inputProps}
        className="h-10 rounded-lg border border-[#d9e2e7] bg-white/80 px-3 text-sm font-semibold normal-case text-ink outline-none transition placeholder:text-slate-400 focus:border-[#0f8a8a] focus:ring-4 focus:ring-[#0f8a8a]/20"
      />
    </label>
  );
}

function ValueBlock({ label, value, tone }: { label: string; value: string; tone?: "gain" | "loss" }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className={`mt-1 text-sm font-bold ${tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

function NewsSkeleton() {
  return (
    <div className="rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-3">
      <div className="mb-3 flex items-center justify-between">
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-3 w-12" />
      </div>
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="mt-2 h-4 w-2/3" />
    </div>
  );
}

function AreaChart({ values }: { values: number[] }) {
  const points = makePoints(values, 620, 170, 14);
  const area = `M 14 170 ${points} L 606 170 Z`;

  return (
    <svg className="h-[190px] w-full" viewBox="0 0 620 190" role="img" aria-label="Portfolio value chart">
      <defs>
        <linearGradient id="portfolioArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f8a8a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0f8a8a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 82, 124, 166].map((y) => (
        <line key={y} x1="14" x2="606" y1={y} y2={y} stroke="#edf2f5" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#portfolioArea)" />
      <path d={`M ${points}`} fill="none" stroke="#0f8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <circle cx="606" cy="35" r="5" fill="#0f8a8a" />
    </svg>
  );
}

function PerformanceChart({ points, fallbackValues }: { points: ChartPoint[]; fallbackValues: number[] }) {
  const values = points.length > 1 ? points.map((point) => point.close) : fallbackValues;
  const line = makePoints(values, 310, 110, 10);
  const first = values[0] ?? 0;
  const last = values.at(-1) ?? first;
  const isGain = last >= first;
  const stroke = isGain ? "#0f8a8a" : "#b42318";

  return (
    <svg className="h-[125px] w-full rounded-lg bg-[#f6faf8]" viewBox="0 0 310 125" role="img" aria-label="Selected company performance chart">
      {[28, 58, 88].map((y) => (
        <line key={y} x1="10" x2="300" y1={y} y2={y} stroke="#deebe7" strokeWidth="1" />
      ))}
      <path d={`M ${line}`} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      <path d={`M ${line} L 300 110 L 10 110 Z`} fill={stroke} opacity="0.08" />
    </svg>
  );
}

function AllocationDonut({ items, total }: { items: { ticker: string; value: number; color: string }[]; total: number }) {
  const segments = items.length && total > 0 ? items : [{ ticker: "Cash", value: 1, color: "#cbd5e1" }];
  let offset = 25;

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120" role="img" aria-label="Portfolio allocation">
        <circle cx="60" cy="60" r="43" fill="none" stroke="#edf2f5" strokeWidth="18" />
        {segments.map((item) => {
          const pct = Math.max(4, (item.value / (total || 1)) * 100);
          const segment = (
            <circle
              key={item.ticker}
              cx="60"
              cy="60"
              r="43"
              fill="none"
              stroke={item.color}
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="18"
              pathLength="100"
            />
          );
          offset -= pct;
          return segment;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-muted">Total</p>
        <p className="text-lg font-bold">{formatCompactCurrency(total)}</p>
      </div>
    </div>
  );
}

function ResearchItem({ icon: Icon, title, detail }: { icon: typeof Activity; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#0f8a8a] shadow-sm">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted">{detail}</p>
      </div>
    </div>
  );
}

function LockedFeature({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#e4ebf0] bg-[#fbfcfd] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
        <LockKeyhole size={16} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">{title}</p>
          <Link href="/pricing" className="rounded-md bg-[#102a2c] px-2 py-0.5 text-[11px] font-black uppercase text-white">
            Upgrade
          </Link>
        </div>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted">{detail}</p>
      </div>
    </div>
  );
}

function makePoints(values: number[], width: number, height: number, pad: number) {
  if (values.length <= 1) {
    return `${pad} ${height / 2} L ${width - pad} ${height / 2}`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = pad + index * step;
      const y = pad + (1 - (value - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" L ");
}

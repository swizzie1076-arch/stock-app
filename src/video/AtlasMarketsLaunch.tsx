import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BookmarkPlus,
  CalendarDays,
  FileText,
  Globe2,
  LineChart,
  Newspaper,
  Plus,
  Search,
  ShieldCheck,
  Star,
  TrendingUp
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type LaunchProps = {
  appName: string;
  tagline: string;
};

type Stock = {
  ticker: string;
  name: string;
  price: string;
  move: string;
  sector: string;
};

const stocks: Stock[] = [
  { ticker: "MSFT", name: "Microsoft", price: "$427.18", move: "+2.1%", sector: "Cloud software" },
  { ticker: "NVDA", name: "NVIDIA", price: "$143.62", move: "+4.8%", sector: "AI semiconductors" },
  { ticker: "TSLA", name: "Tesla", price: "$183.07", move: "+1.3%", sector: "EVs and energy" },
  { ticker: "AAPL", name: "Apple", price: "$214.39", move: "-0.3%", sector: "Consumer devices" }
];

const chartPoints = [
  0.64, 0.59, 0.61, 0.53, 0.55, 0.46, 0.49, 0.37, 0.4, 0.32, 0.35, 0.24,
  0.27, 0.18
];

const metrics = [
  { label: "Portfolio Value", value: "$145.2K", meta: "+2.34%" },
  { label: "Day P/L", value: "+$3,418", meta: "+1.18%" },
  { label: "Saved Stocks", value: "24", meta: "Convex" },
  { label: "Research Queue", value: "18 names", meta: "4 catalysts" }
];

const researchRows = [
  "AI demand remains above model",
  "News sentiment turning constructive",
  "Next earnings catalyst in 18 days"
];

const newsRows = [
  { source: "Market desk", title: "Mega-cap tech leads a measured morning rally" },
  { source: "Research note", title: "Cloud spending estimates remain resilient" },
  { source: "Macro brief", title: "Rate expectations steady after inflation data" }
];

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], { ...clamp, easing: ease });

const slideY = (frame: number, start: number, distance = 44) =>
  interpolate(frame, [start, start + 24], [distance, 0], { ...clamp, easing: ease });

const sceneProgress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], { ...clamp, easing: ease });

const makePath = (width: number, height: number) =>
  chartPoints
    .map((point, index) => {
      const x = (index / (chartPoints.length - 1)) * width;
      const y = point * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

export const AtlasMarketsLaunch = ({ appName, tagline }: LaunchProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroOut = interpolate(frame, [82, 112], [1, 0], { ...clamp, easing: ease });
  const trackerIn = fade(frame, 72, 104);
  const addStockIn = fade(frame, 172, 204);
  const researchIn = fade(frame, 316, 352);
  const finalIn = fade(frame, 520, 558);

  return (
    <AbsoluteFill style={styles.stage}>
      <MarketGrid />
      <TickerTape />

      <div
        style={{
          ...styles.hero,
          opacity: heroOut,
          transform: `translateY(${interpolate(frame, [76, 112], [0, -42], clamp)}px)`
        }}
      >
        <div style={styles.brandPill}>
          <TrendingUp size={28} />
          <span>Portfolio research cockpit</span>
        </div>
        <h1 style={styles.heroTitle}>{appName}</h1>
        <p style={styles.heroCopy}>{tagline}</p>
      </div>

      <div
        style={{
          ...styles.dashboard,
          opacity: trackerIn,
          transform: `translateY(${slideY(frame, 74, 80)}px) scale(${interpolate(
            frame,
            [74, 112],
            [0.96, 1],
            { ...clamp, easing: ease }
          )})`
        }}
      >
        <TerminalHeader frame={frame} />
        <div style={styles.metricStrip}>
          {metrics.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} frame={frame} />
          ))}
        </div>
        <div style={styles.workspace}>
          <Watchlist frame={frame} />
          <ChartPanel frame={frame} fps={fps} />
          <ResearchPanel frame={frame} />
        </div>
      </div>

      <div
        style={{
          ...styles.addStockCallout,
          opacity: addStockIn * interpolate(frame, [286, 306], [1, 0], clamp),
          transform: `translateY(${slideY(frame, 174, 48)}px)`
        }}
      >
        <div style={styles.calloutIcon}>
          <BookmarkPlus size={34} />
        </div>
        <div>
          <p style={styles.eyebrow}>Track stocks</p>
          <h2 style={styles.addStockTitle}>Save holdings with shares, cost basis, thesis, and target price.</h2>
        </div>
        <div style={styles.miniForm}>
          <span style={styles.miniField}>NVDA</span>
          <span style={styles.miniField}>42 shares</span>
          <span style={styles.miniField}>$164 target</span>
          <strong style={styles.miniSaved}>
            <Plus size={17} /> Saved
          </strong>
        </div>
      </div>

      <div
        style={{
          ...styles.researchCallout,
          opacity: researchIn * interpolate(frame, [474, 500], [1, 0], clamp),
          transform: `translateY(${slideY(frame, 318, 54)}px)`
        }}
      >
        <div style={styles.calloutIcon}>
          <BookOpen size={34} />
        </div>
        <div>
          <p style={styles.eyebrow}>Research workflow</p>
          <h2 style={styles.calloutTitle}>Turn quotes, news, and notes into an investable view.</h2>
        </div>
        <div style={styles.calloutGrid}>
          {["Thesis notes", "Live quotes", "News sentiment", "Catalyst calendar"].map((item, index) => (
            <span
              key={item}
              style={{
                ...styles.calloutChip,
                opacity: fade(frame, 350 + index * 10, 374 + index * 10),
                transform: `translateY(${slideY(frame, 350 + index * 10, 20)}px)`
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          ...styles.finalFrame,
          opacity: finalIn,
        transform: `scale(${interpolate(frame, [520, 562], [0.96, 1], {
            ...clamp,
            easing: ease
          })})`
        }}
      >
        <div style={styles.finalMark}>
          <TrendingUp size={58} />
        </div>
        <h2 style={styles.finalTitle}>{appName}</h2>
        <p style={styles.finalCopy}>Track stocks. Research companies. Build conviction.</p>
      </div>
    </AbsoluteFill>
  );
};

const MarketGrid = () => {
  return (
    <AbsoluteFill>
      <div style={styles.backgroundGlow} />
      <svg width="1920" height="1080" style={styles.gridSvg}>
        <defs>
          <pattern id="smallGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d9e2df" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#smallGrid)" opacity="0.38" />
      </svg>
    </AbsoluteFill>
  );
};

const TickerTape = () => {
  const frame = useCurrentFrame();
  const tickers = ["MSFT 427.18 +2.10%", "NVDA 143.62 +4.80%", "AAPL 214.39 -0.30%", "SPY 624.18 +0.42%", "VIX 15.24 -2.31%"];
  const offset = interpolate(frame, [0, 660], [0, -720], clamp);

  return (
    <div style={styles.tickerTrack}>
      <div style={{ ...styles.tickerInner, transform: `translateX(${offset}px)` }}>
        {[...tickers, ...tickers, ...tickers].map((ticker, index) => (
          <span key={`${ticker}-${index}`} style={styles.tickerItem}>
            {ticker}
          </span>
        ))}
      </div>
    </div>
  );
};

const TerminalHeader = ({ frame }: { frame: number }) => {
  const scan = interpolate(frame, [96, 156], [0, 1], clamp);

  return (
    <div style={styles.terminalHeader}>
      <div style={styles.headerBrand}>
        <div style={styles.headerLogo}>
          <TrendingUp size={24} />
        </div>
        <div>
          <p style={styles.eyebrow}>Atlas Invest</p>
          <strong style={styles.headerTitle}>Portfolio Cockpit</strong>
        </div>
      </div>
      <div style={styles.searchBar}>
        <Search size={20} />
        <span>Search ticker or company</span>
        <div style={{ ...styles.searchFill, width: `${scan * 42}%` }} />
      </div>
      <div style={styles.headerActions}>
        <span style={styles.marketOpen}>Market open</span>
        <Bell size={22} />
      </div>
    </div>
  );
};

const MetricCard = ({
  metric,
  index,
  frame
}: {
  metric: { label: string; value: string; meta: string };
  index: number;
  frame: number;
}) => {
  const progress = spring({
    frame: frame - 106 - index * 5,
    fps: 30,
    config: { damping: 180, stiffness: 120 }
  });

  return (
    <div
      style={{
        ...styles.metricCard,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 24}px)`
      }}
    >
      <span style={styles.metricIcon}>{index === 2 ? <ShieldCheck size={25} /> : <BarChart3 size={25} />}</span>
      <div>
        <p style={styles.metricLabel}>{metric.label}</p>
        <strong style={styles.metricValue}>{metric.value}</strong>
      </div>
      <em style={styles.metricMeta}>{metric.meta}</em>
    </div>
  );
};

const Watchlist = ({ frame }: { frame: number }) => {
  return (
    <aside style={styles.panel}>
      <PanelTitle eyebrow="Portfolio" title="Saved Companies" icon={<Star size={24} />} />
      <div style={styles.stockList}>
        {stocks.map((stock, index) => {
          const rowIn = fade(frame, 126 + index * 7, 146 + index * 7);
          return (
            <div
              key={stock.ticker}
              style={{
                ...styles.stockRow,
                borderColor: index === 1 ? "#0f7a4f" : "#e4e9ee",
                background: index === 1 ? "#f0faf5" : "#ffffff",
                opacity: rowIn,
                transform: `translateX(${(1 - rowIn) * -32}px)`
              }}
            >
              <strong style={styles.stockTicker}>{stock.ticker}</strong>
              <div>
                <span style={styles.stockName}>{stock.name}</span>
                <small style={styles.stockSector}>{stock.sector}</small>
              </div>
              <div style={styles.stockPrice}>
                <span>{stock.price}</span>
                <em style={stock.move.startsWith("+") ? styles.upText : styles.downText}>{stock.move}</em>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const ChartPanel = ({ frame, fps }: { frame: number; fps: number }) => {
  const draw = sceneProgress(frame, 132, 218);
  const marker = sceneProgress(frame, 158, 246);
  const pulse = spring({
    frame: frame - 190,
    fps,
    config: { damping: 120, stiffness: 90 }
  });
  const width = 748;
  const height = 390;
  const path = makePath(width, height);
  const markerIndex = Math.min(chartPoints.length - 1, Math.floor(marker * (chartPoints.length - 1)));
  const markerX = (markerIndex / (chartPoints.length - 1)) * width;
  const markerY = chartPoints[markerIndex] * height;

  return (
    <section style={styles.chartPanel}>
      <div style={styles.companyHeader}>
        <div>
          <p style={styles.eyebrow}>NASDAQ - AI semiconductors</p>
          <h2 style={styles.companyName}>NVIDIA Corporation</h2>
        </div>
        <div style={styles.lastPrice}>
          <span>$143.62</span>
          <em style={styles.priceMove}>
            <ArrowUpRight size={24} /> +4.8%
          </em>
        </div>
      </div>
      <div style={styles.segmented}>
        {["1D", "1M", "6M", "1Y", "5Y"].map((range, index) => (
          <span key={range} style={index === 2 ? styles.segmentActive : styles.segment}>
            {range}
          </span>
        ))}
      </div>
      <svg width={width} height={height} style={styles.chartSvg}>
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={(line + 1) * 78}
            y2={(line + 1) * 78}
            stroke="#e8edf1"
            strokeWidth="2"
          />
        ))}
        <path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          fill="#e5f4ed"
          opacity={0.62 * draw}
        />
        <path
          d={path}
          fill="none"
          stroke="#0f7a4f"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1380"
          strokeDashoffset={1380 * (1 - draw)}
        />
        <circle cx={markerX} cy={markerY} r={10 + pulse * 8} fill="#0f7a4f" opacity="0.22" />
        <circle cx={markerX} cy={markerY} r="9" fill="#0f7a4f" />
      </svg>
    </section>
  );
};

const ResearchPanel = ({ frame }: { frame: number }) => {
  return (
    <aside style={styles.panel}>
      <PanelTitle eyebrow="Research" title="Investment View" icon={<LineChart size={24} />} />
      <div style={styles.ratingCard}>
        <span style={styles.rating}>Outperform</span>
        <p style={styles.ratingCopy}>Research memo: AI demand and margin durability support the core thesis.</p>
        <div style={styles.targetRow}>
          <span>Target</span>
          <strong>$164.00</strong>
        </div>
      </div>
      <div style={styles.researchList}>
        {researchRows.map((row, index) => {
          const rowIn = fade(frame, 218 + index * 9, 238 + index * 9);
          return (
            <div
              key={row}
              style={{
                ...styles.researchRow,
                opacity: rowIn,
                transform: `translateY(${(1 - rowIn) * 18}px)`
              }}
            >
              <BookOpen size={19} />
              <span>{row}</span>
            </div>
          );
        })}
      </div>
      <div style={styles.calendarCard}>
        <CalendarDays size={22} />
        <span>Q2 earnings release</span>
        <strong>Jun 18</strong>
      </div>
      <div style={styles.newsStack}>
        {newsRows.map((row, index) => {
          const rowIn = fade(frame, 242 + index * 8, 260 + index * 8);
          return (
            <div
              key={row.title}
              style={{
                ...styles.newsRow,
                opacity: rowIn,
                transform: `translateY(${(1 - rowIn) * 16}px)`
              }}
            >
              {index === 0 ? <Newspaper size={18} /> : index === 1 ? <FileText size={18} /> : <Globe2 size={18} />}
              <div>
                <strong style={styles.newsSource}>{row.source}</strong>
                <span style={styles.newsTitle}>{row.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const PanelTitle = ({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: ReactNode }) => (
  <div style={styles.panelTitle}>
    <div>
      <p style={styles.eyebrow}>{eyebrow}</p>
      <h3 style={styles.panelHeading}>{title}</h3>
    </div>
    {icon}
  </div>
);

const styles: Record<string, CSSProperties> = {
  stage: {
    overflow: "hidden",
    color: "#101828",
    background: "#eef2f4",
    fontFamily: "Inter, Arial, sans-serif"
  },
  backgroundGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 22% 18%, rgba(15, 122, 79, 0.18), transparent 30%), radial-gradient(circle at 82% 36%, rgba(29, 78, 216, 0.12), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(238,242,244,0.96))"
  },
  gridSvg: {
    position: "absolute",
    inset: 0
  },
  tickerTrack: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    height: 46,
    overflow: "hidden",
    borderTop: "1px solid rgba(208, 213, 221, 0.72)",
    borderBottom: "1px solid rgba(208, 213, 221, 0.72)",
    background: "rgba(255, 255, 255, 0.64)"
  },
  tickerInner: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    height: "100%",
    whiteSpace: "nowrap"
  },
  tickerItem: {
    padding: "9px 14px",
    borderRadius: 999,
    color: "#344054",
    background: "#ffffff",
    fontSize: 18,
    fontWeight: 800
  },
  hero: {
    position: "absolute",
    top: 198,
    left: 128,
    width: 980
  },
  brandPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 18px",
    border: "1px solid #b7dec9",
    borderRadius: 999,
    color: "#0f7a4f",
    background: "#e5f4ed",
    fontSize: 24,
    fontWeight: 900
  },
  heroTitle: {
    margin: "34px 0 14px",
    color: "#101828",
    fontSize: 130,
    lineHeight: 0.92,
    letterSpacing: 0,
    fontWeight: 950
  },
  heroCopy: {
    margin: 0,
    maxWidth: 850,
    color: "#344054",
    fontSize: 42,
    lineHeight: 1.18,
    fontWeight: 750
  },
  dashboard: {
    position: "absolute",
    left: 92,
    right: 92,
    top: 132,
    height: 838,
    padding: 20,
    border: "1px solid #cfd7df",
    borderRadius: 10,
    background: "rgba(255, 255, 255, 0.94)",
    boxShadow: "0 34px 90px rgba(16, 24, 40, 0.18)"
  },
  terminalHeader: {
    display: "grid",
    gridTemplateColumns: "460px 1fr 320px",
    alignItems: "center",
    gap: 20,
    height: 86,
    padding: "0 22px",
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    background: "#ffffff"
  },
  headerBrand: {
    display: "flex",
    alignItems: "center",
    gap: 14
  },
  headerLogo: {
    display: "grid",
    placeItems: "center",
    width: 50,
    height: 50,
    borderRadius: 8,
    color: "#0f7a4f",
    background: "#e5f4ed"
  },
  eyebrow: {
    margin: "0 0 5px",
    color: "#667085",
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  headerTitle: {
    color: "#101828",
    fontSize: 28,
    lineHeight: 1.05
  },
  searchBar: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 48,
    padding: "0 18px",
    overflow: "hidden",
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    color: "#667085",
    background: "#f9fafb",
    fontSize: 19,
    fontWeight: 750
  },
  searchFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    background: "rgba(15, 122, 79, 0.08)"
  },
  headerActions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 18,
    color: "#344054"
  },
  marketOpen: {
    padding: "12px 16px",
    borderRadius: 999,
    color: "#0f7a4f",
    background: "#e5f4ed",
    fontSize: 16,
    fontWeight: 950
  },
  metricStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    marginTop: 16
  },
  metricCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    minHeight: 104,
    padding: 18,
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    background: "#ffffff"
  },
  metricIcon: {
    display: "grid",
    placeItems: "center",
    width: 48,
    height: 48,
    borderRadius: 8,
    color: "#0f7a4f",
    background: "#e5f4ed"
  },
  metricLabel: {
    margin: 0,
    color: "#667085",
    fontSize: 17,
    fontWeight: 850
  },
  metricValue: {
    display: "block",
    marginTop: 6,
    color: "#111827",
    fontSize: 34,
    lineHeight: 1,
    fontWeight: 950
  },
  metricMeta: {
    marginLeft: "auto",
    color: "#0f7a4f",
    fontSize: 17,
    fontStyle: "normal",
    fontWeight: 900
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "360px 1fr 360px",
    gap: 16,
    marginTop: 16,
    height: 588
  },
  panel: {
    padding: 18,
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    background: "#ffffff"
  },
  panelTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    color: "#667085"
  },
  panelHeading: {
    margin: 0,
    color: "#101828",
    fontSize: 25,
    lineHeight: 1.1
  },
  stockList: {
    display: "grid",
    gap: 12
  },
  stockRow: {
    display: "grid",
    gridTemplateColumns: "70px 1fr auto",
    gap: 12,
    alignItems: "center",
    minHeight: 82,
    padding: 14,
    border: "1px solid #e4e9ee",
    borderRadius: 8
  },
  stockTicker: {
    display: "grid",
    placeItems: "center",
    width: 58,
    height: 42,
    borderRadius: 6,
    color: "#111827",
    background: "#eef2f4",
    fontSize: 18
  },
  stockName: {
    display: "block",
    color: "#101828",
    fontSize: 20,
    fontWeight: 900
  },
  stockSector: {
    display: "block",
    marginTop: 4,
    color: "#667085",
    fontSize: 15,
    fontWeight: 750
  },
  stockPrice: {
    textAlign: "right",
    fontSize: 16,
    fontWeight: 850
  },
  upText: {
    display: "block",
    marginTop: 4,
    color: "#0f7a4f",
    fontStyle: "normal"
  },
  downText: {
    display: "block",
    marginTop: 4,
    color: "#b42318",
    fontStyle: "normal"
  },
  chartPanel: {
    padding: 22,
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    background: "#ffffff"
  },
  companyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14
  },
  companyName: {
    margin: 0,
    color: "#101828",
    fontSize: 44,
    lineHeight: 1
  },
  lastPrice: {
    textAlign: "right",
    color: "#101828",
    fontSize: 42,
    fontWeight: 950,
    lineHeight: 1
  },
  priceMove: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    color: "#0f7a4f",
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: 950
  },
  segmented: {
    display: "inline-grid",
    gridTemplateColumns: "repeat(5, 58px)",
    gap: 4,
    padding: 5,
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    background: "#f2f4f7"
  },
  segment: {
    display: "grid",
    placeItems: "center",
    height: 36,
    borderRadius: 5,
    color: "#667085",
    fontSize: 16,
    fontWeight: 900
  },
  segmentActive: {
    display: "grid",
    placeItems: "center",
    height: 36,
    borderRadius: 5,
    color: "#0f7a4f",
    background: "#ffffff",
    fontSize: 16,
    fontWeight: 900,
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.12)"
  },
  chartSvg: {
    display: "block",
    marginTop: 30,
    overflow: "visible"
  },
  ratingCard: {
    padding: 16,
    border: "1px solid #e4e9ee",
    borderRadius: 8,
    background: "#ffffff"
  },
  rating: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    color: "#0f7a4f",
    background: "#e5f4ed",
    fontSize: 16,
    fontWeight: 950
  },
  ratingCopy: {
    margin: "14px 0",
    color: "#344054",
    fontSize: 18,
    lineHeight: 1.35,
    fontWeight: 650
  },
  targetRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#667085",
    fontSize: 17,
    fontWeight: 850
  },
  researchList: {
    display: "grid",
    gap: 10,
    marginTop: 14
  },
  researchRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 13,
    border: "1px solid #e4e9ee",
    borderRadius: 8,
    color: "#344054",
    fontSize: 17,
    fontWeight: 800
  },
  calendarCard: {
    display: "grid",
    gridTemplateColumns: "28px 1fr auto",
    gap: 12,
    alignItems: "center",
    marginTop: 14,
    padding: 15,
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    color: "#344054",
    background: "#f9fafb",
    fontSize: 17,
    fontWeight: 850
  },
  newsStack: {
    display: "grid",
    gap: 8,
    marginTop: 12
  },
  newsRow: {
    display: "grid",
    gridTemplateColumns: "22px 1fr",
    gap: 9,
    alignItems: "start",
    padding: 10,
    border: "1px solid #e4e9ee",
    borderRadius: 8,
    color: "#344054",
    background: "#fbfcfd",
    fontSize: 13,
    fontWeight: 750
  },
  newsSource: {
    display: "block",
    color: "#667085",
    fontSize: 11,
    lineHeight: 1.1,
    textTransform: "uppercase"
  },
  newsTitle: {
    display: "block",
    marginTop: 4,
    lineHeight: 1.22
  },
  researchCallout: {
    position: "absolute",
    left: 220,
    right: 220,
    bottom: 116,
    display: "grid",
    gridTemplateColumns: "76px 1fr auto",
    gap: 22,
    alignItems: "center",
    padding: "26px 30px",
    border: "1px solid #b7dec9",
    borderRadius: 10,
    background: "rgba(255, 255, 255, 0.96)",
    boxShadow: "0 24px 70px rgba(16, 24, 40, 0.18)"
  },
  addStockCallout: {
    position: "absolute",
    left: 248,
    right: 248,
    top: 676,
    display: "grid",
    gridTemplateColumns: "76px 1fr 438px",
    gap: 22,
    alignItems: "center",
    padding: "24px 28px",
    border: "1px solid #b7dec9",
    borderRadius: 10,
    background: "rgba(255, 255, 255, 0.97)",
    boxShadow: "0 24px 70px rgba(16, 24, 40, 0.2)"
  },
  addStockTitle: {
    margin: 0,
    color: "#101828",
    fontSize: 31,
    lineHeight: 1.08
  },
  miniForm: {
    display: "grid",
    gridTemplateColumns: "86px 116px 128px 1fr",
    gap: 8,
    alignItems: "center",
    color: "#344054",
    fontSize: 16,
    fontWeight: 900
  },
  miniField: {
    display: "grid",
    placeItems: "center",
    minHeight: 42,
    border: "1px solid #d0d5dd",
    borderRadius: 8,
    background: "#f9fafb"
  },
  miniSaved: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 42,
    borderRadius: 8,
    color: "#ffffff",
    background: "#102a2c",
    fontSize: 16
  },
  calloutIcon: {
    display: "grid",
    placeItems: "center",
    width: 66,
    height: 66,
    borderRadius: 10,
    color: "#0f7a4f",
    background: "#e5f4ed"
  },
  calloutTitle: {
    margin: 0,
    color: "#101828",
    fontSize: 36,
    lineHeight: 1.04
  },
  calloutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, auto)",
    gap: 10
  },
  calloutChip: {
    padding: "11px 14px",
    border: "1px solid #d0d5dd",
    borderRadius: 999,
    color: "#344054",
    background: "#ffffff",
    fontSize: 17,
    fontWeight: 900
  },
  finalFrame: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: 22,
    background: "rgba(238, 242, 244, 0.84)"
  },
  finalMark: {
    display: "grid",
    placeItems: "center",
    width: 112,
    height: 112,
    borderRadius: 18,
    color: "#0f7a4f",
    background: "#e5f4ed",
    border: "1px solid #b7dec9"
  },
  finalTitle: {
    margin: 0,
    color: "#101828",
    fontSize: 96,
    lineHeight: 0.95
  },
  finalCopy: {
    margin: 0,
    color: "#344054",
    fontSize: 36,
    fontWeight: 800
  }
};

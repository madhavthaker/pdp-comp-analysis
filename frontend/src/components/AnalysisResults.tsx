"use client";

import React, { useState } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Type,
  FileText,
  Image,
  DollarSign,
  Search,
  MousePointerClick,
  Target,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import {
  AnalysisReport,
  ComparisonDimension,
  ImprovementRecommendation,
  Priority,
  CompetitorFinderResponse,
} from "@/types/analysis";
import { ScoreRing } from "./ScoreRing";
import { ComparisonBar } from "./ComparisonBar";

interface AnalysisResultsProps {
  report: AnalysisReport;
  competitorDiscovery?: CompetitorFinderResponse;
}

const priorityConfig: Record<
  Priority,
  { icon: typeof AlertTriangle; color: string; bgColor: string; borderColor: string }
> = {
  critical: {
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  high: {
    icon: AlertCircle,
    color: "text-coral-600",
    bgColor: "bg-coral-50",
    borderColor: "border-coral-200",
  },
  medium: {
    icon: Info,
    color: "text-honey-500",
    bgColor: "bg-honey-50",
    borderColor: "border-honey-200",
  },
  low: {
    icon: CheckCircle2,
    color: "text-forest-600",
    bgColor: "bg-forest-50",
    borderColor: "border-forest-200",
  },
};

const dimensionIcons: Record<string, typeof Type> = {
  title: Type,
  description: FileText,
  images: Image,
  pricing: DollarSign,
  seo: Search,
  cta: MousePointerClick,
};

// Helper to normalize effort/impact levels to Low/Medium/High
function normalizeLevel(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("high")) return "High";
  if (lower.includes("medium")) return "Medium";
  if (lower.includes("low")) return "Low";
  return value;
}

// Helper to replace SOURCE/REFERENCE with friendlier terms
function humanizeTerms(text: string): string {
  return text
    .replace(/\bSOURCE\b/g, "You")
    .replace(/\bsource\b/g, "you")
    .replace(/\bSource\b/g, "You")
    .replace(/\bREFERENCE\b/g, "Competitor")
    .replace(/\breference\b/g, "competitor")
    .replace(/\bReference\b/g, "Competitor");
}

// Helper to parse markdown links and render as React elements
function parseMarkdownLinks(text: string): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:text-teal-500 underline decoration-teal-300 underline-offset-2 transition-colors"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function AnalysisResults({
  report,
  competitorDiscovery,
}: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["competitor", "summary", "comparison"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const comparisons: ComparisonDimension[] = [
    report.comparison.title_comparison,
    report.comparison.description_comparison,
    report.comparison.images_comparison,
    report.comparison.pricing_comparison,
    report.comparison.seo_comparison,
    report.comparison.cta_comparison,
  ];

  const sourceWins = comparisons.filter((c) => c.winner === "source").length;
  const referenceWins = comparisons.filter((c) => c.winner === "reference").length;

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16 animate-fade-in">
      {/* Results Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 badge-coral mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Analysis Complete
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-400">
          Your Competitive Analysis
        </h2>
      </div>

      {/* Competitor Discovery Section */}
      {competitorDiscovery && (
        <CollapsibleSection
          title="Why This Competitor?"
          subtitle="Understanding the benchmark selection"
          isExpanded={expandedSections.has("competitor")}
          onToggle={() => toggleSection("competitor")}
        >
          <div className="space-y-8">
            {/* Side-by-side Product Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Product */}
              <div className="card p-6 border-coral-200/50">
                <div className="flex items-center justify-between mb-5">
                  <span className="badge-coral">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
                    Your Product
                  </span>
                </div>
                <h4 className="font-display text-xl font-semibold text-ink-400 mb-1">
                  {competitorDiscovery.source_product_name}
                </h4>
                <p className="text-coral-600 font-medium text-sm mb-4">
                  {competitorDiscovery.source_brand}
                </p>
                <div className="pt-4 border-t border-canvas-300">
                  <span className="badge-neutral">
                    {competitorDiscovery.source_category}
                  </span>
                </div>
              </div>

              {/* Competitor Product */}
              <div className="card p-6 border-teal-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-teal-100/50 to-transparent -mr-10 -mt-10 rounded-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <span className="badge-teal">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      Benchmark
                    </span>
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">
                      Best-in-class
                    </span>
                  </div>
                  <h4 className="font-display text-xl font-semibold text-ink-400 mb-1">
                    {competitorDiscovery.competitor_product_name}
                  </h4>
                  <p className="text-teal-600 font-medium text-sm mb-4">
                    {competitorDiscovery.competitor_brand}
                  </p>
                  {competitorDiscovery.competitor_price && (
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="font-display text-3xl font-bold text-ink-400">
                        {competitorDiscovery.competitor_price}
                      </span>
                    </div>
                  )}
                  <a
                    href={competitorDiscovery.competitor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 
                             bg-teal-50 hover:bg-teal-100 
                             text-teal-600 font-semibold text-sm rounded-xl 
                             transition-all duration-200 border border-teal-200"
                  >
                    View PDP <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Why This Brand */}
            <div>
              <h4 className="text-sm font-semibold text-ink-200 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-500" />
                Why {competitorDiscovery.competitor_brand}?
              </h4>
              <div className="space-y-3">
                {competitorDiscovery.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-canvas-100 rounded-xl border border-canvas-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-ink-300 font-medium">
                        {parseMarkdownLinks(reason.reason)}
                      </p>
                      <p className="text-ink-100 text-sm mt-1">
                        {parseMarkdownLinks(reason.detail)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other competitors considered */}
            {competitorDiscovery.other_competitors_considered.length > 0 && (
              <div className="pt-5 border-t border-canvas-300">
                <p className="text-sm text-ink-100">
                  <span className="font-semibold text-ink-200">Also considered:</span>{" "}
                  {competitorDiscovery.other_competitors_considered.join(", ")}
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Score Overview */}
      <div className="card-premium p-8 sm:p-10 mb-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Source Score */}
          <div className="text-center">
            <span className="badge-coral mb-6 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
              Your Page
            </span>
            <ScoreRing score={report.source_pdp.overall_score} size={150} color="coral" />
            <h3
              className="font-display text-lg font-semibold text-ink-400 mt-5 truncate"
              title={report.source_pdp.product_name}
            >
              {report.source_pdp.product_name}
            </h3>
            <a
              href={report.source_pdp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4
                       bg-coral-50 hover:bg-coral-100 
                       text-coral-600 font-semibold text-sm rounded-xl 
                       transition-all duration-200 border border-coral-200"
            >
              View PDP <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* VS / Winner */}
          <div className="text-center py-8">
            <div className="font-display text-5xl font-bold text-canvas-400 mb-6">VS</div>
            <div className="p-5 bg-canvas-100 rounded-2xl border border-canvas-300">
              {report.comparison.overall_source_score >
              report.comparison.overall_reference_score ? (
                <div className="flex items-center justify-center gap-2 text-forest-600">
                  <Trophy className="w-6 h-6" />
                  <span className="font-display text-xl font-bold">You&apos;re Winning!</span>
                </div>
              ) : report.comparison.overall_source_score <
                report.comparison.overall_reference_score ? (
                <div className="flex items-center justify-center gap-2 text-coral-600">
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-display text-xl font-bold">Room to Grow</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-teal-600">
                  <Minus className="w-6 h-6" />
                  <span className="font-display text-xl font-bold">It&apos;s a Tie</span>
                </div>
              )}
              <p className="text-sm text-ink-100 mt-3 font-medium">
                {sourceWins} wins · {referenceWins} losses ·{" "}
                {6 - sourceWins - referenceWins} ties
              </p>
            </div>
          </div>

          {/* Reference Score */}
          <div className="text-center">
            <span className="badge-teal mb-6 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Competitor
            </span>
            <ScoreRing
              score={report.reference_pdp.overall_score}
              size={150}
              color="teal"
            />
            <h3
              className="font-display text-lg font-semibold text-ink-400 mt-5 truncate"
              title={report.reference_pdp.product_name}
            >
              {report.reference_pdp.product_name}
            </h3>
            <a
              href={report.reference_pdp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4
                       bg-teal-50 hover:bg-teal-100 
                       text-teal-600 font-semibold text-sm rounded-xl 
                       transition-all duration-200 border border-teal-200"
            >
              View PDP <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <CollapsibleSection
        title="Executive Summary"
        subtitle="Key takeaways from your analysis"
        isExpanded={expandedSections.has("summary")}
        onToggle={() => toggleSection("summary")}
      >
        <p className="text-ink-200 leading-relaxed whitespace-pre-line text-lg">
          {parseMarkdownLinks(report.executive_summary)}
        </p>
      </CollapsibleSection>

      {/* Dimension Comparison */}
      <CollapsibleSection
        title="Head-to-Head Comparison"
        subtitle="How you stack up across key dimensions"
        isExpanded={expandedSections.has("comparison")}
        onToggle={() => toggleSection("comparison")}
      >
        <div className="space-y-5">
          {comparisons.map((comparison) => {
            const dimensionKey = comparison.dimension.toLowerCase();
            const Icon = dimensionIcons[dimensionKey] || Type;

            return (
              <div
                key={comparison.dimension}
                className="p-6 bg-canvas-100 rounded-2xl border border-canvas-300"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-canvas-50 border border-canvas-300 flex items-center justify-center shadow-soft">
                    <Icon className="w-6 h-6 text-ink-100" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-lg font-semibold text-ink-400 capitalize">
                      {comparison.dimension}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {comparison.winner === "source" ? (
                        <span className="text-sm text-forest-600 flex items-center gap-1 font-medium">
                          <TrendingUp className="w-4 h-4" /> You&apos;re ahead
                        </span>
                      ) : comparison.winner === "reference" ? (
                        <span className="text-sm text-coral-600 flex items-center gap-1 font-medium">
                          <TrendingDown className="w-4 h-4" /> Competitor leads
                        </span>
                      ) : (
                        <span className="text-sm text-ink-100 flex items-center gap-1 font-medium">
                          <Minus className="w-4 h-4" /> Even match
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ComparisonBar
                  sourceScore={comparison.source_score}
                  referenceScore={comparison.reference_score}
                />

                <p className="text-sm text-ink-100 mt-5 leading-relaxed">
                  {parseMarkdownLinks(comparison.gap_analysis)}
                </p>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Recommendations */}
      <CollapsibleSection
        title={`Recommendations (${report.recommendations.length})`}
        subtitle="Prioritized actions to improve your page"
        isExpanded={expandedSections.has("recommendations")}
        onToggle={() => toggleSection("recommendations")}
        defaultExpanded
      >
        <div className="space-y-4">
          {report.recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} index={index} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <CollapsibleSection
          title="Your Strengths"
          subtitle="What you're doing well"
          isExpanded={expandedSections.has("strengths")}
          onToggle={() => toggleSection("strengths")}
          compact
        >
          <ul className="space-y-3">
            {report.source_pdp.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3 text-ink-200">
                <CheckCircle2 className="w-5 h-5 text-forest-500 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title="Areas to Improve"
          subtitle="Where to focus next"
          isExpanded={expandedSections.has("weaknesses")}
          onToggle={() => toggleSection("weaknesses")}
          compact
        >
          <ul className="space-y-3">
            {report.source_pdp.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-3 text-ink-200">
                <AlertCircle className="w-5 h-5 text-coral-500 mt-0.5 flex-shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  compact?: boolean;
}

function CollapsibleSection({
  title,
  subtitle,
  isExpanded,
  onToggle,
  children,
  compact = false,
}: CollapsibleSectionProps) {
  return (
    <div className={clsx("card mb-6", compact ? "p-5" : "p-6 sm:p-8")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left group"
      >
        <div>
          <h3
            className={clsx(
              "font-display font-semibold text-ink-400",
              compact ? "text-lg" : "text-xl sm:text-2xl"
            )}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-ink-100 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-canvas-100 flex items-center justify-center group-hover:bg-canvas-200 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-ink-100" />
          ) : (
            <ChevronDown className="w-5 h-5 text-ink-100" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-canvas-300">{children}</div>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: ImprovementRecommendation;
  index: number;
}

function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(index < 3);
  const config = priorityConfig[recommendation.priority];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        "rounded-2xl overflow-hidden border transition-all duration-200",
        config.bgColor,
        config.borderColor,
        isExpanded ? "shadow-soft" : ""
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-start gap-4 text-left"
      >
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            config.bgColor,
            "border",
            config.borderColor
          )}
        >
          <Icon className={clsx("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={clsx(
                "text-xs font-bold uppercase tracking-wide",
                config.color
              )}
            >
              {recommendation.priority}
            </span>
            <span className="text-xs text-ink-50">·</span>
            <span className="text-xs font-medium text-ink-100 capitalize">
              {recommendation.dimension}
            </span>
          </div>
          <p className="text-ink-400 font-semibold">{recommendation.recommendation}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-canvas-50/80 flex items-center justify-center flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-ink-100" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-100" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pl-[4.5rem] space-y-4">
          <div>
            <span className="text-xs font-bold text-ink-100 uppercase tracking-wide">
              Why it matters
            </span>
            <p className="text-sm text-ink-200 mt-1 leading-relaxed">
              {parseMarkdownLinks(recommendation.rationale)}
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <span className="text-xs font-bold text-ink-100 uppercase tracking-wide">
                Effort
              </span>
              <p className="text-sm text-ink-200 mt-1 font-medium">
                {normalizeLevel(recommendation.implementation_effort)}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold text-ink-100 uppercase tracking-wide">
                Impact
              </span>
              <p className="text-sm text-ink-200 mt-1 font-medium">
                {normalizeLevel(recommendation.expected_impact)}
              </p>
            </div>
          </div>

          {recommendation.example_from_reference && (
            <div className="p-4 bg-canvas-50 rounded-xl border border-canvas-300">
              <span className="text-xs font-bold text-ink-100 uppercase tracking-wide">
                Example from competitor
              </span>
              <p className="text-sm text-ink-200 mt-2 italic leading-relaxed">
                &ldquo;{parseMarkdownLinks(recommendation.example_from_reference)}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Trophy, TrendingUp, TrendingDown, Minus, 
  ChevronDown, ChevronUp, ExternalLink,
  AlertTriangle, AlertCircle, Info, CheckCircle2,
  Type, FileText, Image, DollarSign, Star, Search, MousePointerClick,
  Target, Lightbulb
} from "lucide-react";
import { clsx } from "clsx";
import { AnalysisReport, ComparisonDimension, ImprovementRecommendation, Priority, CompetitorFinderResponse } from "@/types/analysis";
import { ScoreRing } from "./ScoreRing";
import { ComparisonBar } from "./ComparisonBar";

interface AnalysisResultsProps {
  report: AnalysisReport;
  competitorDiscovery?: CompetitorFinderResponse;
}

const priorityConfig: Record<Priority, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  critical: { icon: AlertTriangle, color: "text-danger-400", bgColor: "bg-danger-500/10" },
  high: { icon: AlertCircle, color: "text-ember-400", bgColor: "bg-ember-500/10" },
  medium: { icon: Info, color: "text-warning-400", bgColor: "bg-warning-500/10" },
  low: { icon: CheckCircle2, color: "text-success-400", bgColor: "bg-success-500/10" },
};

const dimensionIcons: Record<string, typeof Type> = {
  title: Type,
  description: FileText,
  images: Image,
  pricing: DollarSign,
  reviews: Star,
  seo: Search,
  cta: MousePointerClick,
};

// Helper to normalize effort/impact levels to Low/Medium/High
function normalizeLevel(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("high")) return "high";
  if (lower.includes("medium")) return "medium";
  if (lower.includes("low")) return "low";
  return value;
}

// Helper to parse markdown links and render as React elements
function parseMarkdownLinks(text: string): React.ReactNode {
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-electric-400 hover:text-electric-300 underline"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function AnalysisResults({ report, competitorDiscovery }: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["competitor", "summary", "comparison"]));

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
    report.comparison.reviews_comparison,
    report.comparison.seo_comparison,
    report.comparison.cta_comparison,
  ];

  const sourceWins = comparisons.filter((c) => c.winner === "source").length;
  const referenceWins = comparisons.filter((c) => c.winner === "reference").length;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16 animate-fade-in">
      {/* Competitor Discovery Section */}
      {competitorDiscovery && (
        <CollapsibleSection
          title="Why This Competitor?"
          isExpanded={expandedSections.has("competitor")}
          onToggle={() => toggleSection("competitor")}
        >
          <div className="space-y-6">
            {/* Side-by-side Product Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Your Product */}
              <div className="glass rounded-xl p-5 border border-ember-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-ember-500" />
                  <span className="text-xs font-medium text-cream-100/60 uppercase tracking-wide">Your Product</span>
                </div>
                <h4 className="text-lg font-semibold text-cream-50 mb-1">
                  {competitorDiscovery.source_product_name}
                </h4>
                <p className="text-ember-400 font-medium text-sm mb-4">
                  {competitorDiscovery.source_brand}
                </p>
                {competitorDiscovery.source_price && (
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-cream-50">{competitorDiscovery.source_price}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-cream-100/10">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-cream-100/5 text-cream-100/50 rounded-full">
                    {competitorDiscovery.source_category}
                  </span>
                </div>
              </div>

              {/* Competitor Product */}
              <div className="glass rounded-xl p-5 border border-electric-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-electric-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-electric-500" />
                      <span className="text-xs font-medium text-cream-100/60 uppercase tracking-wide">Benchmark</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-electric-500/20 text-electric-400 rounded-full">
                      Best-in-class
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-cream-50 mb-1">
                    {competitorDiscovery.competitor_product_name}
                  </h4>
                  <p className="text-electric-400 font-medium text-sm mb-4">
                    {competitorDiscovery.competitor_brand}
                  </p>
                  {competitorDiscovery.competitor_price && (
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-cream-50">{competitorDiscovery.competitor_price}</span>
                    </div>
                  )}
                  <a
                    href={competitorDiscovery.competitor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-electric-500/20 hover:bg-electric-500/30 
                             text-electric-400 font-medium text-sm rounded-lg transition-all duration-200
                             border border-electric-500/30 hover:border-electric-500/50"
                  >
                    View PDP <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Why This Brand */}
            <div>
              <h4 className="text-sm font-medium text-cream-100/60 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-electric-400" />
                Why {competitorDiscovery.competitor_brand}?
              </h4>
              <div className="space-y-3">
                {competitorDiscovery.reasons.map((reason, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 glass rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-electric-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5 text-electric-400" />
                    </div>
                    <div>
                      <p className="text-cream-50 font-medium">{parseMarkdownLinks(reason.reason)}</p>
                      <p className="text-cream-100/60 text-sm mt-1">{parseMarkdownLinks(reason.detail)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other competitors considered */}
            {competitorDiscovery.other_competitors_considered.length > 0 && (
              <div className="pt-4 border-t border-cream-100/10">
                <p className="text-sm text-cream-100/40">
                  <span className="font-medium">Also considered:</span>{" "}
                  {competitorDiscovery.other_competitors_considered.join(", ")}
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Score Overview */}
      <div className="gradient-border p-8 mb-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Source Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-ember-500" />
              <span className="text-sm font-medium text-cream-100/60 uppercase tracking-wide">Your Page</span>
            </div>
            <ScoreRing score={report.source_pdp.overall_score} size={140} color="ember" />
            <h3 className="text-lg font-semibold text-cream-50 mt-4 truncate" title={report.source_pdp.product_name}>
              {report.source_pdp.product_name}
            </h3>
            <a 
              href={report.source_pdp.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mt-3
                       bg-ember-500/10 hover:bg-ember-500/20 
                       text-ember-400 font-medium text-sm rounded-lg transition-all duration-200
                       border border-ember-500/20 hover:border-ember-500/40"
            >
              View PDP <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* VS / Winner */}
          <div className="text-center">
            <div className="text-4xl font-bold text-cream-100/20 mb-4">VS</div>
            <div className="glass rounded-xl p-4">
              {report.comparison.overall_source_score > report.comparison.overall_reference_score ? (
                <div className="flex items-center justify-center gap-2 text-success-400">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">You're Winning!</span>
                </div>
              ) : report.comparison.overall_source_score < report.comparison.overall_reference_score ? (
                <div className="flex items-center justify-center gap-2 text-ember-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Room to Improve</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-electric-400">
                  <Minus className="w-5 h-5" />
                  <span className="font-semibold">It's a Tie</span>
                </div>
              )}
              <p className="text-sm text-cream-100/50 mt-2">
                {sourceWins} wins • {referenceWins} losses • {7 - sourceWins - referenceWins} ties
              </p>
            </div>
          </div>

          {/* Reference Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-electric-500" />
              <span className="text-sm font-medium text-cream-100/60 uppercase tracking-wide">Competitor</span>
            </div>
            <ScoreRing score={report.reference_pdp.overall_score} size={140} color="electric" />
            <h3 className="text-lg font-semibold text-cream-50 mt-4 truncate" title={report.reference_pdp.product_name}>
              {report.reference_pdp.product_name}
            </h3>
            <a 
              href={report.reference_pdp.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mt-3
                       bg-electric-500/10 hover:bg-electric-500/20 
                       text-electric-400 font-medium text-sm rounded-lg transition-all duration-200
                       border border-electric-500/20 hover:border-electric-500/40"
            >
              View PDP <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <CollapsibleSection
        title="Executive Summary"
        isExpanded={expandedSections.has("summary")}
        onToggle={() => toggleSection("summary")}
      >
        <p className="text-cream-100/80 leading-relaxed whitespace-pre-line">
          {parseMarkdownLinks(report.executive_summary)}
        </p>
      </CollapsibleSection>

      {/* Dimension Comparison */}
      <CollapsibleSection
        title="Head-to-Head Comparison"
        isExpanded={expandedSections.has("comparison")}
        onToggle={() => toggleSection("comparison")}
      >
        <div className="space-y-6">
          {comparisons.map((comparison) => {
            const dimensionKey = comparison.dimension.toLowerCase();
            const Icon = dimensionIcons[dimensionKey] || Type;
            
            return (
              <div key={comparison.dimension} className="glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cream-100/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cream-100/60" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-cream-50 capitalize">{comparison.dimension}</h4>
                    <div className="flex items-center gap-2">
                      {comparison.winner === "source" ? (
                        <span className="text-xs text-success-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> You're ahead
                        </span>
                      ) : comparison.winner === "reference" ? (
                        <span className="text-xs text-danger-400 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Competitor leads
                        </span>
                      ) : (
                        <span className="text-xs text-cream-100/40 flex items-center gap-1">
                          <Minus className="w-3 h-3" /> Even match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <ComparisonBar 
                  sourceScore={comparison.source_score} 
                  referenceScore={comparison.reference_score} 
                />
                
                <p className="text-sm text-cream-100/60 mt-4">
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
          isExpanded={expandedSections.has("strengths")}
          onToggle={() => toggleSection("strengths")}
          compact
        >
          <ul className="space-y-2">
            {report.source_pdp.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-cream-100/70">
                <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title="Areas to Improve"
          isExpanded={expandedSections.has("weaknesses")}
          onToggle={() => toggleSection("weaknesses")}
          compact
        >
          <ul className="space-y-2">
            {report.source_pdp.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-cream-100/70">
                <AlertCircle className="w-4 h-4 text-ember-400 mt-0.5 flex-shrink-0" />
                {weakness}
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
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  compact?: boolean;
}

function CollapsibleSection({ 
  title, 
  isExpanded, 
  onToggle, 
  children,
  compact = false 
}: CollapsibleSectionProps) {
  return (
    <div className={clsx("gradient-border mb-6", compact ? "p-5" : "p-6")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className={clsx("font-semibold text-cream-50", compact ? "text-lg" : "text-xl")}>
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-cream-100/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-cream-100/40" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-cream-100/10">
          {children}
        </div>
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
    <div className={clsx("glass rounded-xl overflow-hidden", config.bgColor)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-4 text-left"
      >
        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bgColor)}>
          <Icon className={clsx("w-4 h-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx("text-xs font-medium uppercase tracking-wide", config.color)}>
              {recommendation.priority}
            </span>
            <span className="text-xs text-cream-100/30">•</span>
            <span className="text-xs text-cream-100/50 capitalize">{recommendation.dimension}</span>
          </div>
          <p className="text-cream-50 font-medium">{recommendation.recommendation}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-cream-100/40 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-cream-100/40 flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pl-16 space-y-3">
          <div>
            <span className="text-xs font-medium text-cream-100/40 uppercase tracking-wide">Why it matters</span>
            <p className="text-sm text-cream-100/70 mt-1">{parseMarkdownLinks(recommendation.rationale)}</p>
          </div>
          
          <div className="flex gap-8">
            <div className="w-20">
              <span className="text-xs font-medium text-cream-100/40 uppercase tracking-wide">Effort</span>
              <p className="text-sm text-cream-100/70 mt-1 capitalize">{normalizeLevel(recommendation.implementation_effort)}</p>
            </div>
            <div className="w-20">
              <span className="text-xs font-medium text-cream-100/40 uppercase tracking-wide">Impact</span>
              <p className="text-sm text-cream-100/70 mt-1 capitalize">{normalizeLevel(recommendation.expected_impact)}</p>
            </div>
          </div>
          
          {recommendation.example_from_reference && (
            <div>
              <span className="text-xs font-medium text-cream-100/40 uppercase tracking-wide">
                Example from competitor
              </span>
              <p className="text-sm text-cream-100/70 mt-1 italic">
                "{parseMarkdownLinks(recommendation.example_from_reference)}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import { Search, ArrowRight, Loader2, Sparkles, Target, Zap, CheckCircle2, BarChart3 } from "lucide-react";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AnalysisReport, CompetitorFinderResponse } from "@/types/analysis";

type LoadingStep = "idle" | "finding_competitor" | "analyzing" | "complete";

interface CombinedResults {
  competitorDiscovery: CompetitorFinderResponse;
  comparison: AnalysisReport;
}

export default function Home() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CombinedResults | null>(null);

  const isLoading = loadingStep !== "idle" && loadingStep !== "complete";

  const [competitorFound, setCompetitorFound] =
    useState<CompetitorFinderResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStep("finding_competitor");
    setError(null);
    setResults(null);
    setCompetitorFound(null);

    try {
      // Step 1: Find competitor
      const competitorResponse = await fetch("/api/find-competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_url: sourceUrl }),
      });

      const competitorData = await competitorResponse.json();

      if (!competitorResponse.ok || !competitorData.success) {
        throw new Error(
          competitorData.detail || competitorData.error || "Failed to find competitor"
        );
      }

      // Show competitor found, move to analysis step
      setCompetitorFound(competitorData.data);
      setLoadingStep("analyzing");

      // Step 2: Run comparison
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_url: sourceUrl,
          reference_url: competitorData.data.competitor_url,
        }),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok || !analyzeData.success) {
        throw new Error(
          analyzeData.detail || analyzeData.error || "Analysis failed"
        );
      }

      setResults({
        competitorDiscovery: competitorData.data,
        comparison: analyzeData.data,
      });
      setLoadingStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoadingStep("idle");
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Background gradient mesh */}
      <div className="mesh-gradient" />

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-12">
          {/* Brand mark */}
          <div
            className="flex items-center justify-center gap-2 mb-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "0s", animationFillMode: "forwards" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center shadow-soft">
              <Zap className="w-5 h-5 text-canvas-50" />
            </div>
            <span className="font-display text-lg font-semibold text-ink-300">
              PDP Analyzer
            </span>
          </div>

          {/* Main heading */}
          <div
            className="text-center mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-ink-400 leading-[1.1] tracking-tight mb-6">
              See how your product page{" "}
              <span className="text-gradient">stacks up</span>
            </h1>
            <p className="text-lg sm:text-xl text-ink-100 max-w-2xl mx-auto leading-relaxed">
              Enter your product URL. We&apos;ll find the best competitor and deliver
              actionable insights to help you convert more customers.
            </p>
          </div>

          {/* Trust indicators */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 mb-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
          >
            {[
              "AI-Powered Analysis",
              "Best-in-Class Benchmarks",
              "Actionable Insights",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-ink-50">
                <div className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Show loading state OR form */}
          {isLoading ? (
            <LoadingState 
              step={loadingStep} 
              competitorFound={competitorFound} 
            />
          ) : (
            /* Input Form Card */
            <div
              className="opacity-0 animate-slide-up"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              <form onSubmit={handleSubmit} className="card-premium p-8 sm:p-10">
                {/* Input section */}
                <div className="space-y-3 mb-8">
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink-200 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-coral-500" />
                    Your Product Page URL
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://yourstore.com/products/amazing-product"
                    required
                    disabled={isLoading}
                    className="input text-lg"
                  />
                  <p className="text-sm text-ink-50">
                    We&apos;ll automatically identify your product category and find the
                    best competitor to benchmark against.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !sourceUrl}
                  className="btn-primary w-full py-4 text-lg"
                >
                  <Search className="w-5 h-5" />
                  Find Competitor & Analyze
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 card p-6 border-rose-200 bg-rose-50 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-rose-500 text-lg">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-rose-600 mb-1">
                    Analysis Failed
                  </h3>
                  <p className="text-rose-600/80">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="relative">
          <div className="divider max-w-4xl mx-auto mb-12" />
          <AnalysisResults
            report={results.comparison}
            competitorDiscovery={results.competitorDiscovery}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="relative mt-24 py-8 border-t border-canvas-300">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-canvas-50" />
            </div>
            <span className="text-sm font-medium text-ink-200">PDP Analyzer</span>
          </div>
          <p className="text-sm text-ink-50">
            AI-powered competitive intelligence for e-commerce
          </p>
        </div>
      </footer>
    </main>
  );
}

interface LoadingStateProps {
  step: LoadingStep;
  competitorFound: CompetitorFinderResponse | null;
}

function LoadingState({ step, competitorFound }: LoadingStateProps) {
  const isFindingCompetitor = step === "finding_competitor";
  const isAnalyzing = step === "analyzing";

  return (
    <div className="card-premium p-8 sm:p-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 mb-5 shadow-glow-coral">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-400 mb-2">
          {isFindingCompetitor ? "Finding Your Competitor" : "Analyzing Product Pages"}
        </h2>
        <p className="text-ink-100">
          {isFindingCompetitor 
            ? "We're searching for the best-in-class competitor in your space" 
            : "Running deep analysis across 6 key dimensions"}
        </p>
      </div>

      {/* Step Progress */}
      <div className="max-w-md mx-auto mb-10">
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex-1">
            <div className={`
              flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-500
              ${isFindingCompetitor 
                ? "bg-coral-50 border-coral-300 shadow-soft" 
                : "bg-forest-50 border-forest-300"}
            `}>
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${isFindingCompetitor 
                  ? "bg-coral-500" 
                  : "bg-forest-500"}
              `}>
                {isFindingCompetitor ? (
                  <Target className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${isFindingCompetitor ? "text-coral-700" : "text-forest-700"}`}>
                  Step 1
                </p>
                <p className={`text-xs ${isFindingCompetitor ? "text-coral-600" : "text-forest-600"}`}>
                  {isFindingCompetitor ? "Finding competitor..." : "Competitor found!"}
                </p>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className={`w-8 h-1 rounded-full transition-colors duration-500 ${isAnalyzing ? "bg-coral-300" : "bg-canvas-300"}`} />

          {/* Step 2 */}
          <div className="flex-1">
            <div className={`
              flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-500
              ${isAnalyzing 
                ? "bg-coral-50 border-coral-300 shadow-soft" 
                : "bg-canvas-100 border-canvas-300"}
            `}>
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${isAnalyzing 
                  ? "bg-coral-500" 
                  : "bg-canvas-300"}
              `}>
                {isAnalyzing ? (
                  <BarChart3 className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <BarChart3 className="w-5 h-5 text-ink-50" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${isAnalyzing ? "text-coral-700" : "text-ink-100"}`}>
                  Step 2
                </p>
                <p className={`text-xs ${isAnalyzing ? "text-coral-600" : "text-ink-50"}`}>
                  {isAnalyzing ? "Deep analysis..." : "Waiting..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Found Card */}
      {competitorFound && isAnalyzing && (
        <div className="bg-canvas-100 rounded-2xl p-6 border border-canvas-300 mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
              Competitor Identified
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xl font-semibold text-ink-400">
                {competitorFound.competitor_brand}
              </p>
              <p className="text-sm text-ink-100 mt-1">
                {competitorFound.competitor_product_name}
              </p>
            </div>
            <div className="badge-teal">Best-in-class</div>
          </div>
        </div>
      )}

      {/* What's happening */}
      <div className="bg-canvas-100 rounded-2xl p-6 border border-canvas-300">
        <p className="text-sm font-semibold text-ink-200 uppercase tracking-wide mb-4">
          {isFindingCompetitor ? "What we're doing" : "Analyzing"}
        </p>
        
        {isFindingCompetitor ? (
          <ul className="space-y-3">
            {[
              "Identifying your product category",
              "Searching for industry leaders",
              "Evaluating competitor product pages",
              "Selecting the best benchmark",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink-200">
                <div className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse" 
                     style={{ animationDelay: `${i * 0.2}s` }} />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {[
              "Title & headline effectiveness",
              "Product description quality",
              "Image & media presentation",
              "Pricing & value messaging",
              "SEO optimization",
              "Call-to-action strength",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink-200">
                <div className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse" 
                     style={{ animationDelay: `${i * 0.15}s` }} />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 pt-4 border-t border-canvas-300">
          <p className="text-xs text-ink-50 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            This typically takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

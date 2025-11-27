"use client";

import { useState } from "react";
import { Search, ArrowRight, Loader2, Sparkles, Target } from "lucide-react";
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

  const [competitorFound, setCompetitorFound] = useState<CompetitorFinderResponse | null>(null);

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
        throw new Error(competitorData.detail || competitorData.error || "Failed to find competitor");
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
        throw new Error(analyzeData.detail || analyzeData.error || "Analysis failed");
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

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case "finding_competitor":
        return {
          icon: <Target className="w-5 h-5 animate-pulse" />,
          text: "Finding the best competitor in your space...",
          subtext: "Analyzing your product and searching for the best-in-class benchmark",
          time: "~30-60 seconds",
        };
      case "analyzing":
        return {
          icon: <Sparkles className="w-5 h-5 animate-pulse" />,
          text: competitorFound 
            ? `Comparing against ${competitorFound.competitor_brand}...`
            : "Comparing product pages...",
          subtext: competitorFound
            ? `Found: ${competitorFound.competitor_product_name}. Now running deep analysis.`
            : "Running deep analysis across all dimensions",
          time: "~30-60 seconds",
        };
      default:
        return null;
    }
  };

  const loadingInfo = getLoadingMessage();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ember-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-electric-500/20 rounded-full blur-[128px]" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-gradient">PDP</span>{" "}
              <span className="text-cream-50">Competitive Analysis</span>
            </h1>
            <p className="text-xl text-cream-100/70 max-w-2xl mx-auto leading-relaxed">
              Enter your product page URL. We'll find the best-in-class competitor 
              and show you exactly how to improve.
            </p>
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit} 
            className="gradient-border p-8 mb-8 animate-slide-up relative z-10"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Single URL Input */}
            <div className="relative z-10 space-y-2 mb-8">
              <label className="flex items-center gap-2 text-sm font-medium text-cream-100/80">
                <span className="w-2 h-2 rounded-full bg-ember-500" />
                Your Product Page URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://yourstore.com/products/your-product"
                  required
                  disabled={isLoading}
                  className="relative z-10 w-full px-4 py-4 bg-charcoal-900/50 border border-cream-100/10 rounded-lg 
                           text-cream-50 placeholder:text-cream-100/30 text-lg
                           focus:outline-none focus:border-ember-500/50 focus:ring-1 focus:ring-ember-500/50
                           disabled:opacity-50 transition-all"
                />
              </div>
              <p className="text-sm text-cream-100/40">
                We'll automatically find the best competitor to benchmark against
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !sourceUrl}
              className="relative z-10 w-full py-4 px-6 rounded-lg font-semibold text-charcoal-950
                       bg-gradient-to-r from-ember-500 to-electric-500
                       hover:from-ember-400 hover:to-electric-400
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 transform hover:scale-[1.02]
                       flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Find Competitor & Analyze
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Loading Progress */}
            {isLoading && loadingInfo && (
              <div className="mt-6 p-4 glass rounded-lg">
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${loadingStep === "finding_competitor" ? "bg-ember-500" : "bg-success-500"}`} />
                  <span className="text-xs text-cream-100/50">Step 1: Find Competitor</span>
                  <div className={`w-2 h-2 rounded-full ml-4 ${loadingStep === "analyzing" ? "bg-electric-500" : "bg-cream-100/20"}`} />
                  <span className="text-xs text-cream-100/50">Step 2: Analyze</span>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  {loadingInfo.icon}
                  <span className="font-medium text-cream-50">{loadingInfo.text}</span>
                </div>
                <p className="text-sm text-cream-100/50 ml-8">
                  {loadingInfo.subtext}
                </p>
                <p className="text-xs text-cream-100/30 ml-8 mt-2">
                  {loadingInfo.time}
                </p>
              </div>
            )}
          </form>

          {/* Error Display */}
          {error && (
            <div className="gradient-border p-6 mb-8 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-danger-500 mt-2" />
                <div>
                  <h3 className="font-semibold text-danger-400 mb-1">Analysis Failed</h3>
                  <p className="text-cream-100/70">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <AnalysisResults 
          report={results.comparison} 
          competitorDiscovery={results.competitorDiscovery}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-cream-100/10 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center text-cream-100/40 text-sm">
          Powered by AI • Built for e-commerce optimization
        </div>
      </footer>
    </main>
  );
}

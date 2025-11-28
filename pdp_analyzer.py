#!/usr/bin/env python3
"""
PDP Competitive Analysis Tool

A standalone script that compares two Product Detail Pages (PDPs) using 
OpenAI's gpt-5-search-api model with structured outputs, providing 
competitive analysis and improvement recommendations.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
from openai import OpenAI
from pydantic import BaseModel, Field

# Load environment variables from .env file
load_dotenv()


# ============================================================================
# Pydantic Models for Structured Output
# ============================================================================

class Priority(str, Enum):
    """Priority levels for improvement recommendations."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TitleAnalysis(BaseModel):
    """Analysis of the product title/headline."""
    title_text: str = Field(description="The actual title text found on the page")
    character_count: int = Field(description="Number of characters in the title")
    keyword_richness: int = Field(ge=1, le=10, description="Score 1-10 for keyword optimization")
    clarity: int = Field(ge=1, le=10, description="Score 1-10 for how clear and understandable the title is")
    emotional_appeal: int = Field(ge=1, le=10, description="Score 1-10 for emotional engagement and persuasion")
    observations: list[str] = Field(description="Key observations about the title")


class DescriptionAnalysis(BaseModel):
    """Analysis of the product description and bullet points."""
    has_bullet_points: bool = Field(description="Whether the page uses bullet points for features")
    bullet_point_count: int = Field(description="Number of bullet points if present")
    description_length: str = Field(description="Short/Medium/Long classification")
    benefit_focused: int = Field(ge=1, le=10, description="Score 1-10 for how benefit-focused vs feature-focused")
    readability: int = Field(ge=1, le=10, description="Score 1-10 for ease of reading")
    completeness: int = Field(ge=1, le=10, description="Score 1-10 for how complete the product info is")
    unique_selling_points: list[str] = Field(description="Key USPs identified in the description")
    observations: list[str] = Field(description="Key observations about the description")


class ImageAnalysis(BaseModel):
    """Analysis of product images."""
    image_count: int = Field(description="Number of product images visible")
    has_lifestyle_images: bool = Field(description="Whether lifestyle/context images are present")
    has_detail_shots: bool = Field(description="Whether close-up/detail images are present")
    has_size_reference: bool = Field(description="Whether size/scale reference images are present")
    has_video: bool = Field(description="Whether product video is present")
    image_quality_score: int = Field(ge=1, le=10, description="Score 1-10 for overall image quality")
    image_variety_score: int = Field(ge=1, le=10, description="Score 1-10 for variety of image types")
    observations: list[str] = Field(description="Key observations about images")


class PricingAnalysis(BaseModel):
    """Analysis of pricing and promotions."""
    price_displayed: str = Field(description="The price shown (or 'Not visible' if hidden)")
    has_original_price: bool = Field(description="Whether a strikethrough/original price is shown")
    has_discount_badge: bool = Field(description="Whether discount percentage/badge is visible")
    has_promotional_offer: bool = Field(description="Whether there's a promotional offer (coupon, bundle, etc.)")
    price_visibility_score: int = Field(ge=1, le=10, description="Score 1-10 for how clear pricing is")
    value_proposition_score: int = Field(ge=1, le=10, description="Score 1-10 for perceived value communication")
    observations: list[str] = Field(description="Key observations about pricing")


class SEOAnalysis(BaseModel):
    """Analysis of SEO elements."""
    has_structured_data: bool = Field(description="Whether schema.org or other structured data is likely present")
    keyword_usage_score: int = Field(ge=1, le=10, description="Score 1-10 for keyword optimization in visible content")
    breadcrumb_navigation: bool = Field(description="Whether breadcrumb navigation is present")
    url_structure_score: int = Field(ge=1, le=10, description="Score 1-10 for URL cleanliness and keyword inclusion")
    observations: list[str] = Field(description="Key observations about SEO elements")


class CTAAnalysis(BaseModel):
    """Analysis of Call-to-Action elements."""
    primary_cta_text: str = Field(description="Text of the main CTA button")
    cta_visibility_score: int = Field(ge=1, le=10, description="Score 1-10 for how visible/prominent the CTA is")
    has_urgency_elements: bool = Field(description="Whether urgency triggers exist (limited stock, timer, etc.)")
    has_trust_badges: bool = Field(description="Whether trust badges are near the CTA")
    has_guarantee_info: bool = Field(description="Whether return/guarantee info is visible")
    secondary_ctas: list[str] = Field(description="Other CTAs present (wishlist, compare, etc.)")
    conversion_optimization_score: int = Field(ge=1, le=10, description="Score 1-10 for overall conversion optimization")
    observations: list[str] = Field(description="Key observations about CTAs")


class PDPAnalysis(BaseModel):
    """Complete analysis of a single PDP. All fields must describe THIS URL only."""
    url: str = Field(description="The exact URL that was analyzed - copy from the prompt")
    product_name: str = Field(description="Product name found on THIS page")
    brand: Optional[str] = Field(description="Brand name found on THIS page")
    category: Optional[str] = Field(description="Product category on THIS page")
    title: TitleAnalysis
    description: DescriptionAnalysis
    images: ImageAnalysis
    pricing: PricingAnalysis
    seo: SEOAnalysis
    cta: CTAAnalysis
    overall_score: int = Field(ge=1, le=100, description="Overall quality score for THIS page out of 100")
    strengths: list[str] = Field(description="Top 3-5 strengths observed on THIS page")
    weaknesses: list[str] = Field(description="Top 3-5 weaknesses observed on THIS page")


class ComparisonDimension(BaseModel):
    """Comparison scores for a single dimension."""
    dimension: str = Field(description="Name of the dimension being compared")
    source_score: int = Field(ge=1, le=10, description="Score for SOURCE (the user's page URL)")
    reference_score: int = Field(ge=1, le=10, description="Score for REFERENCE (the competitor URL)")
    winner: str = Field(description="'source', 'reference', or 'tie'")
    gap_analysis: str = Field(description="Explain the gap: '[REFERENCE brand] does X; [SOURCE brand] could improve by...' - be explicit about which brand you're describing")


class CompetitiveComparison(BaseModel):
    """Side-by-side comparison of both PDPs. SOURCE = user's page, REFERENCE = competitor."""
    title_comparison: ComparisonDimension
    description_comparison: ComparisonDimension
    images_comparison: ComparisonDimension
    pricing_comparison: ComparisonDimension
    seo_comparison: ComparisonDimension
    cta_comparison: ComparisonDimension
    overall_source_score: int = Field(ge=1, le=100, description="Overall score for SOURCE PDP (user's page)")
    overall_reference_score: int = Field(ge=1, le=100, description="Overall score for REFERENCE PDP (competitor)")
    competitive_position: str = Field(description="Summary of where SOURCE (user) stands vs REFERENCE (competitor)")


class ImprovementRecommendation(BaseModel):
    """A specific improvement recommendation for the SOURCE (user's) PDP."""
    priority: Priority = Field(description="Priority level of this recommendation")
    dimension: str = Field(description="Which aspect this relates to (title, description, images, pricing, seo, cta)")
    recommendation: str = Field(description="The specific recommendation for SOURCE (user's page)")
    rationale: str = Field(description="Why this improvement matters for SOURCE")
    implementation_effort: str = Field(description="Low/Medium/High effort to implement")
    expected_impact: str = Field(description="Low/Medium/High expected impact on conversions")
    example_from_reference: Optional[str] = Field(description="Specific example from the REFERENCE PDP URL provided in the prompt - do NOT cite category pages, homepages, or any other URLs")


class AnalysisReport(BaseModel):
    """The complete competitive analysis report. SOURCE = user's page to improve, REFERENCE = competitor benchmark."""
    analysis_timestamp: str = Field(description="ISO timestamp of when analysis was performed")
    source_pdp: PDPAnalysis = Field(description="Analysis of SOURCE URL only - all observations must come from visiting the SOURCE URL")
    reference_pdp: PDPAnalysis = Field(description="Analysis of REFERENCE URL only - all observations must come from visiting the REFERENCE URL")
    comparison: CompetitiveComparison = Field(description="Compare SOURCE vs REFERENCE - source_score describes SOURCE, reference_score describes REFERENCE")
    recommendations: list[ImprovementRecommendation] = Field(
        description="How to improve SOURCE based on what REFERENCE does better"
    )
    executive_summary: str = Field(
        description="Summary naming both brands: how [SOURCE brand] compares to [REFERENCE brand] and what [SOURCE brand] should do"
    )


# ============================================================================
# OpenAI Integration
# ============================================================================

# Path to the prompts directory
PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt_template(template_name: str = "analysis_prompt.j2") -> str:
    """
    Load and return a Jinja2 template from the prompts directory.
    
    Args:
        template_name: Name of the template file
    
    Returns:
        The Jinja2 Template object
    """
    env = Environment(
        loader=FileSystemLoader(PROMPTS_DIR),
        trim_blocks=True,
        lstrip_blocks=True
    )
    return env.get_template(template_name)


def analyze_pdps(source_url: str, reference_url: str, api_key: Optional[str] = None) -> AnalysisReport:
    """
    Analyze two PDPs and return a comprehensive competitive analysis report.
    
    Args:
        source_url: URL of the PDP to improve
        reference_url: URL of the reference/competitor PDP
        api_key: OpenAI API key (optional, will use OPENAI_API_KEY env var if not provided)
    
    Returns:
        AnalysisReport with complete analysis and recommendations
    """
    # Initialize OpenAI client
    client = OpenAI(api_key=api_key) if api_key else OpenAI()
    
    # Load and render the prompt template
    template = load_prompt_template()
    prompt = template.render(
        source_url=source_url,
        reference_url=reference_url
    )
    
    # Make the API call with structured output
    response = client.beta.chat.completions.parse(
        model="gpt-5-search-api",
        messages=[
            {
                "role": "system",
                "content": "You are an expert e-commerce PDP analyst. CRITICAL: You will analyze two URLs. Keep them separate - SOURCE is the user's page to improve, REFERENCE is the competitor to learn from. Never mix up which observations belong to which URL. When filling source_pdp, only include what you saw on the SOURCE URL. When filling reference_pdp, only include what you saw on the REFERENCE URL."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format=AnalysisReport
    )
    
    # Extract and return the parsed response
    report = response.choices[0].message.parsed
    
    # Set the timestamp if not already set
    if not report.analysis_timestamp:
        report.analysis_timestamp = datetime.utcnow().isoformat() + "Z"
    
    return report


# ============================================================================
# CLI Interface
# ============================================================================

def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="Analyze and compare two Product Detail Pages (PDPs) for competitive insights.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "https://amazon.com/dp/B08N5WRWNW" "https://amazon.com/dp/B09V3KXJPB"
  %(prog)s "https://shop.com/product1" "https://competitor.com/product2" --output analysis.json
  
Environment Variables:
  OPENAI_API_KEY    Your OpenAI API key (required)
        """
    )
    
    parser.add_argument(
        "source_url",
        help="URL of the source PDP (the page you want to improve)"
    )
    
    parser.add_argument(
        "reference_url",
        help="URL of the reference PDP (the competitor/benchmark page)"
    )
    
    parser.add_argument(
        "-o", "--output",
        help="Output file path for the JSON report (default: print to stdout)",
        default=None
    )
    
    parser.add_argument(
        "--api-key",
        help="OpenAI API key (overrides OPENAI_API_KEY environment variable)",
        default=None
    )
    
    args = parser.parse_args()
    
    # Validate API key availability
    api_key = args.api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OpenAI API key is required.", file=sys.stderr)
        print("Set the OPENAI_API_KEY environment variable or use --api-key", file=sys.stderr)
        sys.exit(1)
    
    # Validate URLs (basic check)
    for url, name in [(args.source_url, "Source"), (args.reference_url, "Reference")]:
        if not url.startswith(("http://", "https://")):
            print(f"Error: {name} URL must start with http:// or https://", file=sys.stderr)
            sys.exit(1)
    
    try:
        print(f"Analyzing PDPs...", file=sys.stderr)
        print(f"  Source: {args.source_url}", file=sys.stderr)
        print(f"  Reference: {args.reference_url}", file=sys.stderr)
        print(f"  This may take a minute...\n", file=sys.stderr)
        
        # Perform analysis
        report = analyze_pdps(args.source_url, args.reference_url, api_key)
        
        # Convert to JSON
        json_output = report.model_dump_json(indent=2)
        
        # Output results
        if args.output:
            with open(args.output, "w") as f:
                f.write(json_output)
            print(f"Analysis saved to: {args.output}", file=sys.stderr)
        else:
            print(json_output)
        
        # Print summary to stderr
        print(f"\n{'='*60}", file=sys.stderr)
        print("ANALYSIS COMPLETE", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"Source PDP Score: {report.source_pdp.overall_score}/100", file=sys.stderr)
        print(f"Reference PDP Score: {report.reference_pdp.overall_score}/100", file=sys.stderr)
        print(f"Recommendations Generated: {len(report.recommendations)}", file=sys.stderr)
        
        critical_count = sum(1 for r in report.recommendations if r.priority == Priority.CRITICAL)
        high_count = sum(1 for r in report.recommendations if r.priority == Priority.HIGH)
        
        if critical_count > 0:
            print(f"  - Critical Priority: {critical_count}", file=sys.stderr)
        if high_count > 0:
            print(f"  - High Priority: {high_count}", file=sys.stderr)
        
    except Exception as e:
        print(f"Error during analysis: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()


#!/usr/bin/env python3
"""
Competitor Finder Tool

A standalone script that takes a single PDP URL and finds the top 
competitor product using OpenAI's gpt-5.1 model with web search.
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
from openai import OpenAI
from pydantic import BaseModel, Field

# Load environment variables from .env file
load_dotenv()


# ============================================================================
# Prompt Loading
# ============================================================================

PROMPTS_DIR = Path(__file__).parent / "prompts"

def load_prompt(template_name: str, **kwargs) -> str:
    """Load and render a Jinja2 template from the prompts directory."""
    env = Environment(loader=FileSystemLoader(PROMPTS_DIR), trim_blocks=True, lstrip_blocks=True)
    template = env.get_template(template_name)
    return template.render(**kwargs)


# ============================================================================
# Pydantic Models for Structured Output
# ============================================================================

class CompetitorReason(BaseModel):
    """A specific reason why this competitor was chosen."""
    reason: str = Field(description="The reason this is a good competitor")
    detail: str = Field(description="Supporting detail or evidence for this reason")


class CompetitorBrandResponse(BaseModel):
    """Step 1: Competitor brand selection."""
    competitor_brand: str = Field(description="Name of the best-in-class competitor brand")
    reasons: list[CompetitorReason] = Field(description="3-5 specific reasons why this brand is the best competitor")
    other_competitors_considered: list[str] = Field(description="2-3 other brands that were considered but not chosen")


class ProductCategoryResponse(BaseModel):
    """Step 2: Product category extraction."""
    source_product_name: str = Field(description="Name of the source product")
    source_brand: str = Field(description="Brand of the source product")
    source_price: Optional[str] = Field(default=None, description="Price in simple format like '$64' or '$129' - just the number")
    category: str = Field(description="Short product category description (e.g. 'Wireless mechanical keyboard')")


class CompetitorFinderResponse(BaseModel):
    """Final response combining all steps."""
    # Source context
    source_product_name: str = Field(description="Name of the source product")
    source_brand: str = Field(description="Brand of the source product")
    source_category: str = Field(description="Product category")
    source_price: Optional[str] = Field(default=None, description="Price in simple format like '$64'")
    
    # Competitor output
    competitor_url: str = Field(description="The full URL to the competitor's product page")
    competitor_product_name: str = Field(description="Name of the competitor product (from page title)")
    competitor_brand: str = Field(description="Brand of the competitor product")
    
    # Reasoning
    reasons: list[CompetitorReason] = Field(description="Reasons why this competitor is the best benchmark")
    other_competitors_considered: list[str] = Field(description="Other brands that were considered")


# ============================================================================
# OpenAI Integration - 3-Step Flow
# ============================================================================

def find_competitor(source_url: str, api_key: Optional[str] = None, verbose: bool = False) -> CompetitorFinderResponse:
    """
    Analyze a PDP and find the top competitor product using a 3-step flow.
    
    Steps:
        1. Find best-in-class competitor brand (structured output)
        2. Extract product category (structured output)
        3. Find competitor product URL (web search with url_citation)
    
    Args:
        source_url: URL of the PDP to analyze
        api_key: OpenAI API key (optional)
        verbose: Print progress to stderr
    
    Returns:
        CompetitorFinderResponse with competitor details
    """
    client = OpenAI(api_key=api_key) if api_key else OpenAI()
    
    # Step 1: Find best-in-class competitor brand with reasons
    if verbose:
        print("Step 1/3: Finding best-in-class competitor brand...", file=sys.stderr)
    
    brand_resp = client.responses.parse(
        model="gpt-5.1",
        input=load_prompt("find_competitor_brand.j2", source_url=source_url),
        tools=[{"type": "web_search"}],
        text_format=CompetitorBrandResponse,
    )
    brand_data = brand_resp.output_parsed
    if verbose:
        print(f"   → Competitor brand: {brand_data.competitor_brand}", file=sys.stderr)
        print(f"   → Reasons: {len(brand_data.reasons)}", file=sys.stderr)
    
    # Step 2: Extract product category
    if verbose:
        print("Step 2/3: Extracting product category...", file=sys.stderr)
    
    category_resp = client.responses.parse(
        model="gpt-5.1",
        input=load_prompt("extract_product_category.j2", source_url=source_url),
        tools=[{"type": "web_search"}],
        text_format=ProductCategoryResponse,
    )
    category_data = category_resp.output_parsed
    if verbose:
        print(f"   → Source: {category_data.source_product_name} ({category_data.source_brand})", file=sys.stderr)
        print(f"   → Category: {category_data.category}", file=sys.stderr)
    
    # Step 3: Find competitor product URL via web search
    if verbose:
        print("Step 3/3: Finding competitor product URL...", file=sys.stderr)
    
    brand = brand_data.competitor_brand
    category = category_data.category
    
    url_resp = client.responses.create(
        model="gpt-5.1",
        tools=[{"type": "web_search"}],
        include=["web_search_call.results"],
        input=load_prompt("find_competitor_url.j2", brand=brand, category=category),
    )
    
    # Extract URL and title from citations
    competitor_url, competitor_product_name = _extract_url_from_citations(url_resp, brand)
    if verbose:
        print(f"   → Competitor: {competitor_product_name}", file=sys.stderr)
        print(f"   → Competitor URL: {competitor_url}", file=sys.stderr)
    
    # Build final response
    return CompetitorFinderResponse(
        source_product_name=category_data.source_product_name,
        source_brand=category_data.source_brand,
        source_category=category_data.category,
        source_price=category_data.source_price,
        competitor_url=competitor_url,
        competitor_product_name=competitor_product_name,
        competitor_brand=brand_data.competitor_brand,
        reasons=brand_data.reasons,
        other_competitors_considered=brand_data.other_competitors_considered,
    )


def _extract_url_from_citations(response, brand_hint: str) -> tuple[str, str]:
    """Extract the best product URL and title from response citations.
    
    Returns:
        Tuple of (url, title)
    """
    # Collect all url_citation annotations with url and title
    all_citations = []
    for item in response.output:
        if hasattr(item, 'content'):
            for content in item.content:
                if hasattr(content, 'annotations'):
                    for annotation in content.annotations:
                        if annotation.type == 'url_citation':
                            all_citations.append({
                                'url': annotation.url,
                                'title': getattr(annotation, 'title', '') or ''
                            })
    
    if not all_citations:
        # Last resort: extract from text
        import re
        text = response.output_text
        urls = re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+', text)
        all_citations = [{'url': url, 'title': ''} for url in urls]
    
    if not all_citations:
        return ("URL not found", "Unknown Product")
    
    # Score citations to find the best product page
    def score_citation(citation: dict) -> int:
        url = citation['url']
        score = 0
        url_lower = url.lower()
        
        # Prefer product pages
        if '/products/' in url_lower or '/product/' in url_lower:
            score += 100
        
        # Penalize non-product pages
        if '/blogs/' in url_lower or '/blog/' in url_lower:
            score -= 50
        if '/collections/' in url_lower or '/collection/' in url_lower:
            score -= 30
        if '/pages/' in url_lower:
            score -= 20
        
        # Prefer URLs matching the brand
        brand_clean = brand_hint.lower().replace(' ', '')
        if brand_clean in url_lower:
            score += 10
        
        return score
    
    # Get the highest scoring citation
    best = max(all_citations, key=score_citation)
    return (best['url'], best['title'])


# ============================================================================
# CLI Interface
# ============================================================================

def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="Find the top competitor for a product page.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "https://example.com/products/my-product"
  %(prog)s "https://shop.com/product" --output competitor.json
  
Environment Variables:
  OPENAI_API_KEY    Your OpenAI API key (required)
        """
    )
    
    parser.add_argument(
        "source_url",
        help="URL of the product page to find competitors for"
    )
    
    parser.add_argument(
        "-o", "--output",
        help="Output file path for the JSON result (default: print to stdout)",
        default=None
    )
    
    parser.add_argument(
        "--api-key",
        help="OpenAI API key (overrides OPENAI_API_KEY environment variable)",
        default=None
    )
    
    parser.add_argument(
        "-v", "--verbose",
        help="Print progress to stderr",
        action="store_true"
    )
    
    args = parser.parse_args()
    
    # Validate API key availability
    api_key = args.api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OpenAI API key is required.", file=sys.stderr)
        print("Set the OPENAI_API_KEY environment variable or use --api-key", file=sys.stderr)
        sys.exit(1)
    
    # Validate URL
    if not args.source_url.startswith(("http://", "https://")):
        print("Error: URL must start with http:// or https://", file=sys.stderr)
        sys.exit(1)
    
    try:
        print(f"Finding competitors for: {args.source_url}", file=sys.stderr)
        print(f"This may take a moment...\n", file=sys.stderr)
        
        # Find competitor
        result = find_competitor(args.source_url, api_key, verbose=args.verbose)
        
        # Convert to JSON
        json_output = result.model_dump_json(indent=2)
        
        # Output results
        if args.output:
            with open(args.output, "w") as f:
                f.write(json_output)
            print(f"Results saved to: {args.output}", file=sys.stderr)
        else:
            print(json_output)
        
        # Print summary to stderr
        print(f"\n{'='*60}", file=sys.stderr)
        print("COMPETITOR FOUND", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"Source: {result.source_product_name} ({result.source_brand})", file=sys.stderr)
        print(f"Competitor: {result.competitor_product_name} ({result.competitor_brand})", file=sys.stderr)
        print(f"Competitor URL: {result.competitor_url}", file=sys.stderr)
        print(f"\nReasons:", file=sys.stderr)
        for i, reason in enumerate(result.reasons, 1):
            print(f"  {i}. {reason.reason}", file=sys.stderr)
            print(f"     → {reason.detail}", file=sys.stderr)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

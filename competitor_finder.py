#!/usr/bin/env python3
"""
Competitor Finder Tool

A standalone script that takes a single PDP URL and finds the top 
competitor product using OpenAI's gpt-5-search-api model with structured outputs.
"""

import argparse
import json
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
# Pydantic Models for Structured Output
# ============================================================================

class CompetitorReason(BaseModel):
    """A specific reason why this competitor was chosen."""
    reason: str = Field(description="The reason this is a good competitor")
    detail: str = Field(description="Supporting detail or evidence for this reason")


class CompetitorFinderResponse(BaseModel):
    """Simplified response - competitor URL + reasoning for piping to pdp_analyzer."""
    # Source context
    source_product_name: str = Field(description="Name of the source product")
    source_brand: str = Field(description="Brand of the source product")
    source_category: str = Field(description="Product category")
    
    # Competitor output (main result)
    competitor_url: str = Field(description="The full URL to the competitor's product page")
    competitor_product_name: str = Field(description="Name of the competitor product")
    competitor_brand: str = Field(description="Brand of the competitor product")
    
    # Reasoning
    reasons: list[CompetitorReason] = Field(
        description="3-5 specific reasons why this competitor is the best benchmark"
    )
    
    # Alternatives considered
    other_competitors_considered: list[str] = Field(
        description="2-3 other competitor products/brands that were considered but not chosen"
    )


# ============================================================================
# Prompt Loading
# ============================================================================

PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt_template(template_name: str = "competitor_finder.j2"):
    """Load and return a Jinja2 template from the prompts directory."""
    env = Environment(
        loader=FileSystemLoader(PROMPTS_DIR),
        trim_blocks=True,
        lstrip_blocks=True
    )
    return env.get_template(template_name)


# ============================================================================
# OpenAI Integration
# ============================================================================

def find_competitor(source_url: str, api_key: Optional[str] = None) -> CompetitorFinderResponse:
    """
    Analyze a PDP and find the top competitor product.
    
    Args:
        source_url: URL of the PDP to analyze
        api_key: OpenAI API key (optional, will use OPENAI_API_KEY env var if not provided)
    
    Returns:
        CompetitorFinderResponse with source product info and competitor details
    """
    # Initialize OpenAI client
    client = OpenAI(api_key=api_key) if api_key else OpenAI()
    
    # Load and render the prompt template
    template = load_prompt_template()
    prompt = template.render(source_url=source_url)
    
    # Make the API call with structured output
    response = client.beta.chat.completions.parse(
        model="gpt-5-search-api",
        messages=[
            {
                "role": "system",
                "content": "You are an expert e-commerce competitive intelligence analyst. Always provide accurate, real competitor URLs that are currently accessible."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format=CompetitorFinderResponse
    )
    
    # Extract and return the parsed response
    return response.choices[0].message.parsed


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
        result = find_competitor(args.source_url, api_key)
        
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


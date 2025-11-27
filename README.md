# PDP Competitive Analysis Tool

A standalone Python script that compares two Product Detail Pages (PDPs) using OpenAI's `gpt-5-search-api` model, providing comprehensive competitive analysis and actionable improvement recommendations.

## Features

- **Comprehensive PDP Analysis**: Analyzes 7 key dimensions of each product page:
  - Title/headline optimization
  - Product description and bullet points
  - Image quality and variety
  - Pricing and promotions
  - Reviews and social proof
  - SEO elements
  - Call-to-action effectiveness

- **Competitive Comparison**: Side-by-side scoring with gap analysis

- **Actionable Recommendations**: Prioritized improvement suggestions with effort/impact ratings

- **Structured JSON Output**: Clean, parseable output for integration with other tools

- **Customizable Prompts**: Jinja2 templates for easy iteration on analysis prompts

## Project Structure

```
pdp_competitive_analysis/
├── pdp_analyzer.py      # Main standalone script
├── prompts/
│   └── analysis_prompt.j2   # Jinja2 template for the analysis prompt
├── requirements.txt     # Dependencies
└── README.md           # This file
```

## Prerequisites

- Python 3.9 or higher
- OpenAI API key with access to `gpt-5-search-api` model

## Installation

1. Clone or download this repository:
   ```bash
   cd pdp_competitive_analysis
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

## Usage

### Basic Usage

Compare two PDPs and print the analysis to stdout:

```bash
python pdp_analyzer.py "https://example.com/your-product" "https://competitor.com/their-product"
```

### Save to File

Save the JSON analysis to a file:

```bash
python pdp_analyzer.py "https://example.com/your-product" "https://competitor.com/their-product" --output analysis.json
```

### Using API Key Directly

If you prefer not to set an environment variable:

```bash
python pdp_analyzer.py "https://example.com/your-product" "https://competitor.com/their-product" --api-key "your-api-key"
```

## Output Format

The tool outputs a structured JSON report containing:

```json
{
  "analysis_timestamp": "2024-01-15T10:30:00Z",
  "source_pdp": {
    "url": "...",
    "product_name": "...",
    "title": { /* title analysis */ },
    "description": { /* description analysis */ },
    "images": { /* image analysis */ },
    "pricing": { /* pricing analysis */ },
    "reviews": { /* reviews analysis */ },
    "seo": { /* SEO analysis */ },
    "cta": { /* CTA analysis */ },
    "overall_score": 75,
    "strengths": ["..."],
    "weaknesses": ["..."]
  },
  "reference_pdp": { /* same structure as source_pdp */ },
  "comparison": {
    "title_comparison": { "source_score": 7, "reference_score": 9, "winner": "reference", "gap_analysis": "..." },
    /* ... other dimension comparisons ... */
    "overall_source_score": 75,
    "overall_reference_score": 88,
    "competitive_position": "..."
  },
  "recommendations": [
    {
      "priority": "critical",
      "dimension": "images",
      "recommendation": "Add lifestyle images showing product in use",
      "rationale": "...",
      "implementation_effort": "Medium",
      "expected_impact": "High",
      "example_from_reference": "..."
    }
    /* ... more recommendations ... */
  ],
  "executive_summary": "..."
}
```

## Scoring System

Each dimension is scored on a 1-10 scale:
- **1-3**: Poor - Significant issues affecting user experience/conversion
- **4-5**: Below Average - Room for improvement
- **6-7**: Average - Meets basic standards
- **8-9**: Good - Well optimized
- **10**: Excellent - Best-in-class implementation

Overall PDP scores are on a 1-100 scale, calculated as a weighted aggregate of all dimensions.

## Recommendation Priorities

- **Critical**: Issues significantly hurting conversions - address immediately
- **High**: Important improvements with meaningful impact
- **Medium**: Optimizations that would enhance the page
- **Low**: Nice-to-have refinements

## Examples

### E-commerce Comparison

```bash
# Compare your Amazon listing to a top competitor
python pdp_analyzer.py \
  "https://amazon.com/dp/YOUR_ASIN" \
  "https://amazon.com/dp/COMPETITOR_ASIN" \
  --output amazon_analysis.json
```

### Shopify Store Analysis

```bash
# Analyze your Shopify product page against a successful D2C brand
python pdp_analyzer.py \
  "https://your-store.myshopify.com/products/your-product" \
  "https://successful-brand.com/products/similar-product" \
  --output shopify_analysis.json
```

## Customizing the Prompt

The analysis prompt is stored as a Jinja2 template in `prompts/analysis_prompt.j2`. You can edit this file to:

- Add or remove analysis dimensions
- Change the evaluation criteria
- Adjust the tone or focus of recommendations
- Add industry-specific guidelines

Available template variables:
- `{{ source_url }}` - The source PDP URL
- `{{ reference_url }}` - The reference PDP URL

After editing, simply run the script again - no code changes required.

## Troubleshooting

### "OpenAI API key is required"

Make sure you've set your API key:
```bash
export OPENAI_API_KEY="sk-..."
```

### "URL must start with http:// or https://"

Ensure you're providing complete URLs including the protocol.

### API Rate Limits

If you encounter rate limit errors, wait a moment and try again. The `gpt-5-search-api` model may have usage limits.

## License

MIT License - feel free to use and modify for your needs.


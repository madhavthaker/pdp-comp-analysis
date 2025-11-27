"""
FastAPI backend for PDP Competitive Analysis
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(Path(__file__).parent.parent / ".env")

# Add parent directory to path so we can import pdp_analyzer
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from pdp_analyzer import analyze_pdps, AnalysisReport
from competitor_finder import find_competitor, CompetitorFinderResponse


app = FastAPI(
    title="PDP Competitive Analysis API",
    description="Compare Product Detail Pages for competitive insights",
    version="1.0.0"
)

# CORS configuration for frontend
# In production, set FRONTEND_URL env var to your Vercel domain
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production frontend URL if configured
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
    # Also allow the vercel.app preview URLs
    if ".vercel.app" in frontend_url:
        allowed_origins.append("https://*.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    """Request body for the analyze endpoint."""
    source_url: HttpUrl
    reference_url: HttpUrl


class AnalyzeResponse(BaseModel):
    """Response wrapper for the analysis."""
    success: bool
    data: AnalysisReport | None = None
    error: str | None = None


class SingleUrlRequest(BaseModel):
    """Request body for single URL analysis."""
    source_url: HttpUrl


class CombinedAnalysisResponse(BaseModel):
    """Response for the combined single-URL analysis."""
    success: bool
    competitor_discovery: CompetitorFinderResponse | None = None
    comparison: AnalysisReport | None = None
    error: str | None = None


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


class FindCompetitorResponse(BaseModel):
    """Response for competitor finder."""
    success: bool
    data: CompetitorFinderResponse | None = None
    error: str | None = None


@app.post("/find-competitor", response_model=FindCompetitorResponse)
async def find_competitor_endpoint(request: SingleUrlRequest):
    """
    Find the best-in-class competitor for a product page.
    This is step 1 of the analysis flow.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        result = find_competitor(source_url=str(request.source_url), api_key=api_key)
        return FindCompetitorResponse(success=True, data=result)
    except Exception as e:
        error_message = str(e)
        if "insufficient_quota" in error_message:
            raise HTTPException(status_code=402, detail="OpenAI API quota exceeded")
        raise HTTPException(status_code=500, detail=f"Failed to find competitor: {error_message}")


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_pdps_endpoint(request: AnalyzeRequest):
    """
    Analyze two PDPs and return competitive analysis.
    
    This endpoint may take 30-60 seconds to complete as it uses
    OpenAI to analyze both product pages.
    """
    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured on server"
        )
    
    try:
        report = analyze_pdps(
            source_url=str(request.source_url),
            reference_url=str(request.reference_url),
            api_key=api_key
        )
        
        return AnalyzeResponse(
            success=True,
            data=report
        )
        
    except Exception as e:
        error_message = str(e)
        
        # Handle specific OpenAI errors
        if "insufficient_quota" in error_message:
            raise HTTPException(
                status_code=402,
                detail="OpenAI API quota exceeded. Please try again later."
            )
        elif "invalid_api_key" in error_message:
            raise HTTPException(
                status_code=500,
                detail="Invalid OpenAI API key configured on server"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {error_message}"
            )


@app.post("/analyze-single", response_model=CombinedAnalysisResponse)
async def analyze_single_url(request: SingleUrlRequest):
    """
    Analyze a single PDP by automatically finding the best competitor
    and running a full comparison.
    
    This endpoint chains two operations:
    1. Find the best-in-class competitor for the product
    2. Run full competitive analysis between source and competitor
    
    This may take 60-90 seconds to complete.
    """
    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured on server"
        )
    
    try:
        # Step 1: Find the best competitor
        competitor_result = find_competitor(
            source_url=str(request.source_url),
            api_key=api_key
        )
        
        # Step 2: Run the full comparison
        comparison_result = analyze_pdps(
            source_url=str(request.source_url),
            reference_url=competitor_result.competitor_url,
            api_key=api_key
        )
        
        return CombinedAnalysisResponse(
            success=True,
            competitor_discovery=competitor_result,
            comparison=comparison_result
        )
        
    except Exception as e:
        error_message = str(e)
        
        # Handle specific OpenAI errors
        if "insufficient_quota" in error_message:
            raise HTTPException(
                status_code=402,
                detail="OpenAI API quota exceeded. Please try again later."
            )
        elif "invalid_api_key" in error_message:
            raise HTTPException(
                status_code=500,
                detail="Invalid OpenAI API key configured on server"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {error_message}"
            )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


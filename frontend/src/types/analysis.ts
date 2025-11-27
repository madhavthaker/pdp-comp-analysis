// Types matching the Python Pydantic models

export type Priority = "critical" | "high" | "medium" | "low";

// Competitor Finder types
export interface CompetitorReason {
  reason: string;
  detail: string;
}

export interface CompetitorFinderResponse {
  source_product_name: string;
  source_brand: string;
  source_category: string;
  source_price: string | null;
  competitor_url: string;
  competitor_product_name: string;
  competitor_brand: string;
  competitor_image_url: string | null;
  competitor_price: string | null;
  reasons: CompetitorReason[];
  other_competitors_considered: string[];
}

export interface TitleAnalysis {
  title_text: string;
  character_count: number;
  keyword_richness: number;
  clarity: number;
  emotional_appeal: number;
  observations: string[];
}

export interface DescriptionAnalysis {
  has_bullet_points: boolean;
  bullet_point_count: number;
  description_length: string;
  benefit_focused: number;
  readability: number;
  completeness: number;
  unique_selling_points: string[];
  observations: string[];
}

export interface ImageAnalysis {
  image_count: number;
  has_lifestyle_images: boolean;
  has_detail_shots: boolean;
  has_size_reference: boolean;
  has_video: boolean;
  image_quality_score: number;
  image_variety_score: number;
  observations: string[];
}

export interface PricingAnalysis {
  price_displayed: string;
  has_original_price: boolean;
  has_discount_badge: boolean;
  has_promotional_offer: boolean;
  price_visibility_score: number;
  value_proposition_score: number;
  observations: string[];
}

export interface ReviewsAnalysis {
  average_rating: number | null;
  review_count: number | null;
  has_review_summary: boolean;
  has_review_images: boolean;
  has_seller_responses: boolean;
  has_verified_purchase_badges: boolean;
  social_proof_score: number;
  observations: string[];
}

export interface SEOAnalysis {
  has_structured_data: boolean;
  keyword_usage_score: number;
  breadcrumb_navigation: boolean;
  url_structure_score: number;
  observations: string[];
}

export interface CTAAnalysis {
  primary_cta_text: string;
  cta_visibility_score: number;
  has_urgency_elements: boolean;
  has_trust_badges: boolean;
  has_guarantee_info: boolean;
  secondary_ctas: string[];
  conversion_optimization_score: number;
  observations: string[];
}

export interface PDPAnalysis {
  url: string;
  product_name: string;
  brand: string | null;
  category: string | null;
  title: TitleAnalysis;
  description: DescriptionAnalysis;
  images: ImageAnalysis;
  pricing: PricingAnalysis;
  reviews: ReviewsAnalysis;
  seo: SEOAnalysis;
  cta: CTAAnalysis;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ComparisonDimension {
  dimension: string;
  source_score: number;
  reference_score: number;
  winner: "source" | "reference" | "tie";
  gap_analysis: string;
}

export interface CompetitiveComparison {
  title_comparison: ComparisonDimension;
  description_comparison: ComparisonDimension;
  images_comparison: ComparisonDimension;
  pricing_comparison: ComparisonDimension;
  reviews_comparison: ComparisonDimension;
  seo_comparison: ComparisonDimension;
  cta_comparison: ComparisonDimension;
  overall_source_score: number;
  overall_reference_score: number;
  competitive_position: string;
}

export interface ImprovementRecommendation {
  priority: Priority;
  dimension: string;
  recommendation: string;
  rationale: string;
  implementation_effort: string;
  expected_impact: string;
  example_from_reference: string | null;
}

export interface AnalysisReport {
  analysis_timestamp: string;
  source_pdp: PDPAnalysis;
  reference_pdp: PDPAnalysis;
  comparison: CompetitiveComparison;
  recommendations: ImprovementRecommendation[];
  executive_summary: string;
}


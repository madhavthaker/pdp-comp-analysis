from openai import OpenAI
client = OpenAI()

# Input PDP URL
pdp_url = "https://talentless.co/products/mens-heavyweight-hoodie"

# Step 1: Extract brand
print("=" * 50)
print("Step 1: Extracting brand...")
print("=" * 50)

brand_resp = client.responses.create(
    model="gpt-5.1",
    input=f"What is the brand name of the best in class competitor for this product? {pdp_url}\n\nRespond with ONLY the brand name, nothing else.",
    tools=[{"type": "web_search"}],
)
brand = brand_resp.output_text.strip()
print(f"Brand: {brand}")

# Step 2: Extract product category
print("\n" + "=" * 50)
print("Step 2: Extracting product category...")
print("=" * 50)

category_resp = client.responses.create(
    model="gpt-5.1",
    input=f"What is the core product category of this product? {pdp_url}\n\nRespond with ONLY a short product category description (e.g. 'Wireless mechanical keyboard'), nothing else.",
    tools=[{"type": "web_search"}],
)
category = category_resp.output_text.strip()
print(f"Category: {category}")

# Step 3: Find competitor product URL
print("\n" + "=" * 50)
print("Step 3: Finding competitor product...")
print("=" * 50)

competitor_resp = client.responses.create(
    model="gpt-5.1",
    tools=[{"type": "web_search"}],
    include=["web_search_call.results"],
    input=f"""
Your task: Find me a product from the brand "{brand}" that is a "{category}".

I need the product title that is on a specific PRODUCT PAGE (PDP) from {brand}'s official website".

Requirements:
- Product title must be from {brand}'s official website
- Product title should contain /products/ or /product/ in the path
- Include the citation for the PDP (not the category page, not the homepage, not the blog post) that contains the product title you found!""",
)

print(competitor_resp)

# Extract URL and title from citation annotation
competitor_url = None
competitor_title = None
for item in competitor_resp.output:
    if hasattr(item, 'content'):
        for content in item.content:
            if hasattr(content, 'annotations'):
                for annotation in content.annotations:
                    if annotation.type == 'url_citation':
                        competitor_url = annotation.url
                        competitor_title = getattr(annotation, 'title', None)
                        break

if not competitor_url:
    competitor_url = competitor_resp.output_text.strip()  # fallback
print(f"Competitor: {competitor_title}")
print(f"Competitor URL: {competitor_url}")

# Summary
print("\n" + "=" * 50)
print("SUMMARY")
print("=" * 50)
print(f"Input PDP: {pdp_url}")
print(f"Competitor Brand: {brand}")
print(f"Category: {category}")
print(f"Competitor Product: {competitor_title}")
print(f"Competitor URL: {competitor_url}")

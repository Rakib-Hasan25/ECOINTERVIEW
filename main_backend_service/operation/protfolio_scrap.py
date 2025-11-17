import requests
from bs4 import BeautifulSoup
import json
import os
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from constant.all_prompt import PORTFOLIO_ANALYSIS_PROMPT


def scrape_portfolio(url):
    """
    Scrape a portfolio website and extract structured data.
    
    Args:
        url (str): The portfolio URL to scrape
        
    Returns:
        dict: Structured portfolio data containing:
            - url: The portfolio URL
            - title: Page title
            - meta: Meta tags information
            - content: Extracted content (headings, links, paragraphs, images, sections)
            - structured_data: JSON-LD structured data if present
    """
    try:
        # Normalize URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Send HTTP GET request
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()

        # Get the raw HTML content
        html_content = response.text

        # Parse with BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')

        # Extract structured data
        portfolio_data = {
            "url": url,
            "title": soup.title.string if soup.title else "N/A",
            "meta": {},
            "content": {}
        }

        # Extract meta tags
        meta_tags = soup.find_all('meta')
        for meta in meta_tags:
            if meta.get('name'):
                portfolio_data["meta"][meta.get('name')] = meta.get('content', '')
            elif meta.get('property'):
                portfolio_data["meta"][meta.get('property')] = meta.get('content', '')

        # Extract headings
        headings = {
            "h1": [h.get_text(strip=True) for h in soup.find_all('h1')],
            "h2": [h.get_text(strip=True) for h in soup.find_all('h2')],
            "h3": [h.get_text(strip=True) for h in soup.find_all('h3')]
        }
        portfolio_data["content"]["headings"] = headings

        # Extract all links
        links = []
        for a in soup.find_all('a', href=True):
            links.append({
                "text": a.get_text(strip=True),
                "href": a['href']
            })
        portfolio_data["content"]["links"] = links

        # Extract paragraphs
        paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if p.get_text(strip=True)]
        portfolio_data["content"]["paragraphs"] = paragraphs[:20]  # First 20 paragraphs

        # Extract images
        images = []
        for img in soup.find_all('img'):
            images.append({
                "src": img.get('src', ''),
                "alt": img.get('alt', '')
            })
        portfolio_data["content"]["images"] = images

        # Look for common portfolio sections
        sections = []
        for section in soup.find_all(['section', 'div'], class_=True):
            section_class = ' '.join(section.get('class', []))
            if any(keyword in section_class.lower() for keyword in ['about', 'project', 'skill', 'contact', 'experience', 'portfolio', 'work', 'service']):
                sections.append({
                    "class": section_class,
                    "text": section.get_text(strip=True)[:300]  # First 300 chars
                })
        portfolio_data["content"]["sections"] = sections

        # Extract structured data (JSON-LD if present)
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        if json_ld_scripts:
            portfolio_data["structured_data"] = []
            for script in json_ld_scripts:
                try:
                    portfolio_data["structured_data"].append(json.loads(script.string))
                except:
                    pass

        return portfolio_data

    except requests.exceptions.RequestException as e:
        # Try with http:// if https:// fails
        if url.startswith('https://'):
            try:
                http_url = url.replace('https://', 'http://')
                return scrape_portfolio(http_url)
            except:
                raise Exception(f"Failed to fetch website: {e}")
        else:
            raise Exception(f"Failed to fetch website: {e}")
    except Exception as e:
        raise Exception(f"Error scraping portfolio: {str(e)}")


def analyze_portfolio(portfolio_url):
    """
    Scrape a portfolio website and get AI-powered recommendations for improvements.
    
    Args:
        portfolio_url (str): The portfolio URL to analyze
        
    Returns:
        dict: A dictionary containing:
            - portfolio_data: The scraped portfolio data
            - recommendations: AI-generated recommendations for improvements
    """
    try:
        # Scrape the portfolio
        portfolio_data = scrape_portfolio(portfolio_url)
        
        # Format portfolio data for AI analysis
        portfolio_context = f"""
Portfolio URL: {portfolio_data.get('url', 'N/A')}
Title: {portfolio_data.get('title', 'N/A')}

Meta Information:
{json.dumps(portfolio_data.get('meta', {}), indent=2)}

Headings:
- H1: {', '.join(portfolio_data.get('content', {}).get('headings', {}).get('h1', []))}
- H2: {', '.join(portfolio_data.get('content', {}).get('headings', {}).get('h2', []))}
- H3: {', '.join(portfolio_data.get('content', {}).get('headings', {}).get('h3', []))}

Key Paragraphs:
{chr(10).join(portfolio_data.get('content', {}).get('paragraphs', [])[:10])}

Sections Found:
{chr(10).join([f"- {s.get('class', 'N/A')}: {s.get('text', '')[:100]}" for s in portfolio_data.get('content', {}).get('sections', [])[:10]])}

Links Count: {len(portfolio_data.get('content', {}).get('links', []))}
Images Count: {len(portfolio_data.get('content', {}).get('images', []))}
"""
        
        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template(PORTFOLIO_ANALYSIS_PROMPT)
        prompt = prompt_template.format(portfolio_context=portfolio_context)

        # Use ChatOpenAI with JSON mode
        llm = ChatOpenAI(
            model_name="gpt-4o",
            temperature=0.3,
            streaming=False,
            max_tokens=2000,
            openai_api_key=os.environ.get('OPENAI_API_KEY'),
            model_kwargs={"response_format": {"type": "json_object"}}
        )

        # Generate response
        response = llm.invoke(prompt)

        # Parse JSON response
        try:
            recommendations = json.loads(response.content)
            
            return {
                "portfolio_data": portfolio_data,
                "recommendations": recommendations
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}, response content: {response.content}")
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            print(f"Error processing response: {e}")
            raise e

    except Exception as e:
        import traceback
        print(f"Error in analyze_portfolio: {str(e)}")
        print(traceback.format_exc())
        raise e

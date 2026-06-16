import os
import re
import json
import requests
import xml.etree.ElementTree as ET
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

CACHE_FILE = 'release_notes_cache.json'
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_text(html_str):
    """Remove HTML tags to get clean plain text for tweets."""
    # Replace common HTML structures with clean formatting
    text = html_str
    # Replace anchor tags with their text followed by href
    text = re.sub(r'<a href="([^"]+)">([^<]+)</a>', r'\2 (\1)', text)
    # Remove all other HTML tags
    text = re.sub(r'<[^<]+?>', '', text)
    # Collapse multiple whitespaces/newlines
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_release_notes():
    """Fetch and parse BigQuery Release notes Atom XML feed."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(FEED_URL, headers=headers, timeout=10)
        response.raise_for_status()
        xml_data = response.content
    except Exception as e:
        print(f"Error fetching feed: {e}")
        # Try loading cached version if fetch fails
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r') as f:
                return json.load(f), True # True means it is cached/stale data
        raise e

    # Parse XML Atom Feed
    root = ET.fromstring(xml_data)
    namespace = {'atom': 'http://www.w3.org/2005/Atom'}
    
    entries = root.findall('atom:entry', namespace)
    parsed_items = []
    
    # Counter for generating unique stable IDs
    item_idx = 0
    
    for entry in entries:
        title = entry.find('atom:title', namespace)
        title_text = title.text.strip() if title is not None else 'Unknown Date'
        
        updated = entry.find('atom:updated', namespace)
        updated_text = updated.text.strip() if updated is not None else ''
        
        link_elem = entry.find('atom:link', namespace)
        link_href = link_elem.attrib.get('href', '') if link_elem is not None else ''
        
        content_elem = entry.find('atom:content', namespace)
        content_html = content_elem.text if content_elem is not None else ''
        
        # Split single day entries by <h3> tags so each release note item is selectable
        parts = re.split(r'(<h3>.*?</h3>)', content_html, flags=re.DOTALL)
        
        # If no h3 tags are present, treat as a single update
        if len(parts) <= 1:
            clean_plain = clean_text(content_html)
            parsed_items.append({
                'id': f"note_{item_idx}",
                'date': title_text,
                'updated': updated_text,
                'link': link_href,
                'type': 'Update',
                'html': content_html,
                'text': clean_plain
            })
            item_idx += 1
            continue
            
        header = None
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            if part.startswith('<h3>') and part.endswith('</h3>'):
                # Extract header text (e.g., Feature, Changed, Resolved, Issue, Deprecation)
                header = re.sub(r'<[^<]+?>', '', part).strip()
            else:
                html_content = part
                # Reconstruct full HTML including the header for rendering
                full_html = f"<h3>{header}</h3>\n{html_content}" if header else html_content
                
                # Extract clean plain text from the paragraph description
                text_content = clean_text(html_content)
                
                parsed_items.append({
                    'id': f"note_{item_idx}",
                    'date': title_text,
                    'updated': updated_text,
                    'link': link_href,
                    'type': header if header else 'Update',
                    'html': full_html,
                    'text': text_content
                })
                item_idx += 1

    # Save to local cache file
    with open(CACHE_FILE, 'w') as f:
        json.dump(parsed_items, f, indent=2)
        
    return parsed_items, False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    
    # If not forcing refresh and cache exists, serve from cache
    if not force_refresh and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                cached_data = json.load(f)
                return jsonify({
                    'success': True,
                    'source': 'cache',
                    'data': cached_data
                })
        except Exception as e:
            print(f"Error reading cache: {e}")
            
    # Otherwise, fetch fresh data
    try:
        data, is_stale = parse_release_notes()
        return jsonify({
            'success': True,
            'source': 'cache_fallback' if is_stale else 'network',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)

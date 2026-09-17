#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Slides Skill Core - BM25 search engine for slide design tokens
Adapted from UI/UX Pro Max by @nicenguci
"""

import csv
import re
from pathlib import Path
from math import log
from collections import defaultdict

# ============ CONFIGURATION ============
DATA_DIR = Path(__file__).parent.parent / "tokens"
MAX_RESULTS = 3

CSV_CONFIG = {
    "aesthetic": {
        "file": "aesthetics.csv",
        "search_cols": ["name", "category", "vibe_keywords", "signature_effects"],
        "output_cols": ["id", "name", "category", "vibe_keywords", "compatible_palettes", "compatible_fonts", "compatible_layouts", "signature_effects", "is_dark", "energy_level"]
    },
    "palette": {
        "file": "color-palettes.csv",
        "search_cols": ["name", "vibe_keywords"],
        "output_cols": ["id", "name", "bg_primary", "bg_secondary", "text_primary", "text_secondary", "accent_1", "accent_2", "border_color", "glow_color", "is_dark", "wcag_contrast"]
    },
    "font": {
        "file": "font-pairings.csv",
        "search_cols": ["name", "vibe_keywords", "best_for", "display_font", "body_font"],
        "output_cols": ["id", "name", "display_font", "body_font", "font_source", "google_fonts_url", "css_import", "vibe_keywords", "best_for"]
    },
    "layout": {
        "file": "layout-patterns.csv",
        "search_cols": ["name", "best_for", "description"],
        "output_cols": ["id", "name", "css_grid_template", "content_areas", "best_for", "max_content_per_slide", "description"]
    },
    "effect": {
        "file": "effects-library.csv",
        "search_cols": ["name", "category", "best_with_aesthetics", "description"],
        "output_cols": ["id", "name", "category", "css_code_snippet", "js_required", "performance_impact", "best_with_aesthetics", "description"]
    }
}


# ============ BM25 IMPLEMENTATION ============
class BM25:
    """BM25 ranking algorithm for text search"""

    def __init__(self, k1=1.5, b=0.75):
        self.k1 = k1
        self.b = b
        self.corpus = []
        self.doc_lengths = []
        self.avgdl = 0
        self.idf = {}
        self.doc_freqs = defaultdict(int)
        self.N = 0

    def tokenize(self, text):
        """Lowercase, split, remove punctuation, filter short words"""
        text = re.sub(r'[^\w\s]', ' ', str(text).lower())
        return [w for w in text.split() if len(w) > 2]

    def fit(self, documents):
        """Build BM25 index from documents"""
        self.corpus = [self.tokenize(doc) for doc in documents]
        self.N = len(self.corpus)
        if self.N == 0:
            return
        self.doc_lengths = [len(doc) for doc in self.corpus]
        self.avgdl = sum(self.doc_lengths) / self.N

        for doc in self.corpus:
            seen = set()
            for word in doc:
                if word not in seen:
                    self.doc_freqs[word] += 1
                    seen.add(word)

        for word, freq in self.doc_freqs.items():
            self.idf[word] = log((self.N - freq + 0.5) / (freq + 0.5) + 1)

    def score(self, query):
        """Score all documents against query"""
        query_tokens = self.tokenize(query)
        scores = []

        for idx, doc in enumerate(self.corpus):
            score = 0
            doc_len = self.doc_lengths[idx]
            term_freqs = defaultdict(int)
            for word in doc:
                term_freqs[word] += 1

            for token in query_tokens:
                if token in self.idf:
                    tf = term_freqs[token]
                    idf = self.idf[token]
                    numerator = tf * (self.k1 + 1)
                    denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
                    score += idf * numerator / denominator

            scores.append((idx, score))

        return sorted(scores, key=lambda x: x[1], reverse=True)


# ============ SEARCH FUNCTIONS ============
def _load_csv(filepath):
    """Load CSV/TSV and return list of dicts. Auto-detects delimiter."""
    with open(filepath, 'r', encoding='utf-8') as f:
        sample = f.read(2048)
        f.seek(0)
        # Auto-detect: if tabs found in header line, use TSV
        first_line = sample.split('\n')[0]
        delimiter = '\t' if '\t' in first_line else ','
        return list(csv.DictReader(f, delimiter=delimiter))


def _search_csv(filepath, search_cols, output_cols, query, max_results):
    """Core search function using BM25"""
    if not filepath.exists():
        return []

    data = _load_csv(filepath)
    documents = [" ".join(str(row.get(col, "")) for col in search_cols) for row in data]

    bm25 = BM25()
    bm25.fit(documents)
    ranked = bm25.score(query)

    results = []
    for idx, score in ranked[:max_results]:
        if score > 0:
            row = data[idx]
            results.append({col: row.get(col, "") for col in output_cols if col in row})

    return results


def detect_domain(query):
    """Auto-detect the most relevant domain from query"""
    query_lower = query.lower()

    domain_keywords = {
        "aesthetic": ["style", "aesthetic", "theme", "vibe", "look", "feel", "design",
                      "corporate", "creative", "tech", "educational", "sales", "specialty",
                      "minimalism", "brutalist", "cyber", "retro", "japandi", "modern",
                      "futuristic", "elegant", "playful", "professional", "bold"],
        "palette": ["color", "palette", "hex", "rgb", "dark", "light", "accent",
                    "background", "contrast", "warm", "cool", "neon", "pastel", "mono"],
        "font": ["font", "typography", "heading", "serif", "sans", "monospace",
                 "display", "body", "pairing", "typeface", "google fonts", "fontshare"],
        "layout": ["layout", "grid", "split", "centered", "dashboard", "panel",
                   "column", "stack", "editorial", "hero"],
        "effect": ["effect", "animation", "particle", "glow", "glass", "neon",
                   "gradient", "blur", "tilt", "hover", "parallax", "entrance",
                   "transition", "motion", "aurora", "holographic"]
    }

    scores = {domain: sum(1 for kw in keywords if kw in query_lower)
              for domain, keywords in domain_keywords.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "aesthetic"


def search(query, domain=None, max_results=MAX_RESULTS):
    """Main search function with auto-domain detection"""
    if domain is None:
        domain = detect_domain(query)

    config = CSV_CONFIG.get(domain, CSV_CONFIG["aesthetic"])
    filepath = DATA_DIR / config["file"]

    if not filepath.exists():
        return {"error": f"File not found: {filepath}", "domain": domain}

    results = _search_csv(filepath, config["search_cols"], config["output_cols"], query, max_results)

    return {
        "domain": domain,
        "query": query,
        "file": config["file"],
        "count": len(results),
        "results": results
    }


def get_by_id(domain, item_id):
    """Get a specific item by its ID — used for direct lookups"""
    config = CSV_CONFIG.get(domain)
    if not config:
        return {"error": f"Unknown domain: {domain}"}

    filepath = DATA_DIR / config["file"]
    if not filepath.exists():
        return {"error": f"File not found: {filepath}"}

    data = _load_csv(filepath)
    for row in data:
        if row.get("id", "").strip() == item_id.strip():
            return {col: row.get(col, "") for col in config["output_cols"] if col in row}

    return {"error": f"ID '{item_id}' not found in {domain}"}


def get_compatible(aesthetic_id):
    """Given an aesthetic ID, return its compatible palettes, fonts, layouts, and effects"""
    aesthetic = get_by_id("aesthetic", aesthetic_id)
    if "error" in aesthetic:
        return aesthetic

    result = {"aesthetic": aesthetic, "palettes": [], "fonts": [], "layouts": [], "effects": []}

    # Fetch compatible palettes
    palette_ids = [p.strip() for p in aesthetic.get("compatible_palettes", "").split(",")]
    for pid in palette_ids:
        p = get_by_id("palette", pid)
        if "error" not in p:
            result["palettes"].append(p)

    # Fetch compatible fonts
    font_ids = [f.strip() for f in aesthetic.get("compatible_fonts", "").split(",")]
    for fid in font_ids:
        f = get_by_id("font", fid)
        if "error" not in f:
            result["fonts"].append(f)

    # Fetch compatible layouts
    layout_ids = [l.strip() for l in aesthetic.get("compatible_layouts", "").split(",")]
    for lid in layout_ids:
        l = get_by_id("layout", lid)
        if "error" not in l:
            result["layouts"].append(l)

    # Fetch signature effects
    effect_ids = [e.strip() for e in aesthetic.get("signature_effects", "").split(",")]
    for eid in effect_ids:
        e = get_by_id("effect", eid)
        if "error" not in e:
            result["effects"].append(e)

    return result

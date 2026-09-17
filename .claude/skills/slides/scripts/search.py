#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Slides Skill Search - CLI for searching slide design tokens
Usage:
  python search.py "<query>" [--domain <domain>] [-n <max_results>]
  python search.py --get <domain> <id>
  python search.py --compatible <aesthetic_id>

Domains: aesthetic, palette, font, layout, effect
"""

import argparse
import json
import sys
from pathlib import Path

# Add parent dir to path so core.py can be imported
sys.path.insert(0, str(Path(__file__).parent))
from core import CSV_CONFIG, MAX_RESULTS, search, get_by_id, get_compatible


def format_output(result):
    """Format results for Claude consumption (token-optimized)"""
    if "error" in result:
        return f"Error: {result['error']}"

    output = []
    output.append(f"## Slides Token Search")
    output.append(f"**Domain:** {result['domain']} | **Query:** {result['query']}")
    output.append(f"**Source:** {result['file']} | **Found:** {result['count']} results\n")

    for i, row in enumerate(result['results'], 1):
        output.append(f"### Result {i}")
        for key, value in row.items():
            value_str = str(value)
            if len(value_str) > 500:
                value_str = value_str[:500] + "..."
            output.append(f"- **{key}:** {value_str}")
        output.append("")

    return "\n".join(output)


def format_compatible(result):
    """Format compatible tokens for an aesthetic"""
    if "error" in result:
        return f"Error: {result['error']}"

    output = []
    a = result["aesthetic"]
    output.append(f"## Design System for: {a.get('name', 'Unknown')}")
    output.append(f"**Category:** {a.get('category')} | **Vibe:** {a.get('vibe_keywords')}")
    output.append(f"**Dark mode:** {a.get('is_dark')} | **Energy:** {a.get('energy_level')}\n")

    if result["palettes"]:
        output.append("### Color Palettes")
        for p in result["palettes"]:
            output.append(f"- **{p.get('name')}**: bg={p.get('bg_primary')} accent1={p.get('accent_1')} accent2={p.get('accent_2')}")
        output.append("")

    if result["fonts"]:
        output.append("### Font Pairings")
        for f in result["fonts"]:
            output.append(f"- **{f.get('name')}**: {f.get('display_font')} + {f.get('body_font')} ({f.get('font_source')})")
            if f.get("css_import"):
                output.append(f"  CSS: `{f.get('css_import')[:120]}...`")
        output.append("")

    if result["layouts"]:
        output.append("### Layouts")
        for l in result["layouts"]:
            output.append(f"- **{l.get('name')}**: {l.get('description', '')[:100]}")
        output.append("")

    if result["effects"]:
        output.append("### Signature Effects")
        for e in result["effects"]:
            output.append(f"- **{e.get('name')}** ({e.get('category')}): {e.get('description', '')[:100]}")
        output.append("")

    return "\n".join(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Slides Token Search")
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--domain", "-d", choices=list(CSV_CONFIG.keys()), help="Search domain")
    parser.add_argument("--max-results", "-n", type=int, default=MAX_RESULTS, help="Max results (default: 3)")
    parser.add_argument("--get", nargs=2, metavar=("DOMAIN", "ID"), help="Get item by domain and ID")
    parser.add_argument("--compatible", "-c", metavar="AESTHETIC_ID", help="Get all compatible tokens for an aesthetic")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    # Mode: get compatible design system
    if args.compatible:
        result = get_compatible(args.compatible)
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(format_compatible(result))

    # Mode: get by ID
    elif args.get:
        domain, item_id = args.get
        result = get_by_id(domain, item_id)
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                for key, value in result.items():
                    print(f"- **{key}:** {value}")

    # Mode: search
    elif args.query:
        result = search(args.query, args.domain, args.max_results)
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(format_output(result))

    else:
        parser.print_help()

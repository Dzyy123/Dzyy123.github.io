#!/usr/bin/env python3
"""
Fetch publications from Semantic Scholar API and generate Jekyll markdown files
for the academicpages template.

Designed to run in GitHub Actions on a weekly schedule.

The script is conservative: it only adds a paper if at least one co-author
matches a *known* co-author of the user. This avoids confusing different
researchers who happen to share the name "Ziyi Ding".
"""

import json
import os
import re
import time
import urllib.request
import urllib.error
from pathlib import Path

# ─── Configuration ─────────────────────────────────────────────────────────
AUTHOR_NAME = "Ziyi Ding"

# Known seed papers (arXiv IDs of papers we are sure are by this author).
SEED_ARXIV_IDS = [
    "2601.10137",  # Tree-Query / Step-by-Step Causality
    "2512.03428",  # GaussDetect-LiNGAM
]

# Self-name variants used for matching the user in author lists.
SELF_NAME_VARIANTS = {"Ziyi Ding", "Z. Ding", "Z Ding"}

# Known collaborators. A new paper is accepted only if it shares at least
# one author with this set OR if it is one of the seed papers.
KNOWN_COAUTHORS = {
    "Ziyi Ding", "Z. Ding", "Z Ding",
    "Xiao-Ping Zhang", "X.-P. Zhang", "Xiao Ping Zhang",
    "Chenfei Ye-Hao", "Ye-Hao Chen", "Chenfei Ye Hao",
    "Zheyuan Wang",
}

PUBLICATIONS_DIR = Path(__file__).resolve().parent.parent / "_publications"

S2_API = "https://api.semanticscholar.org/graph/v1"
PAPER_FIELDS = (
    "title,authors,year,venue,externalIds,abstract,url,"
    "citationCount,publicationDate"
)
AUTHOR_PAPER_FIELDS = (
    "papers.title,papers.year,papers.venue,papers.authors,"
    "papers.externalIds,papers.abstract,papers.url,"
    "papers.citationCount,papers.publicationDate"
)

REQUEST_DELAY_SEC = 2.0


def api_get(url, retries=4):
    """GET request with exponential backoff for rate-limit (429)."""
    for attempt in range(retries):
        try:
            time.sleep(REQUEST_DELAY_SEC)
            req = urllib.request.Request(
                url, headers={"User-Agent": "AcademicHomepage/2.0 (contact: github)"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = min(30 * (attempt + 1), 180)
                print(f"  Rate limited, waiting {wait}s (attempt {attempt+1}/{retries})...")
                time.sleep(wait)
            elif e.code == 404:
                print(f"  Not found: {url}")
                return None
            else:
                print(f"  HTTP {e.code}: {e.reason}")
                if attempt == retries - 1:
                    raise
        except Exception as e:
            print(f"  Request error: {e}")
            if attempt == retries - 1:
                raise
    return None


def find_author_id():
    """Find Semantic Scholar author ID using a seed paper."""
    print("Resolving author ID via seed papers...")
    for arxiv_id in SEED_ARXIV_IDS:
        url = f"{S2_API}/paper/ArXiv:{arxiv_id}?fields=authors"
        data = api_get(url)
        if not data or "authors" not in data:
            continue
        for author in data["authors"]:
            if author.get("name") in SELF_NAME_VARIANTS:
                aid = author.get("authorId")
                if aid:
                    print(f"  Author ID: {aid} (from arXiv:{arxiv_id})")
                    return aid
    return None


def fetch_papers_by_author(author_id):
    """Return all papers of a Semantic Scholar author."""
    print(f"Fetching papers for author {author_id}...")
    url = f"{S2_API}/author/{author_id}?fields={AUTHOR_PAPER_FIELDS}"
    data = api_get(url)
    if not data or "papers" not in data:
        return []
    papers = data["papers"]
    print(f"  Retrieved {len(papers)} papers")
    return papers


def fetch_paper_by_arxiv(arxiv_id):
    """Fetch a single paper by arXiv ID."""
    url = f"{S2_API}/paper/ArXiv:{arxiv_id}?fields={PAPER_FIELDS}"
    return api_get(url)


def is_likely_self_paper(paper):
    """A paper is considered ours if it has Ziyi Ding AND at least one known
    collaborator (or is one of the seed papers)."""
    authors = paper.get("authors") or []
    names = {a.get("name", "") for a in authors}

    if not (names & SELF_NAME_VARIANTS):
        return False

    arxiv_id = (paper.get("externalIds") or {}).get("ArXiv")
    if arxiv_id and arxiv_id in SEED_ARXIV_IDS:
        return True

    other_known = (names & KNOWN_COAUTHORS) - SELF_NAME_VARIANTS
    return bool(other_known)


def sanitize_filename(title):
    s = title.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    return s[:60]


def get_arxiv_id(paper):
    return (paper.get("externalIds") or {}).get("ArXiv")


def format_authors_citation(authors):
    return ", ".join(a.get("name", "Unknown") for a in authors)


def generate_markdown(paper):
    """Generate an academicpages-format publication markdown."""
    title = paper.get("title", "Untitled").replace('"', "'")
    year = paper.get("year")
    pub_date = paper.get("publicationDate")
    if not pub_date:
        if year:
            pub_date = f"{year}-01-01"
        else:
            return None
    if not year:
        year = int(pub_date[:4])

    venue = paper.get("venue") or "arXiv preprint"
    if not venue.strip():
        venue = "arXiv preprint"

    abstract = (paper.get("abstract") or "").replace("\n", " ").strip()
    if len(abstract) > 400:
        abstract = abstract[:397] + "..."
    abstract = abstract.replace("'", "\\'")

    authors = paper.get("authors", [])
    arxiv_id = get_arxiv_id(paper)
    paper_url = (
        f"https://arxiv.org/abs/{arxiv_id}" if arxiv_id else paper.get("url", "")
    )

    citation_authors = format_authors_citation(authors)
    citation = (
        f'{citation_authors}. ({year}). &quot;{title}.&quot; '
        f'<i>{venue}</i>.'
    )

    slug = sanitize_filename(title)
    filename = f"{pub_date}-{slug}.md"

    md = f'''---
title: "{title}"
collection: publications
category: manuscripts
permalink: /publication/{pub_date}-{slug}
excerpt: '{abstract or "(abstract unavailable)"}'
date: {pub_date}
venue: '{venue}'
paperurl: '{paper_url}'
citation: '{citation}'
---

**Authors:** {citation_authors}

{abstract or "_Abstract not yet available._"}

{f"[arXiv:{arxiv_id}]({paper_url}){{: .btn .btn--primary}}" if arxiv_id else f"[Paper]({paper_url}){{: .btn .btn--primary}}" if paper_url else ""}
'''
    return filename, md


def normalize_title(s):
    """Lower-case + strip non-alphanumeric for fuzzy comparison."""
    return re.sub(r'[^a-z0-9]+', '', s.lower())


def get_existing_keys():
    """Return (titles, arxiv_ids, paperurls) of existing publications,
    used for dedup so that hand-curated entries are not re-added by S2."""
    titles, arxiv_ids, paperurls = set(), set(), set()
    if not PUBLICATIONS_DIR.exists():
        return titles, arxiv_ids, paperurls
    for md_file in PUBLICATIONS_DIR.glob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        m = re.search(r'^title:\s*"(.+)"', content, re.MULTILINE)
        if m:
            titles.add(normalize_title(m.group(1)))
        for url_match in re.finditer(r"arxiv\.org/abs/([\d\.v]+)", content, re.IGNORECASE):
            arxiv_ids.add(url_match.group(1).split("v")[0])
        purl = re.search(r"^paperurl:\s*['\"]?(.+?)['\"]?\s*$", content, re.MULTILINE)
        if purl:
            paperurls.add(purl.group(1).strip())
    return titles, arxiv_ids, paperurls


def main():
    print("=" * 64)
    print("Academic Homepage — Publication Auto-Updater (academicpages)")
    print("=" * 64)

    PUBLICATIONS_DIR.mkdir(parents=True, exist_ok=True)
    existing_titles, existing_arxiv, existing_urls = get_existing_keys()
    print(f"Existing publications: {len(existing_titles)} "
          f"(arxiv ids tracked: {len(existing_arxiv)})")

    candidate_papers = []

    author_id = find_author_id()
    if author_id:
        candidate_papers.extend(fetch_papers_by_author(author_id))

    print("Adding seed papers (with full fields)...")
    for arxiv_id in SEED_ARXIV_IDS:
        p = fetch_paper_by_arxiv(arxiv_id)
        if p:
            candidate_papers.append(p)

    seen_keys = set()
    deduped = []
    for p in candidate_papers:
        ext = p.get("externalIds") or {}
        key = ext.get("ArXiv") or ext.get("DOI") or ext.get("CorpusId") or p.get("title")
        if not key or key in seen_keys:
            continue
        seen_keys.add(key)
        deduped.append(p)

    print(f"Unique candidate papers: {len(deduped)}")

    added = 0
    skipped_not_self = 0
    skipped_exists = 0
    for paper in deduped:
        title = paper.get("title", "")
        if not title:
            continue

        if not is_likely_self_paper(paper):
            print(f"  Skip (author mismatch): {title[:70]}")
            skipped_not_self += 1
            continue

        arxiv_id = get_arxiv_id(paper)
        norm_title = normalize_title(title)

        if norm_title in existing_titles or (arxiv_id and arxiv_id in existing_arxiv):
            print(f"  Skip (exists):         {title[:70]}")
            skipped_exists += 1
            continue

        result = generate_markdown(paper)
        if result is None:
            continue
        filename, md = result
        (PUBLICATIONS_DIR / filename).write_text(md, encoding="utf-8")
        print(f"  Added:                 {filename}")
        existing_titles.add(norm_title)
        if arxiv_id:
            existing_arxiv.add(arxiv_id)
        added += 1

    print("")
    print(f"Summary: added={added}, skipped_exists={skipped_exists}, "
          f"skipped_other_author={skipped_not_self}")


if __name__ == "__main__":
    main()

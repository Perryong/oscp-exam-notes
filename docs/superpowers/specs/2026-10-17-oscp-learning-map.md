# OSCP learning workspace and Mindmap

## Intent
Make the existing OSCP workspace easier to understand and navigate. Preserve full imported notes, commands, source credits, screenshots, existing URLs, personal notes and machine progress. Add beginner-friendly conceptual guidance and an Obsidian-inspired Mindmap connecting all available OSCP content. Scope is OSCP; OSAI remains a separate workspace.

## Design
A guided topic map is the default, with an optional full graph. The shared taxonomy has 11 learning topics: foundations, enumeration, web, initial access, credentials, file transfers, Linux privilege escalation, Windows privilege escalation, Active Directory, pivoting, and reporting. Each topic explains the concept, why it matters, what to know first, what to look for, a small learning exercise and common misunderstandings. This is a study sequence, not a claim about current exam requirements.

A new `/mindmap` sidebar entry shows the topic overview, then lets the reader focus a topic or resource. Search and type filters locate content; a details panel explains connections, links directly to the source page and lists backlinks. Pan, zoom, reset and keyboard-accessible alternatives support exploration. Full graph includes every indexed resource; labels are limited for readability. Guided view focuses immediate connections; the resource list still exposes all results.

The OSCP Study plan becomes a learning home with the recommended topic sequence, quick reference entry points and existing weekly practice plan. `/topics` provides the public conceptual guide and relevant full notes, cheat sections, walkthroughs and private notes. Existing tag-based personal topic browsing remains reachable at `/notes?view=tags`. Reference pages and personal readers get a contextual route into the Mindmap. Cheat sheet links open the exact collection/section via URL parameters; weekly plan and machine links use existing anchors.

## Data and relationships
Generate a compact static metadata index from existing source catalogs: 281 walkthrough entries, 167 Hacker-DOCS source notes, 12 introductory guides, both cheat collections, original practice weeks and unique seeded machines. Preserve category/collection membership for every entry, including resources without a clear topic. The build regenerates this index from source, so future imports are included.

Topics have curated prerequisite connections. Explicit tag matches and conservative title/path metadata matches associate resources with topics, with labels explaining the association. Do not imply an unverified machine solution or prerequisite. Unmatched resources remain reachable via their source collection. In the browser, add only the current account's non-deleted OSCP notes and machines. Add explicit note-to-machine and local note links as relationships. Private data never enters the generated public index. No Firestore schema or rules changes; no new dependencies.

## Verification
Test topic prerequisite validity, full catalog coverage, unique IDs, valid edge endpoints, unmatched-resource discovery, workspace/deleted-note isolation and explicit note backlinks. Test guided/full view, search/filter, resource navigation and URL deep links. Run full tests and production build, then verify deployed behavior in Chrome, including update notification, readable screenshot and original reference preservation.

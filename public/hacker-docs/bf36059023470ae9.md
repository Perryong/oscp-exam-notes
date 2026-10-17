
## Crawling

- Also called spidering.
- It is the automated process of systematically browsing the World Wide Web.
- A web crawler crawls or follows the links and reads all the content, media and everything and uses predefined algorithms to store and index web pages, making them accessible to search engines.

### Types of Crawling

- Breadth First Crawling
- Depth First Crawling

---
## Questions and Solutions

- After spidering inlanefreight.com, identify the location where future reports will be stored. Respond with the full domain, e.g., files.inlanefreight.com.
	- **inlanefreight-comp133.s3.amazonaws.htb**


Run the ReconSpider.py and mention the protocol like `http` or else the ReconSpider.py will not work.

```bash
python3 ReconSpider.py http://inlanefreight.com
```

Since results are stored in `results.json` file. Read this file using `cat results.json` command to get the answer for the question.
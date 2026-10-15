import { test, expect } from "vitest";
import {
  convertArticle,
  articleId,
} from "../../scripts/import-walkthroughs.mjs";
test("formats steps, tables, commands and GitBook images with pinned URLs", () => {
  const result = convertArticle(
    '# Demo\n\n### Task 1 - Recon\n\n```bash\nprintf "hello"\n\tsudo -l\n```\n\n<figure><img src="../.gitbook/assets/shot%20one.png"><figcaption>Evidence</figcaption></figure>\n\n| Port | Service |\n| --- | --- |\n| 22 | SSH |\n\n[Next](active.md)',
    "hackthebox/demo.md",
    new Set(["hackthebox/active.md"]),
  );
  expect(result.title).toBe("Demo");
  expect(result.toc[0].title).toBe("Task 1 - Recon");
  expect(result.html).toContain("<table>");
  expect(result.html).toContain("sudo -l");
  expect(result.html).toContain(
    "/dd03effbc624dbb8789fbd7775369769cec81a36/.gitbook/assets/shot%20one.png",
  );
  expect(result.html).toContain("Evidence");
  expect(result.html).toContain("/walkthroughs/hackthebox--active");
});
test("removes executable content, unsafe URLs and untrusted HTML attributes", () => {
  const { html } = convertArticle(
    '# Safe\n<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)"><a href="javascript:alert(3)">text</a><iframe src="https://evil.test"></iframe><input autofocus><p style="position:fixed" onclick="bad()">Keep</p>',
    "thm/safe.md",
    new Set(),
  );
  expect(html).not.toMatch(
    /<script|onerror|onclick|javascript:|<iframe|autofocus|position:fixed/,
  );
  expect(html).toContain("Keep");
});
test("stable headings support duplicate titles and GitBook anchors", () => {
  const { html, toc } = convertArticle(
    '# Demo\n\n## Scan {#scan}\n\n## Scan\n\n{% hint style="info" %}\nKeep this hint.\n{% endhint %}\n',
    "thm/demo.md",
    new Set(),
  );
  expect(new Set(toc.map((h: any) => h.id)).size).toBe(2);
  expect(html).not.toContain("{%");
  expect(html).toContain("Keep this hint.");
  expect(articleId("thm/foo/README.md")).toBe("thm--foo--readme");
});
test("GitBook attachments, reference cards and tab labels remain usable", () => {
  const { html } = convertArticle(
    '# Demo\n\n{% content-ref url="https://example.com/guide" %}\nGuide\n{% endcontent-ref %}\n\n{% file src="../.gitbook/assets/demo.webm" %}\n\n{% tabs %}\n{% tab title="Linux" %}\nCommands\n{% endtab %}\n{% endtabs %}',
    "thm/demo.md",
    new Set(),
  );
  expect(html).not.toContain("{%");
  expect(html).toContain("https://example.com/guide");
  expect(html).toContain("demo.webm");
  expect(html).toContain("Linux");
});

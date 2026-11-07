## Reflected XSS

- Non Persistent XSS i.e. vulnerability is temporary and it doesn't persist through page refreshes or if we move pages.
- Reflected XSS gets processed by the backend server.
- Only affects the targeted user and will not affect any other user visiting the page.
- Occurs when input reaches backend server and gets returned to us without being filtered or sanitized. If we move from one page to another, Reflected XSS payloads will not work since they are not persistent.

## How to Target if Non Persistent

- Depends which HTTP request is used to send our input to server.
- Go to Dev tools -> Network tab -> Check URL.
- Copy the URL and add the payload using `<script>` tag.
- Since non persistent so moving from one page to another should remove the payload and not execute it once again.

---
## Questions and Solutions

- To get the flag, use the same payload we used above, but change its JavaScript code to show the cookie instead of showing the url.
	- **HTB{redacted}**



Went to the target URL and gave a task as input which was not added as the todo application says. I analyzed the GET request of this task adding using the Devtools -> Network tab. We can see the URL with the parameter required for this.

![Image1](./Images/Img1.png)

We can now copy the URL making the adding task and modify it so that we can add our XSS payload. I added this payload `http://94.237.120.119:39128/index.php?task=<script>console.log(document.cookie);</script>` to get the cookie value and get our flag. After entering the link go to the Console tab in the DevTools. You will also notice our task is showing `''` that's because our task is inside the `<script>` tag.

![Image2](./Images/Img2.png)

The URL looks different is because of URL encoding done by the web browser but we get our flag value.
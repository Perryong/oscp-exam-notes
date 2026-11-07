
## Questions and Solutions

- Determine the Apache version running on app.inlanefreight.local on the target system. (Format: 0.0.0)
	- **2.4.41**

Add the IP addresses with their respective vhosts in the `/etc/hosts` file.

```bash
curl -I app.inlanefreight.local
```


- Which CMS is used on app.inlanefreight.local on the target system? Respond with the name only, e.g., WordPress.
	- **Joomla**

Run the below command.

```bash
nikto -h app.inlanefreight.local -Tuning b
```

You will find `robots.txt` so go to `app.inlanefreight.local` and there you will get an idea where to proceed. Go to the `app.inlanefreight.local/administrator` from there to get the CMS.


- On which operating system is the dev.inlanefreight.local webserver running in the target system? Respond with the name only, e.g., Debian.
	- **Ubuntu**


```bash
curl -I dev.inlanefreight.local
```



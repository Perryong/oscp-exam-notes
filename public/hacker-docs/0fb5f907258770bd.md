## Banner Grabbing

```bash
curl -I <domain_name/IP>
```

- Reveals server info and other stuff.

**OR**

```
nikto -h <domain_name/IP> -Tuning b
```

- Reveals other hidden directories and information like `robots.txt`.

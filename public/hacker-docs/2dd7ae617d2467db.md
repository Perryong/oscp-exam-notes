
## Scan TOP 10 TCP ports

- `--top-ports=10` scans top 10 TCP ports.
- `-sV` performs service scan.

```bash
sudo nmap <IP> --top-ports=10
```


## Scan UDP ports

- `-F` scans TOP 100 UDP ports.
- `-sU` scans UDP ports.

```bash
sudo nmap <IP> -F -sU
```


## SYN or Stealth Scan

- Performs stealth or `SYN` scan.
- `nmap` by default performs stealth scan by default. This scan can be performed using `-sS`.
- Scans top TCP 1000 ports.

```bash
sudo nmap <IP>
```

## Run Default Scripts

- Runs `nmap` default scripts present in `nmap`engine.
- Check the default scripts present in `nmap` using the `nmap --script-help default`.

```bash
sudo nmap -sC <IP>
```


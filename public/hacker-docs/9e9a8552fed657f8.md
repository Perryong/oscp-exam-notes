
## Scan Port Services

- `-p-` helps scan all ports present.
- `-sV` performs port service scan. This includes the services running behind those ports and their versions.
- We can use `-v` option. Maximum 3 times like `-vvv` to increase verbosity level. Verbosity helps us see what is `nmap` doing in real time while the scan is running.

```bash
sudo nmap -sV <IP>
```






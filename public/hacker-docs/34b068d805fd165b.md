
- Our client wants to know if we can identify which operating system their provided machine is running on. Submit the OS name as the answer.
	- **Ubuntu**

```bash
$ sudo nmap -T4 -sV -O -D RND:5 10.129.208.232 -vvv
```

| `-T4`  | Increase aggressive of scans                              |
| ------ | --------------------------------------------------------- |
| `-O`   | **Scans for OS detection**                                |
| `-sV`  | **Performs service version scan**                         |
| `-vvv` | **verbosity, adding more information of what's going on** |
| `-D`   | **Decoy scan**                                            |
| `RND`  | **Random scans generated from specified number of IPs**   |






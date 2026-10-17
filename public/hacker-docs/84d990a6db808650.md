
## Wireshark Usage

| Wireshark filter                                  | Description                                                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ip.addr == 56.48.210.13`                         | Filters packets with a specific IP address                                                                                                                                           |
| `tcp.port == 80`                                  | Filters packets by port (HTTP in this case).                                                                                                                                         |
| `http`                                            | Filters for HTTP traffic.                                                                                                                                                            |
| `dns`                                             | Filters DNS traffic, which is useful to monitor domain name resolution.                                                                                                              |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0`        | Filters SYN packets (used in TCP handshakes), useful for detecting scanning or connection attempts.                                                                                  |
| `icmp`                                            | Filters ICMP packets (used for Ping), which can be useful for reconnaissance or network issues.                                                                                      |
| `http.request.method == "POST"`                   | Filters for HTTP POST requests. In the case that POST requests are sent over unencrypted HTTP, it may be the case that passwords or other sensitive information is contained within. |
| `tcp.stream eq 53`                                | Filters for a specific TCP stream. Helps track a conversation between two hosts.                                                                                                     |
| `eth.addr == 00:11:22:33:44:55`                   | Filters packets from/to a specific MAC address.                                                                                                                                      |
| `ip.src == 192.168.24.3 && ip.dst == 56.48.210.3` | Filters traffic between two specific IP addresses. Helps track communication between specific hosts.                                                                                 |

## Pcredz

- `git clone` [Pcredz]([https://github.com/lgandx/PCredz?tab=readme-ov-file#install](https://github.com/lgandx/PCredz.git))
- **SETUP** : `sudo apt-get install python3-pip libpcap-dev`  and `pip3 install pcapy-ng`.
- Supports extracting the following information:
	- Credit card numbers
	- POP credentials
	- SMTP credentials
	- IMAP credentials
	- SNMP community strings
	- FTP credentials
	- Credentials from HTTP NTLM/Basic headers, as well as HTTP Forms
	- NTLMv1/v2 hashes from various traffic including DCE-RPC, SMBv1/2, LDAP, MSSQL, and HTTP
	- Kerberos (AS-REQ Pre-Auth etype 23) hashes

```bash
./Pcredz -f <file_name> -t -v
```


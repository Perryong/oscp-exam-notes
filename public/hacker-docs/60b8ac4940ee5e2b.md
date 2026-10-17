
- Now our client wants to know if it is possible to find out the version of the running services. Identify the version of service our client was talking about and submit the flag as the answer.
	- **HTB{redacted}**


```bash
$ sudo nmap -sS -sV -Pn -n --disable-arp-ping --source-port 53 10.129.20.26 -vvv
```

| `-sS`               | TCP Stealth Scan                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-sV`               | **Performs service version scan**                                                                                                                 |
| `-Pn`               | **Disables host alive/not alive checking i.e.. omitting host is online**                                                                          |
| `-n`                | **Disable DNS resolution**                                                                                                                        |
| `-disable-arp-ping` | **Disabling ARP ping prevents a device from using the Address Resolution Protocol (ARP) to discover MAC addresses of hosts on the local network** |
| `--source-port`     | **Nmap requests generated show from a specified port(faking/spoofing)**                                                                           |
| `-vvv`              | **verbosity, adding more information of what's going on**                                                                                         |

The firewall accepts requests generated from source port 53 because `port 53` is primarily used for the **Domain Name System (DNS)**, which translates human-readable domain names into IP addresses so firewall might allow it.

### `--source-port` SIGNIFICANCE

- In Nmap, the source port specifies the port number from which Nmap sends its scanning packets. This can be useful for firewall evasion or testing specific firewall rules. Nmap will then send packets from the specified source port when possible, making it a tool for network scanning and security testing.

### `ncat`

Once `nmap` identifies that port `50000` is open on `10.129.20.26`, you use `ncat` to connect to it as a client. This allows you to manually send commands to the service or see its raw, unfiltered banner and responses.

```shell
$ sudo ncat -nv --source-port 53 10.129.20.26 50000
```

|`-n`|**Disable DNS resolution**|
|---|---|
|`10.129.20.26`|**Target IP address**|
|`--source-port`|**Nmap requests generated show from a specified port(faking/spoofing)**|
|`-v`|**verbosity, adding more information of what's going on**|
|`50000`|**Target Port Number**|
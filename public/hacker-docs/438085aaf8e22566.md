
## Footprinting the Service

```bash
sudo nmap <TARGET IP> -sC -sV -p25
```

## Connect to SMTP Server

```bash
telnet <TARGET IP> 25
```

## Enumerate SMTP Users

- Use the VRFY method (`-M VRFY`) to check each individual users in the **user wordlist** on the target server.
- `-w` is for query timeout given to the server before moving to a new user in the **user wordlist**

```bash
smtp-user-enum -M VRFY -U <user wordlist> -t <TARGET IP> -w <query timeout> -v
```

## SMTP Server Commands

| **Command**  | **Description**                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `AUTH PLAIN` | AUTH is a service extension used to authenticate the client.                                     |
| `HELO`       | The client logs in with its computer name and thus starts the session.                           |
| `MAIL FROM`  | The client names the email sender.                                                               |
| `RCPT TO`    | The client names the email recipient.                                                            |
| `DATA`       | The client initiates the transmission of the email.                                              |
| `RSET`       | The client aborts the initiated transmission but keeps the connection between client and server. |
| `VRFY`       | The client checks if a mailbox is available for message transfer.                                |
| `EXPN`       | The client also checks if a mailbox is available for messaging with this command.                |
| `NOOP`       | The client requests a response from the server to prevent disconnection due to time-out.         |
| `QUIT`       | The client terminates the session.                                                               |

## End Mail Body

- First authenticate yourself to the SMTP server.
- Start the mail body using `DATA` command as mentioned in the table.
- Write your mail.
- When mail is done writing Press **Enter** and go to a complete **newline** and Press **fullstop**(`.`) and again Press **Enter**.
- `.` signifies the end of the mail body.

## VRFY Command

- `VRFY` Command can be used to enumerate users in the server but depending on the SMTP configuration the server might give a status code that may indicate the presence of the user even if it doesn't exist in the server.

## SMTP Status Codes

- [SMTP Status Codes](https://serversmtp.com/smtp-error/)




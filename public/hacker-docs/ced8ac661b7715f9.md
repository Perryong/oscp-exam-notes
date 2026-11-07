
## Footprinting the Service

```bash
sudo nmap <TARGET IP> -sV -p110,143,993,995 -sC
```

## Log into IMAP

```bash
curl -k 'imaps://<TARGET IP>' --user <username>:<password> -v
```

## Connect to IMAP

```bash
openssl s_client -connect <TARGET IP>:imaps
```

## Connect to POP3

```bash
openssl s_client -connect <TARGET IP>:pop3s
```

## IMAP Commands

- In IMAP the `<ID>` is basically the serial number of the mail. Like if there are `3` mails in the mailbox then they will be serialized like `1,2,3` and so on... so when we select `3` we are trying to access the mail having serial number of `3`.
- The serial number may vary based on the mail you are trying to read or access.

| **Command**                     | **Description**                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `1 LOGIN username password`     | User's login.                                                                                                 |
| `1 LIST "" *`                   | Lists all directories.                                                                                        |
| `1 CREATE "INBOX"`              | Creates a mailbox with a specified name.                                                                      |
| `1 DELETE "INBOX"`              | Deletes a mailbox.                                                                                            |
| `1 RENAME "ToRead" "Important"` | Renames a mailbox.                                                                                            |
| `1 LSUB "" *`                   | Returns a subset of names from the set of names that the User has declared as being `active` or `subscribed`. |
| `1 SELECT INBOX`                | Selects a mailbox so that messages in the mailbox can be accessed.                                            |
| `1 UNSELECT INBOX`              | Exits the selected mailbox.                                                                                   |
| `1 FETCH <ID> all`              | Retrieves data associated with a message in the mailbox.                                                      |
| `1 CLOSE`                       | Removes all messages with the `Deleted` flag set.                                                             |
| `1 LOGOUT`                      | Closes the connection with the IMAP server.                                                                   |
| `1 FETCH <ID> BODY[]`           | Reads the entire mail including the `headers+body` and everything. **Modern approach**.                       |
| `1 FETCH <ID> RFC822`           | Reads the entire mail including the `headers+body` and everything. **Old approach**.                          |
## POP3 Commands

| **Command**     | **Description**                                             |
| --------------- | ----------------------------------------------------------- |
| `USER username` | Identifies the user.                                        |
| `PASS password` | Authentication of the user using its password.              |
| `STAT`          | Requests the number of saved emails from the server.        |
| `LIST`          | Requests from the server the number and size of all emails. |
| `RETR id`       | Requests the server to deliver the requested email by ID.   |
| `DELE id`       | Requests the server to delete the requested email by ID.    |
| `CAPA`          | Requests the server to display the server capabilities.     |
| `RSET`          | Requests the server to reset the transmitted information.   |
| `QUIT`          | Closes the connection with the POP3 server.                 |


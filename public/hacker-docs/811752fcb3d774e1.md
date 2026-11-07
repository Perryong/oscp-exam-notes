
## HTTP 

- Hyper Text Transfer Protocol.
- HTTP communicates with the server and client where the server processes the requests and returns the requested resource.
- Default port for HTTP `80`.
- Data transferred in clear text that is why HTTPS was developed.


## URL

`https://admin:password@@inlanefreight.com:80/dashboard.php?login=true#status`

| **Component**  | **Example**          | **Description**                                                                                                                                                                       |
| -------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Scheme`       | `http://` `https://` | This is used to identify the protocol being accessed by the client, and ends with a colon and a double slash (`://`)                                                                  |
| `User Info`    | `admin:password@`    | This is an optional component that contains the credentials (separated by a colon `:`) used to authenticate to the host, and is separated from the host with an at sign (`@`)         |
| `Host`         | `inlanefreight.com`  | The host signifies the resource location. This can be a hostname or an IP address                                                                                                     |
| `Port`         | `:80`                | The `Port` is separated from the `Host` by a colon (`:`). If no port is specified, `http` schemes default to port `80` and `https` default to port `443`                              |
| `Path`         | `/dashboard.php`     | This points to the resource being accessed, which can be a file or a folder. If there is no path specified, the server returns the default index (e.g. `index.html`).                 |
| `Query String` | `?login=true`        | The query string starts with a question mark (`?`), and consists of a parameter (e.g. `login`) and a value (e.g. `true`). Multiple parameters can be separated by an ampersand (`&`). |
| `Fragments`    | `#status`            | Fragments are processed by the browsers on the client-side to locate sections within the primary resource (e.g. a header or section on the page).                                     |


**Note:** Our browsers usually first look up records in the local '`/etc/hosts`' file, and if the requested domain does not exist within it, then they would contact other DNS servers. We can use the '`/etc/hosts`' to manually add records to for DNS resolution, by adding the IP followed by the domain name.


## `cURL`

- Tool used to send requests to target using HTTP along with many other protocols.
- We can send GET, POST requests.
- We can manipulate the HTTP headers.
- `cURL` by default makes a HTTP GET request and prints the raw HTML of the webpage.
- We can store the output in a file using `-O` switch.  You can check other options of `cURL` using `curl -h`.

#### Example

```bash
curl google.com
```


---

## Questions and Solutions


- To get the flag, start the above exercise, then use cURL to download the file returned by '/download.php' in the server shown above.
	- **HTB{redacted}**

```bash
$ curl 94.237.58.98:49765/download.php
HTB{redacted}
```


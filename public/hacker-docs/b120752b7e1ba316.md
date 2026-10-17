
## Use Sessions

- Metasploit can manage multiple modules at the same time.
- To manage multiple modules `Sessions` are used in Metasploit.
- `Sessions` create dedicated control interfaces for the deployed modules.

```bash
sessions
```

## Background a Session

- To `background` a session we can use the below command or `CTRL + Z`

```bash
background # background a session technique1
CTRL + Z # background a session technique2
```

## Interacting with Session

```bash
sessions -i <session_index_no>
```

## Kill a Session

```bash
sessions -k <session_index_no>
```


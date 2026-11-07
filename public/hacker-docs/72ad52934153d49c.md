
## Saving Results 

- Normal output (`-oN`) with the `.nmap` file extension.
- Grepable output (`-oG`) with the `.gnmap` file extension.
- XML output (`-oX`) with the `.xml` file extension.
- We can also specify the option (`-oA`) to save the results in all formats.

```bash
sudo nmap <IP> -oA <filename>
```


## Forming HTML format 

- From the `.xml` file we can form a HTML document using the below command.
- Specify the filename of the `.xml` file and the filename of the `.html` file you want.


```bash
xsltproc <filename>.xml -o <filename>.html
```
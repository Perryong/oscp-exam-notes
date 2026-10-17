
- Perform a full TCP port scan on your target and create an HTML report. Submit the number of the highest port as the answer.
	- **33137**


Performing `SYN` scan on the target and storing results in a file named **result**. The `-T4` switch is used to increase the speed of the scan but increasing speed/aggression of the scan might led to inaccurate results or the target might block our IP from sending further data packets so use it carefully.

```bash
$ sudo nmap 10.129.35.205 -oA result -T4
```

After getting all the file types we need to convert the `.xml` file to `.html` file using the below command.

```bash
$ xsltproc result.xml -o result.html
```

Open the **result.html**.

![Image1](./Images/Img1.png)





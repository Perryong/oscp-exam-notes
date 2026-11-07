

## REST API

- An architectural style of API.
- REST APIs utilize HTTP methods (GET, POST, PUT, DELETE) to perform CRUD(Create Read Update Delete) operations.
- Typically exchanges data in lightweight formats such as JSON or XML.
- REST APIs are structured to have multiple endpoints/URLs based on the resource the user might want.
- REST API behavior can be manipulated by manipulating the parameter and values of the parameter.


## SOAP API

- An architectural style of API.
- Uses XML to define the messages encapsulated in SOAP envelopes and transmitted over protocols such as HTTP or SMTP.
- SOAP parameters are defined within the SOAP message, an XML document. These parameters are organized into elements and attributes forming a hierarchical structure.


## GraphQL API

- A query language for API which is relatively new.
- Unlike REST APIs GraphQL has only one endpoint for all the resources. . This eliminates the problem of over-fetching or under-fetching data, which is common in REST APIs.
- This endpoint is usually a URL like `/graphql` and serves as the entry point for all queries and mutations sent to the API.

---
## Types of API Fuzzing

- Parameter Fuzzing
- Data Format Fuzzing
- Sequence Fuzzing

---
## Questions and Solutions


- What is the value returned by the endpoint that the api fuzzer has identified?
	- **h1dd3n_r357**


#### directory fuzzing

Performed directory fuzzing using `gobuster` to find hidden directories.

```bash
gobuster dir -u http://94.237.61.248:48693 -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 50
```

#### getting the flag value

Used `cURL` to make a GET request to the endpoint and get the flag value.

```bash
curl http://94.237.61.248:48693/czcmdcvt
```


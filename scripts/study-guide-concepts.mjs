// Original, non-operational teaching. Tags select learning lenses, not a verified attack chain.
const c = (id, pattern, title, explanation, observation, troubleshooting) => ({
  id,
  pattern: new RegExp(pattern, "i"),
  title,
  explanation,
  observation,
  troubleshooting,
});
export const concepts = [
  c(
    "kerberos",
    "kerberos|as-rep|kerberoast|silver-ticket|golden-ticket|timeroast|gettgt|kinit",
    "Kerberos identity and tickets",
    "Kerberos separates proof of identity from permission to use a service. A ticket is scoped to an identity, service and lifetime; possessing one does not imply administrator access. Account policy and service configuration determine which authentication exchanges are permitted.",
    "Look for a consistent domain name, service identity, ticket lifetime and account policy in the reference evidence. Distinguish authentication acceptance from subsequent authorization.",
    "A clock mismatch, incorrect realm, DNS mismatch or expired ticket can resemble a permission problem. Resolve those environmental differences before interpreting a denial as evidence about access rights.",
  ),
  c(
    "replication",
    "dcsync|ntds|secretsdump",
    "Directory replication and sensitive records",
    "Directory replication is a privileged synchronization function. Permission to request replicated credential material is a separate capability from an ordinary interactive login. The security lesson is to evaluate delegated rights as carefully as group names.",
    "The useful evidence is the effective replication permission and the identity to which it applies. Sensitive directory data should never be included in ordinary study screenshots or shared notes.",
    "A graph edge alone may omit inheritance, domain scope or deny entries. Compare the object, effective permissions and timestamp; directory snapshots can be stale.",
  ),
  c(
    "adcs",
    "adcs|certipy|certificate-template|esc[0-9]|pkinit|pass-the-cert",
    "Certificate trust and enrollment",
    "Certificate authentication depends on issuer trust, the requested identity and how the certificate is mapped to an account. Enrollment permissions and template settings jointly define the boundary; a trusted certificate is not automatically valid for every purpose.",
    "Identify issuer, subject, permitted usage, enrollment audience and account mapping. Expected evidence should explain which setting changes trust, rather than merely displaying a certificate file.",
    "Check validity dates, trust chain, template version and mapping policy. A certificate can be issued successfully yet be rejected for authentication or lack the required private key.",
  ),
  c(
    "acl",
    "genericall|genericwrite|writeowner|writespn|forcechangepassword|addself|bloodhound|aclpwn|dacledit|gpo",
    "Delegated permissions and effective access",
    "Access control describes who may perform a particular action on a particular object. Ownership, inherited permissions and group membership can interact. A useful model follows the exact permission across objects instead of assuming every relationship conveys full control.",
    "Record the principal, target object, permission and inheritance scope. Separate a proposed relationship from an access decision actually shown in the evidence.",
    "Cached group tokens and outdated directory data can disagree with current permissions. Check whether the right is direct or inherited and whether it applies to this object type.",
  ),
  c(
    "delegation",
    "rbcd|delegation|gmsa|readgmsapassword|gmsadumper",
    "Service identities and delegation",
    "Service identities let software act with dedicated permissions. Delegation allows an identity to act on behalf of another under defined constraints. Managed passwords reduce manual handling, but the right to read or administer a service account remains sensitive.",
    "Identify the service account, its consumers, the permitted delegation target and the administrative boundary. Expected observations should name both the caller and the represented identity.",
    "Distinguish a normal user from a machine or service account. Policy constraints, account protection and service naming can explain why a relationship does not produce the expected authorization.",
  ),
  c(
    "secrets",
    "credentials|password-reuse|autologon|dpapi|keepass|password-safe|cmd-key|memory-dump|pstranscript",
    "Secrets, storage and account context",
    "Configuration files, backups, logs and memory may contain information that an application treats as trusted. A discovered value can be obsolete, encrypted, scoped to another service or protected by a user-specific key. Treat these as separate cases.",
    "Document the artifact type, owner, intended service and age, without recording live secrets. Explain whether the reference demonstrates reuse, recovery or simply disclosure.",
    "Encoding is not encryption, and encrypted data is not necessarily recoverable without its key context. A stale backup or different account namespace can explain why a value does not correspond to current access.",
  ),
  c(
    "sqli",
    "sqli|sql-injection|sqlmap|cypher-injection|nosql",
    "Queries and data boundaries",
    "A query interface should keep user-supplied data distinct from query structure. Relational, graph and document databases use different query models. The key concept is where validation ends and a database interprets a value as syntax or an object selector.",
    "Compare response shape, error category and authorized data scope. A database error is a clue about parsing, not proof that additional data can be accessed.",
    "Caching, application validation and differences between database engines can obscure observations. Establish an ordinary baseline response before comparing error or timing behavior.",
  ),
  c(
    "mssql",
    "mssql|sqlcmd|mssqlclient|linked-servers",
    "Database roles and service context",
    "Database access has several layers: network reachability, login, database roles and the operating-system service account. Permission at one layer does not grant all capabilities at another. Linked services add another independent identity boundary.",
    "Identify the database principal, role and service identity separately. Where a reference crosses a service boundary, record which authorization decision accounts for the change.",
    "A working login with denied queries may simply lack database permissions. Default database selection, integrated authentication and connection encryption can also produce misleading failures.",
  ),
  c(
    "ssrf",
    "ssrf|gopher",
    "Server-side requests and network trust",
    "A server that retrieves a user-selected resource makes requests from its own network context. This differs from a browser visiting the same address. Network placement, destination validation and redirect handling shape the exposure.",
    "Distinguish an application response from a response produced by a downstream service. Record the request origin and network boundary shown in the reference.",
    "Timeouts do not establish whether a destination exists. Redirects, DNS resolution, outbound policy and asynchronous retrieval can each change the observed result.",
  ),
  c(
    "file-read",
    "lfi|rfi|file-read|directory-traversal|path-traversal",
    "Paths, inclusion and file access",
    "A path supplied to an application should remain within its intended storage boundary. Reading a file, including it as application content and executing it are different behaviors. Canonicalization and filesystem permissions affect what is actually accessible.",
    "Look for evidence of a resolved path and file ownership. Classify the outcome as disclosure, inclusion or execution only when the reference supports that distinction.",
    "Different working directories, separators, encoding and container filesystems can explain missing files. A permission error and a nonexistent path are different observations.",
  ),
  c(
    "upload",
    "upload|webshell|stacked-zips",
    "Uploaded content and interpretation",
    "File acceptance, storage and later interpretation are separate stages. A successful upload says little about whether content will be served, transformed or executed. Robust designs validate content and isolate uploaded data from executable application paths.",
    "Identify accepted type, stored location, processing step and serving behavior. A preview image or download response is not evidence of code execution.",
    "Renaming, asynchronous processing and image conversion can alter stored content. Compare the returned identifier and processing status rather than assuming the original filename survives.",
  ),
  c(
    "template",
    "^(ssti.*|jinja.*|erb|groovy|.*vm2.*|sandbox|javascript-injection)$",
    "Evaluation and sandbox boundaries",
    "Template engines and embedded runtimes interpret some inputs as programs rather than plain text. A sandbox aims to limit the operations that interpreted code can perform. Rendering, expression evaluation and host access are distinct capability levels.",
    "Identify the runtime and which capability the evidence demonstrates. A calculated value establishes evaluation, but does not by itself establish access to the host or another user.",
    "Engine versions, escaping rules and disabled features change behavior. An output-encoding difference can look like failed evaluation even when rendering occurred.",
  ),
  c(
    "injection",
    "command-injection|bash-ifs|bash-glob|path-injection|path-hijack",
    "Data interpreted as commands",
    "Command injection occurs when application data influences command structure. Separately, executable lookup can select an unintended program when search paths are not controlled. In both cases, interpretation and execution context are central to the explanation.",
    "Locate the boundary between a structured application value and a process invocation. Record the service identity and the evidence that distinguishes a parsing error from an executed action.",
    "Quoting, working directory, environment variables and platform differences can change interpretation. A missing executable or a blocked child process is not the same as correct input isolation.",
  ),
  c(
    "browser",
    "xss|xsrf|csrf|html-injection|markdown-to-html",
    "Browser origin and user context",
    "Browsers enforce boundaries around origins, sessions and script execution. Displaying untrusted content and performing an authenticated action are different risks. Understanding which browser and which user processes the content prevents overestimating its impact.",
    "Identify the rendering origin, active user and the demonstrated effect. Reflected text, parsed HTML and executed script should be recorded as separate observations.",
    "Content security policy, sandboxed frames, cookie rules and output escaping can change outcomes. A result seen in one user session may not occur in another.",
  ),
  c(
    "auth",
    "jwt|idor|auth-bypass|account-takeover|password-reset|mass-assignment|default-creds",
    "Authentication versus authorization",
    "Authentication identifies a caller; authorization decides what that caller can do. Object ownership, token validation and writable profile fields are separate controls. A successful sign-in does not justify access to another user’s data or administrative settings.",
    "Record the account role, requested object and expected owner. For tokens, distinguish a decoded claim from a claim the server has actually verified.",
    "Expired sessions, changed roles and inconsistent identifiers can produce confusing results. Compare like-for-like requests and avoid treating client-visible controls as proof of server-side enforcement.",
  ),
  c(
    "cms",
    "cms|joomla|wordpress|nibbleblog|backdrop|ghost|bludit|magento|prestashop|xwiki|umbraco|gibbon|dolibarr|daloradius",
    "Application administration and extensions",
    "Content-management systems separate publishing permissions from extension installation and server administration. Plugins, themes and administrative integrations can change the application’s capabilities. Version and configuration must be considered together.",
    "Identify the product, version and logged-in role supported by the reference. Explain which administrative feature crosses from managing content into managing application behavior.",
    "A similar login screen does not establish the same product version or enabled extensions. Read-only accounts, missing dependencies and hardened configurations can change the available functionality.",
  ),
  c(
    "build",
    "jenkins|pipeline|cicd|azure-devops|visual-studio|git-hooks|git-submodule|dotnet",
    "Build pipelines and artifact trust",
    "Build systems turn source and configuration into executable artifacts. Their trust boundary includes repository permissions, build workers, injected secrets and deployment credentials. A build account should have only the authority needed for its job.",
    "Identify who controls inputs, where builds run and which identity produces the artifact. Separate permission to submit source from permission to administer the worker.",
    "Job configuration, branch selection, isolated workers and disabled build hooks can change results. A queued job or successful compilation is not evidence that an artifact was deployed.",
  ),
  c(
    "git",
    "git|svn|git-dumper|source-code",
    "Source history and configuration evidence",
    "Version history can retain information removed from the current working tree. Source code also reveals intended validation and application boundaries, but deployed configuration can differ. Use it as evidence to compare with behavior, not as a guarantee of runtime state.",
    "Record revision, file purpose and whether the artifact belongs to the deployed application. Distinguish current configuration from historical or example values.",
    "Partial repositories, stale branches and generated files can mislead. Check the revision and path before concluding that a behavior in source is active.",
  ),
  c(
    "cloud",
    "aws|s3|localstack|minio|aws-lambda|azure-connect",
    "Cloud services and policy scope",
    "Cloud access depends on the identity, action, resource and applicable policy. Emulators and local service deployments can expose similar interfaces with different controls. Storage access, secret access and execution privileges remain separate capabilities.",
    "Identify the endpoint, account context, resource name and allowed action. Explain whether the reference concerns a local emulator or a hosted cloud service.",
    "A resource may exist in a different region or account. Explicit denial, endpoint selection and session scope can explain a failure even when a credential is valid.",
  ),
  c(
    "container",
    "docker|container|lxc|lxd|hyper-v",
    "Containers and host boundaries",
    "A container or virtual machine has its own filesystem and network view. Host mounts, management sockets and administrative groups can bridge isolation. Being an administrator inside a guest does not automatically mean having host-level control.",
    "Identify the execution environment and any shared resources. Keep guest identity, host identity and management-plane permissions separate in the diagram.",
    "Different namespaces can make a file, hostname or listener appear absent. Confirm the environment represented by the evidence before comparing it with host-level observations.",
  ),
  c(
    "sudo",
    "sudo|gtfobins|setuid|facter|easy-install|ndsudo",
    "Privileged execution policy",
    "A privileged program runs with authority determined by system policy and its implementation. Allowed arguments, environment handling and file ownership are as important as the program name. Permission to run a narrow operation should not be assumed to grant a general session.",
    "Record the authorized operation, execution identity and relevant input ownership. Distinguish a policy entry from demonstrated elevated access.",
    "Version changes, argument restrictions and environment sanitization can invalidate assumptions. Examine the precise policy and context instead of relying on a generic program-name association.",
  ),
  c(
    "services",
    "service|scheduled-task|cron|systemctl|nssm|windows-service",
    "Services, scheduled work and writable inputs",
    "Background tasks run under configured identities and consume files or parameters over time. The security boundary includes both who controls an input and which process later trusts it. Timing alone does not prove a task executed the expected content.",
    "Identify task identity, input ownership, schedule and evidence of actual execution. Separate the ability to edit a file from the authority of the process that reads it.",
    "Disabled jobs, different working directories, cached configurations and concurrent executions can explain unexpected results. Compare timestamps and logs before assuming the task ran.",
  ),
  c(
    "windows-rights",
    "sebackup|seimpersonate|server-operators|backup-operators|alwaysinstallelevated|semana|eoploaddriver",
    "Windows privileges and token context",
    "Windows access depends on the token of the current process as well as object permissions. Group membership and named privileges describe capabilities, but activation, token filtering and service restrictions affect their use.",
    "Identify the current identity, token scope and the specific privilege discussed. Expected evidence should show the relevant permission rather than infer it from an account name.",
    "A remote session may have a different token from an interactive session. Disabled privileges, filtered tokens and policy changes can explain differences without implying that the underlying account is different.",
  ),
  c(
    "network",
    "tunnel|proxychains|chisel|port-knocking|vhosts|subdomain|dns",
    "Names, listeners and network context",
    "An address identifies a destination only within a network context. DNS names, virtual hosts, listener bindings and intermediaries affect which service responds. A reachable web page does not establish reachability of every service on that host.",
    "Record the hostname, address, port and vantage point shown in the reference. Distinguish routing failure from application rejection.",
    "Wrong virtual-host names, stale DNS, loopback-only listeners and filtering are common reasons for different observations. Compare the intended hostname and network location first.",
  ),
  c(
    "shares",
    "smb|nfs|ftp|smbclient|smbmap",
    "File sharing and access scope",
    "File-sharing services apply their own authentication and authorization rules in addition to filesystem permissions. Visibility of a share, ability to list a directory and ability to read a file are different capabilities.",
    "Record the service, account context, share and access level. A directory listing should be treated as discovery evidence, not assumed access to every listed item.",
    "Guest fallback, protocol version, export restrictions and inherited filesystem permissions may produce mixed results. Separate authentication failure from denial on an individual path.",
  ),
  c(
    "parsing",
    "deserialization|object-injection|yaml|pickle|node-serialize",
    "Structured data and object reconstruction",
    "A parser should convert input into data without granting unintended behavior. Deserialization can reconstruct objects with behavior as well as values. Trust in the sender and strict limits on accepted types matter at this boundary.",
    "Identify the format, consumer and validation boundary. Distinguish accepted syntax from construction of an unexpected object or invocation of behavior.",
    "Schema changes, library versions and signed containers can make similar-looking input behave differently. A parsing exception is not proof of a deeper capability.",
  ),
  c(
    "documents",
    "phishing|macros|xll|chm|libreoffice|ghostscript|themebleed",
    "Documents and automatic processing",
    "Documents can be processed by viewers, converters and automated workflows with different privileges. The important boundary is between viewing data and invoking additional features or external resources. User interaction and processing policy change exposure.",
    "Identify which application processes the artifact, its version and whether processing is automatic or interactive. Record the observed action without assuming every recipient behaves the same way.",
    "Protected modes, disabled features, missing associations and conversion services can change behavior. A document being delivered is not proof it was opened or processed.",
  ),
  c(
    "memory",
    "buffer|heap|binary-exploitation|shellcode|capcom|kernel|ms10|ms14|dirtycow|gameoverlay|achat",
    "Memory safety and platform versions",
    "Memory-safety defects depend on precise assumptions about layout, implementation and mitigations. Kernel and driver behavior is particularly version-sensitive. A product name alone cannot establish whether a system has the affected condition.",
    "Record the exact platform, architecture, component version and relevant mitigation state. Expected observations should identify the condition under study rather than promise a successful outcome.",
    "Patched builds, architecture mismatch, changed dependencies and enabled protections can explain discrepancies. A crash establishes instability, not control or elevated permissions.",
  ),
  c(
    "monitoring",
    "snmp|prtg|zoneminder|splunk|netdata|papercut|checkmk",
    "Monitoring interfaces and collected data",
    "Monitoring tools often collect broad operational information and may integrate with privileged services. Their interfaces, stored credentials and collection agents form separate trust boundaries. Read access to telemetry is not equivalent to permission to administer the monitored host.",
    "Identify the management interface, collection identity and the type of data exposed. Explain how the reference distinguishes observation from configuration authority.",
    "Collection lag, agent isolation and interface permissions can produce apparently contradictory evidence. Check freshness and whether data comes from the local host or a remote monitored system.",
  ),
  c(
    "transport",
    "request-smuggling|http-sys|wcf|soap|redis|activemq|tomcat|james|coldfusion|jetty",
    "Protocol parsing and server configuration",
    "A service interprets messages according to a protocol and its configuration. Proxies and backend services may disagree about message boundaries or authentication. Administrative endpoints also carry different authority from ordinary user-facing endpoints.",
    "Identify the component that produced a response and the trust boundary between intermediaries. Compare ordinary service behavior with administrative behavior.",
    "Version differences, proxy normalization and listener configuration can explain inconsistent responses. Do not attribute a frontend response to the backend without supporting evidence.",
  ),
  c(
    "crypto",
    "aes|openssl|pfx|pfx2john|ssh-keys|ssh-keygen|cryptography",
    "Keys, encryption and identity",
    "Encryption protects data under a key; authentication establishes an identity using a credential or proof. Encoded text, encrypted files and signed objects have different properties. The presence of a key file does not prove it is usable for a particular account.",
    "Identify the format, intended use and whether a private component or password is required. Record metadata rather than copying sensitive key material into notes.",
    "Wrong formats, missing certificate chains, revoked keys and password protection can explain rejection. File conversion changes representation, not the permissions assigned to the identity.",
  ),
  c(
    "race",
    "^(toctou|race|inotifywait)$",
    "Timing and filesystem state",
    "A check and a later use may observe different states of the same resource. Safe designs bind the operation to the object actually checked. Filesystem events indicate change, but do not prove which version a consumer used.",
    "Record the checked object, consumed object and timestamps. Explain whether the reference establishes a state mismatch or only a timing correlation.",
    "Scheduler variation, buffering and duplicate events can make observations inconsistent. Treat single-run results cautiously and distinguish a stable condition from a transient artifact.",
  ),
  c(
    "passwords",
    "hashcat|john|bruteforce|password-spray|crackstation|hydra",
    "Passwords, verifiers and evidence",
    "A password verifier is not a plaintext password. Its security depends on the algorithm, work factor and password quality. Account lockout, reuse and credential age are separate issues; recovery of one value does not imply broad access.",
    "Identify whether the artifact is plaintext, a verifier or a challenge-response record. Describe the account and service scope without storing recovered secrets in shared notes.",
    "Different verifier formats and account contexts are easy to confuse. An unchanged value in an old artifact may be irrelevant after rotation, and acceptance can differ between services.",
  ),
  c(
    "recon",
    "nmap|feroxbuster|gobuster|wfuzz|wappalyzer",
    "Service discovery and evidence quality",
    "Discovery observations describe what responded from a particular vantage point at a particular time. A product fingerprint is a hypothesis that needs corroboration. Keep observed facts distinct from assumptions about version, ownership and exposure.",
    "Record service identity, response type and confidence. Compare more than one clue before assigning a product or drawing conclusions about its configuration.",
    "Filtering, redirects, generic error pages and intermittent services can distort results. Establish a baseline and check freshness before treating a missing response as proof of absence.",
  ),
];
const reviewedExtras = {
  Nibbles: ["nibbleblog", "upload"],
  Chatterbox: ["memory", "windows-rights"],
  Poison: ["secrets", "network"],
  Access: ["shares", "crypto"],
  Irked: ["sudo", "transport"],
  BoardLight: ["sudo"],
  UnderPass: ["sudo"],
  Dog: ["sudo"],
  Acute: ["documents", "windows-rights"],
};
export function selectConcepts(tags, name) {
  const exact = tags.filter((t) => !/^(htb-|oscp-|osep-|cpts-|cve-)/.test(t));
  return concepts
    .filter(
      (c) =>
        (reviewedExtras[name] || []).includes(c.id) ||
        exact.some((t) => c.pattern.test(t)) ||
        (reviewedExtras[name] || []).some((t) => c.pattern.test(t)),
    )
    .slice(0, 5);
}
export const escapeXml = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
export function conceptDiagram(name, stages) {
  const h = 125 + stages.length * 105;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${h}" viewBox="0 0 720 ${h}" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(name)}: reading stages</title><desc id="desc">Source section order, not a verified attack chain. ${stages.map(escapeXml).join(" → ")}</desc><rect width="720" height="${h}" fill="#f3f6f5" rx="20"/><text x="40" y="45" font-family="sans-serif" font-size="25" font-weight="bold" fill="#173e39">${escapeXml(name)} · learning map</text><text x="40" y="75" font-family="sans-serif" font-size="16" fill="#425b59">Read each stage → identify the evidence → check the boundary</text>${stages
    .map((s, i) => {
      const y = 100 + i * 105;
      const label = s.length > 57 ? s.slice(0, 54) + "…" : s;
      return `<rect x="40" y="${y}" width="640" height="65" rx="12" fill="#193f39"/><text x="62" y="${y + 40}" font-family="sans-serif" font-size="20" fill="white">${i + 1}. ${escapeXml(label)}</text>${i < stages.length - 1 ? `<path d="M360 ${y + 72}v22m-7-7 7 7 7-7" fill="none" stroke="#27806c" stroke-width="3"/>` : ""}`;
    })
    .join("")}</svg>`;
}

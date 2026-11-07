export interface FlowStep {
  step: string;
  title: string;
  desc: string;
}

export interface DefinitionDetails {
  whatItIs: string;
  howItOccurs: string;
  payloadMechanism: string;
  impact: string[];
  prevention: string[];
}

export interface Lab {
  id: string;
  name: string;
  owaspCategory: string;
  owaspUrl: string;
  definition: string;
  definitionDetails: DefinitionDetails;
  payloadExplanation: string;
  flowSteps: FlowStep[];
  vulnerableCodeBeforeInput: string;
  vulnerableCodeAfterInput: string;
  variableName: string;
  defaultPayload: string;
  apiEndpoint: string;
  paramName: string;
  isPathVar?: boolean;
  httpMethod: "GET" | "POST";
  secureCode: string;
  secureExplanation: string;
  secureKeyPoints: string[];
}

export const LABS: Lab[] = [
  {
    id: "sqli",
    name: "SQL Injection",
    owaspCategory: "A03:2021 - Injection",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
    definition: "SQL Injection occurs when untrusted user input is directly concatenated into a dynamic SQL query without validation or parameterization. This allows an attacker to alter the query logic, bypass authentication, and access or delete database contents.",
    definitionDetails: {
      whatItIs: "SQL Injection (SQLi) is categorized under OWASP Top 10 (A03:2021 – Injection). It occurs when hostile data entered by a user is directly embedded into an interpreter query, misleading the database engine into executing unintended database commands.",
      howItOccurs: "In this application, the backend constructs dynamic SQL by concatenating the raw 'username' request parameter directly into a native query string (e.g. \"SELECT * FROM app_users WHERE username = '\" + username + \"'\"). Because the input is not treated as literal data, any SQL syntax characters inside it are parsed as native query logic.",
      payloadMechanism: "The exploit payload \"' OR '1'='1' --\" works in three distinct phases:\n1. The leading quote (') breaks out of the intended string literal boundary.\n2. The 'OR '1'='1' clause introduces a condition that evaluates to TRUE for every single row in the database table.\n3. The trailing double dash ('--') comments out the rest of the original query structure, removing any password or condition checks.",
      impact: [
        "Authentication & Authorization Bypass: Attackers can log in as administrative users without knowing credentials.",
        "Confidentiality Breach: Dumping entire databases, exposing sensitive passwords, PII, and financial records.",
        "Data Integrity Loss: Malicious alteration or permanent deletion of business data via UPDATE or DROP statements.",
        "Host Takeover: In severe misconfigurations, attackers can read server files or execute OS commands through database extensions."
      ],
      prevention: [
        "Parameterized Queries (Prepared Statements): Ensure the database compiles the SQL query structure before inserting untrusted parameters strictly as literal data values.",
        "Object Relational Mapping (ORM): Utilize Spring Data JPA repository finder methods (e.g. findByUsername) which inherently enforce parameter binding.",
        "Principle of Least Privilege: Configure database connection accounts with only the minimal necessary permissions required for the application.",
        "Input Validation & Whitelisting: Validate user inputs against expected formats (e.g., alphanumeric usernames) as a secondary defense layer."
      ]
    },
    payloadExplanation: "The payload `' OR '1'='1' --` breaks out of the single quotes enclosing the string literal. Since '1'='1' is always true, the WHERE condition evaluates to TRUE for every row. The trailing '--' comments out the remainder of the original query.",
    flowSteps: [
      { step: "1", title: "Client Input", desc: "Student submits malicious payload through the username parameter." },
      { step: "2", title: "String Concatenation", desc: "Backend constructs raw SQL: SELECT * FROM app_users WHERE username = '' OR '1'='1' --'." },
      { step: "3", title: "Database Execution", desc: "Database engine evaluates '1'='1' (always true), ignoring password validation." },
      { step: "4", title: "Unauthorized Leak", desc: "All user records (including admin credentials) are returned to the client." }
    ],
    vulnerableCodeBeforeInput: `String username = request.getParameter("username");

// VULNERABLE: Direct string concatenation into raw SQL
String sql = "SELECT * FROM app_users WHERE username = '`,
    vulnerableCodeAfterInput: `'";

Query query = entityManager.createNativeQuery(sql, User.class);
return query.getResultList();`,
    variableName: "username",
    defaultPayload: "' OR '1'='1' --",
    apiEndpoint: "/api/users/vulnerable/search",
    paramName: "username",
    httpMethod: "GET",
    secureCode: `@GetMapping("/secure/search")
public ResponseEntity<List<User>> secureSearch(@RequestParam String username) {
    // SECURE: Spring Data JPA automatically generates parameterized PreparedStatement
    // Parameters are treated strictly as data, never as executable SQL instructions.
    List<User> results = userRepository.findByUsername(username);
    return ResponseEntity.ok(results);
}`,
    secureExplanation: "Parameterized queries (PreparedStatement) ensure the database engine compiles the SQL query structure first. Any user input is supplied as literal data parameters, making SQL injection impossible regardless of input content.",
    secureKeyPoints: [
      "Use PreparedStatement or Spring Data JPA parameterized finder methods.",
      "Never concatenate user-supplied input into raw SQL strings.",
      "Input is treated strictly as data literals, not executable commands."
    ]
  },

  {
    id: "cmdi",
    name: "OS Command Injection",
    owaspCategory: "A03:2021 - Injection (CWE-78)",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html",
    definition: "OS Command Injection occurs when an application executes operating system commands using untrusted user input without sanitization. An attacker can append arbitrary system shell commands with the privileges of the web application.",
    definitionDetails: {
      whatItIs: "OS Command Injection (CWE-78 / OWASP A03:2021) is a critical flaw that allows an attacker to execute arbitrary shell commands on the host operating system running the web application. It compromises the underlying server directly.",
      howItOccurs: "The vulnerability occurs when an application passes unvalidated user input to a system shell interpreter (such as 'cmd.exe /c' on Windows or 'sh -c' on Linux) using Runtime.getRuntime().exec(). Because the shell interprets metacharacters like &, |, ;, and $, attackers can chain unintended commands.",
      payloadMechanism: "The payload \"127.0.0.1 && whoami\" leverages the shell command-chaining operator (&&):\n1. The shell first executes the legitimate ping command on localhost (127.0.0.1).\n2. Because the first command succeeds, the '&&' operator triggers the execution of the second command ('whoami').\n3. The output of whoami is piped back into the application process output stream and displayed in the HTTP response.",
      impact: [
        "Remote Code Execution (RCE): Attackers gain immediate interactive shell access on the host operating system.",
        "Complete System Compromise: Ability to read, modify, or delete any server file accessible to the web process.",
        "Lateral Network Movement: Compromised servers can be used as pivot points to attack internal databases and private enterprise infrastructure.",
        "Denial of Service (DoS): Attackers can terminate critical system services or crash the physical/virtual host."
      ],
      prevention: [
        "Avoid Direct Shell Invocation: Do not invoke shell interpreters (cmd.exe or /bin/sh). Use platform APIs or language built-in functions instead of shell utilities.",
        "ProcessBuilder with Tokenized Arguments: When external processes are unavoidable, pass arguments as discrete elements of an array (ProcessBuilder(\"ping\", \"-n\", \"2\", host)), preventing argument injection.",
        "Strict Input Whitelisting: Validate parameters against an uncompromising whitelist regular expression (e.g. ^[a-zA-Z0-9.-]+$) to reject all shell metacharacters.",
        "Least Privilege Execution: Run web application services under restricted service accounts with minimal filesystem and OS permissions."
      ]
    },
    payloadExplanation: "The payload `127.0.0.1 && whoami` uses the shell operator '&&' (or ';') to chain commands. The shell first runs the intended ping command on localhost, then executes the injected 'whoami' command, revealing the running OS user identity.",
    flowSteps: [
      { step: "1", title: "Host Input", desc: "Student provides an IP combined with a shell operator '&&'." },
      { step: "2", title: "Shell Invocation", desc: "Backend passes full string to Runtime.getRuntime().exec('cmd.exe /c ping -n 2 ' + host)." },
      { step: "3", title: "Command Chaining", desc: "The command interpreter executes ping, followed immediately by the injected command." },
      { step: "4", title: "System Compromise", desc: "Output of whoami is captured and returned in the HTTP response." }
    ],
    vulnerableCodeBeforeInput: `String host = request.getParameter("host");

// VULNERABLE: Invokes system shell with unvalidated concatenated arguments
String cmd = "cmd.exe /c ping -n 2 `,
    vulnerableCodeAfterInput: `";

Process process = Runtime.getRuntime().exec(cmd);
return readProcessOutput(process);`,
    variableName: "host",
    defaultPayload: "127.0.0.1 && whoami",
    apiEndpoint: "/api/command/vulnerable/ping",
    paramName: "host",
    httpMethod: "GET",
    secureCode: `@GetMapping("/secure/ping")
public ResponseEntity<?> securePing(@RequestParam String host) {
    // 1. Strict regex whitelist (only valid IP or alphanumeric hostname)
    if (!Pattern.matches("^[a-zA-Z0-9.-]+$", host)) {
        return ResponseEntity.badRequest().body("Invalid hostname format");
    }

    // 2. ProcessBuilder without shell interpreter (isolated arguments)
    ProcessBuilder pb = new ProcessBuilder("ping", "-n", "2", host);
    Process process = pb.start();
    return ResponseEntity.ok(readProcessOutput(process));
}`,
    secureExplanation: "Avoid passing user input to shell interpreters (`cmd.exe` or `sh`). Use `ProcessBuilder` with an array of individual arguments and validate the input against a strict whitelist regular expression.",
    secureKeyPoints: [
      "Strict input whitelisting: Reject any characters except alphanumeric and dots.",
      "Avoid shell interpreters (do not use cmd.exe /c or sh -c).",
      "ProcessBuilder passes arguments as discrete tokens, preventing argument injection."
    ]
  },

  {
    id: "idor",
    name: "Insecure Direct Object Reference",
    owaspCategory: "A01:2021 - Broken Access Control",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html",
    definition: "IDOR occurs when an application exposes a reference to an internal implementation object (such as a database primary key) and fails to verify that the requesting user has authorization to access that object.",
    definitionDetails: {
      whatItIs: "Insecure Direct Object Reference (IDOR) is a subcategory of OWASP Top 10 (A01:2021 – Broken Access Control). It occurs when an application provides direct access to internal database objects based on user-supplied identifiers without performing proper access control checks.",
      howItOccurs: "The endpoint takes an entity identifier ('id') directly from the client request URL and queries the database (profileRepository.findById(id)) without comparing the object's owner identifier with the authenticated user session. The server assumes that knowing the object ID equates to having permission to view it.",
      payloadMechanism: "The payload \"3\" represents the database record ID belonging to the system administrator:\n1. The user (authenticated as normal user Alice, ID 1) simply substitutes their own profile ID with '3'.\n2. The server blindly loads Profile #3 from the database.\n3. Because no ownership verification is implemented, Admin's private email and credit card number are transmitted directly to Alice.",
      impact: [
        "Horizontal Privilege Escalation: Regular users can view, modify, or delete sensitive data belonging to peer users.",
        "Vertical Privilege Escalation: Standard accounts can access administrative resources and configuration data.",
        "Mass Data Exfiltration: Attackers can iterate through numeric primary keys using automated scripts to scrape the entire database.",
        "Privacy & Regulatory Violations: Massive leaks of Personal Identifiable Information (PII) leading to GDPR/HIPAA compliance penalties."
      ],
      prevention: [
        "Enforce Contextual Record Ownership Checks: Always verify that the requested entity's owner ID equals the authenticated user ID (profile.getUserId().equals(currentUserId)).",
        "Use Indirect or Nonce-based References: Map internal database primary keys to session-scoped random tokens or UUIDs so attackers cannot enumerate records.",
        "Reject Insecure Direct References: Retrieve user-owned resources using session attributes directly (e.g. findByUserId(sessionUserId)) rather than accepting client-specified IDs.",
        "Centralized Access Control: Implement robust access control matrices and annotations (such as @PreAuthorize) at the service layer."
      ]
    },
    payloadExplanation: "While logged in as regular User 1 (Alice), the student changes the requested profile ID to `3` (Admin). Because the backend lacks an ownership check, it fetches and reveals the administrator's sensitive profile and credit card.",
    flowSteps: [
      { step: "1", title: "Direct Reference", desc: "Client requests GET /api/profiles/vulnerable/3 directly by ID." },
      { step: "2", title: "Direct Lookup", desc: "Controller directly calls profileRepository.findById(3) without checking who is asking." },
      { step: "3", title: "Authorization Missing", desc: "No check verifies if the caller's session owns profile ID 3." },
      { step: "4", title: "Data Exposure", desc: "Credit card and email of another user are returned." }
    ],
    vulnerableCodeBeforeInput: `// VULNERABLE: Directly loads record using client-supplied ID without ownership check
@GetMapping("/vulnerable/{id}")
public Profile vulnerableGetProfile(@PathVariable Long id) {
    Long targetId = `,
    vulnerableCodeAfterInput: `;
    return profileRepository.findById(targetId).orElseThrow();
}`,
    variableName: "id",
    defaultPayload: "3",
    apiEndpoint: "/api/profiles/vulnerable",
    paramName: "id",
    isPathVar: true,
    httpMethod: "GET",
    secureCode: `@GetMapping("/secure/{id}")
public ResponseEntity<?> secureGetProfile(@PathVariable Long id, @RequestParam Long currentUserId) {
    Profile profile = profileRepository.findById(id).orElseThrow();

    // SECURE: Enforce authorization and record ownership
    if (!profile.getUserId().equals(currentUserId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                             .body("Access denied: You do not own this profile.");
    }
    return ResponseEntity.ok(profile);
}`,
    secureExplanation: "Implement robust access control checks at the data layer. Verify that the authenticated user identity matches the resource's owner before returning any sensitive data.",
    secureKeyPoints: [
      "Verify authorization on every direct object lookup.",
      "Compare the resource owner ID with the authenticated session user ID.",
      "Return HTTP 403 Forbidden when an unauthorized request occurs."
    ]
  },

  {
    id: "xss",
    name: "Stored Cross-Site Scripting",
    owaspCategory: "A03:2021 - Injection (Stored XSS)",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
    definition: "Stored XSS occurs when an application receives untrusted input containing executable JavaScript or HTML, stores it in a database, and later renders it in other users' browsers without proper encoding or sanitization.",
    definitionDetails: {
      whatItIs: "Stored (Persistent) Cross-Site Scripting (OWASP A03:2021) is the most dangerous form of XSS. It occurs when malicious script code injected by an attacker is permanently stored inside the target application's database and delivered to every subsequent victim who visits the page.",
      howItOccurs: "The guestbook submission endpoint accepts raw user content and saves it directly to the database without HTML character encoding. When any user visits the guestbook page to view posts, the backend serves the unencoded markup, causing the browser to execute the script in the context of the victim's session.",
      payloadMechanism: "The payload \"<img src=x onerror=alert(document.cookie)>\" bypasses basic script filters:\n1. It injects a standard HTML <img> tag with an intentionally invalid source URL ('x').\n2. When the browser attempts to fetch the image and fails, it immediately fires the 'onerror' JavaScript event handler.\n3. The inline JavaScript executes with full access to the victim's Document Object Model (DOM), including document.cookie.",
      impact: [
        "Session Hijacking: Theft of sensitive authentication tokens and session cookies, allowing complete account takeover.",
        "Credential Harvesting & Phishing: Dynamically injecting fake login prompts or form overlays to steal passwords.",
        "Client-Side Malware Distribution: Redirecting legitimate users to malicious external domains or exploit kits.",
        "Defacement & Unauthorized Actions: Modifying page presentation and executing actions on behalf of the victim."
      ],
      prevention: [
        "Context-Aware Output Encoding: Encode untrusted data before rendering it in the browser (e.g. converting '<' to '&lt;' and '>' to '&gt;' using Spring's HtmlUtils.htmlEscape).",
        "Set HttpOnly Cookie Flag: Mark session cookies with 'HttpOnly' so client-side JavaScript cannot access document.cookie even if XSS occurs.",
        "Content Security Policy (CSP): Deploy HTTP response headers that restrict where scripts can be executed from and disallow inline script execution.",
        "HTML Sanitization Libraries: If rich text is required, use robust sanitizers like OWASP Java HTML Sanitizer to strip dangerous tags."
      ]
    },
    payloadExplanation: "The payload `<img src=x onerror=alert(document.cookie)>` injects an image element with an invalid source URL. When the browser attempts and fails to load it, the inline `onerror` event handler executes JavaScript to access sensitive cookies.",
    flowSteps: [
      { step: "1", title: "Malicious Input", desc: "Attacker submits guestbook post containing JavaScript/HTML tags." },
      { step: "2", title: "Raw Storage", desc: "Database stores the payload as plain text without escaping." },
      { step: "3", title: "Public Retrieval", desc: "Victim visits guestbook page; backend returns stored raw payload." },
      { step: "4", title: "Browser Execution", desc: "Victim's browser parses the tag as HTML and executes the script." }
    ],
    vulnerableCodeBeforeInput: `Guestbook post = new Guestbook();
post.setAuthor("Attacker");

// VULNERABLE: Stores raw HTML/JS content into database
post.setContent("`,
    vulnerableCodeAfterInput: `");

return guestbookRepository.save(post);`,
    variableName: "content",
    defaultPayload: "<img src=x onerror=alert(document.cookie)>",
    apiEndpoint: "/api/guestbook/vulnerable/post",
    paramName: "content",
    httpMethod: "POST",
    secureCode: `@PostMapping("/secure/post")
public ResponseEntity<Guestbook> securePost(@RequestBody Guestbook post) {
    // SECURE: Context-aware HTML escaping using Spring's HtmlUtils
    // Converts '<' to '&lt;', '>' to '&gt;', preventing browser execution
    if (post.getContent() != null) {
        post.setContent(HtmlUtils.htmlEscape(post.getContent()));
    }
    return ResponseEntity.ok(guestbookRepository.save(post));
}`,
    secureExplanation: "Context-aware HTML output encoding (or input escaping via `HtmlUtils.htmlEscape`) converts active markup characters (`<`, `>`, `&`, `\"`, `'`) into harmless HTML entities so browsers display them purely as text.",
    secureKeyPoints: [
      "Use HtmlUtils.htmlEscape() or an OWASP HTML Sanitizer before storing or rendering.",
      "Set HttpOnly flag on sensitive cookies to prevent theft via JavaScript.",
      "Employ a strict Content Security Policy (CSP) header."
    ]
  },

  {
    id: "csrf",
    name: "Cross-Site Request Forgery",
    owaspCategory: "A01:2021 - Broken Access Control / CWE-352",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
    definition: "CSRF forces an authenticated victim's browser to execute unwanted actions on a trusted web application. The application processes the forged request because the victim's session cookies are automatically included by the browser.",
    definitionDetails: {
      whatItIs: "Cross-Site Request Forgery (CWE-352 / OWASP A01:2021) is an attack that forces an end user to execute unwanted actions on a web application in which they are currently authenticated. CSRF attacks exploit the trust that a web application has in the user's browser.",
      howItOccurs: "Web browsers automatically attach ambient credentials (such as session cookies or HTTP basic auth headers) to every cross-origin request targeting a domain. When the vulnerable backend processes state-changing requests (like changing an email address) solely based on session cookies without an unpredictable challenge token, forged requests succeed.",
      payloadMechanism: "The payload \"attacker@evil.com\" represents the malicious value supplied in a forged request:\n1. An authenticated victim visits an attacker-controlled website containing a hidden auto-submitting HTML form.\n2. The form sends a POST request to '/api/csrf/vulnerable/change-email' with 'newEmail=attacker@evil.com'.\n3. The browser automatically includes the victim's valid session cookie.\n4. The vulnerable server sees a valid session and updates the victim's account email without user knowledge.",
      impact: [
        "Account Takeover: Changing email addresses or passwords allows attackers to initiate password resets and seize accounts.",
        "Unauthorized Financial Transactions: Forging fund transfers or purchasing products using the victim's stored payment credentials.",
        "Data & Configuration Modification: Tampering with critical user profile settings, security preferences, or administrative options.",
        "Reputation Damage: Attackers can post unauthorized messages, comments, or status updates on behalf of the victim."
      ],
      prevention: [
        "Synchronizer Token Pattern (Anti-CSRF Tokens): Generate a cryptographically strong, unique token per session and require it in a custom request header (X-CSRF-TOKEN) for all state-changing requests.",
        "SameSite Cookie Attribute: Configure session cookies with 'SameSite=Strict' or 'SameSite=Lax' to prevent browsers from sending cookies with cross-site requests.",
        "Custom Request Headers: Enforce custom headers (like X-Requested-With) on REST endpoints that cross-origin HTML forms cannot send without explicit CORS approval.",
        "Re-Authentication for Sensitive Operations: Require users to re-enter their current password before modifying email, password, or financial settings."
      ]
    },
    payloadExplanation: "An attacker hosts a malicious website that issues an unauthorized POST request to change the victim's email to `attacker@evil.com`. Because the vulnerable endpoint checks only the session cookie, the email is changed without user consent.",
    flowSteps: [
      { step: "1", title: "Victim Authenticates", desc: "Victim logs into SecDevLab; session cookie is stored in browser." },
      { step: "2", title: "Lured to Trap", desc: "Victim visits an attacker's website containing a hidden auto-submitting form." },
      { step: "3", title: "Forged Request", desc: "Form posts to /api/csrf/vulnerable/change-email with attacker's email." },
      { step: "4", title: "Unauthorized Action", desc: "Backend accepts the request because valid session cookie was attached." }
    ],
    vulnerableCodeBeforeInput: `// VULNERABLE: State-changing request without Anti-CSRF token verification
@PostMapping("/vulnerable/change-email")
public ResponseEntity<?> changeEmail(@RequestParam String newEmail, HttpSession session) {
    String email = "`,
    vulnerableCodeAfterInput: `";
    session.setAttribute("USER_EMAIL", email);
    return ResponseEntity.ok("Email updated to " + email);
}`,
    variableName: "newEmail",
    defaultPayload: "attacker@evil.com",
    apiEndpoint: "/api/csrf/vulnerable/change-email",
    paramName: "newEmail",
    httpMethod: "POST",
    secureCode: `@PostMapping("/secure/change-email")
public ResponseEntity<?> secureChangeEmail(
        @RequestParam String newEmail,
        @RequestHeader("X-CSRF-TOKEN") String token,
        HttpSession session) {

    // SECURE: Synchronizer Token Pattern
    String sessionToken = (String) session.getAttribute("CSRF_TOKEN");
    if (sessionToken == null || !sessionToken.equals(token)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("CSRF Token Invalid");
    }
    session.setAttribute("USER_EMAIL", newEmail);
    return ResponseEntity.ok("Email securely updated.");
}`,
    secureExplanation: "Implement the Synchronizer Token Pattern (Anti-CSRF Tokens). A unique, unpredictable, secret token is generated per session and validated on all state-changing POST/PUT requests via a custom HTTP header.",
    secureKeyPoints: [
      "Use Synchronizer Token Pattern (Anti-CSRF tokens in custom headers).",
      "Configure SameSite=Strict or SameSite=Lax on all session cookies.",
      "Require re-authentication for critical account operations."
    ]
  }
];

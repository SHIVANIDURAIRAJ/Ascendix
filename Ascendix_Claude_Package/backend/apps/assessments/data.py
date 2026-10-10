"""
Calibration question bank and topic definitions.
These assessments exist strictly to empirically calibrate student self-reported skills
and supply real verified metrics into the Placement Readiness Score.
"""

ASSESSMENT_TOPICS = [
    {
        "topic_id": "dbms",
        "title": "Database Management Systems (DBMS)",
        "category": "Core CS Subjects",
        "description": "SQL joins, ACID properties, normalization levels, indexing (B-Trees), and transaction isolation levels.",
        "icon": "Database",
        "estimated_minutes": 6,
        "question_count": 5,
        "calibrated_skills": ["DBMS", "SQL", "Databases"]
    },
    {
        "topic_id": "os",
        "title": "Operating Systems (OS)",
        "category": "Core CS Subjects",
        "description": "Process scheduling, thread concurrency, virtual memory & paging, deadlocks (Coffman conditions), and IPC.",
        "icon": "Cpu",
        "estimated_minutes": 6,
        "question_count": 5,
        "calibrated_skills": ["Operating Systems"]
    },
    {
        "topic_id": "cn",
        "title": "Computer Networks (CN)",
        "category": "Core CS Subjects",
        "description": "TCP vs UDP, OSI 7-layer architecture, 3-way handshake, DNS, HTTP/HTTPS protocols, and subnetting basics.",
        "icon": "Network",
        "estimated_minutes": 6,
        "question_count": 5,
        "calibrated_skills": ["Computer Networks"]
    },
    {
        "topic_id": "dsa",
        "title": "Data Structures & Core Algorithms",
        "category": "Core CS Subjects",
        "description": "Time/space asymptotic complexity, hashing collisions, balanced trees, graph BFS/DFS, and dynamic programming.",
        "icon": "Code2",
        "estimated_minutes": 7,
        "question_count": 5,
        "calibrated_skills": ["Data Structures & Algorithms"]
    },
    {
        "topic_id": "system-design",
        "title": "System Design Fundamentals",
        "category": "Core CS Subjects",
        "description": "Horizontal scaling, caching patterns (Redis), load balancer strategies, CAP theorem, and database partitioning.",
        "icon": "Layers",
        "estimated_minutes": 7,
        "question_count": 5,
        "calibrated_skills": ["System Design"]
    }
]

QUESTIONS_BANK = [
    # --- DBMS ---
    {
        "question_id": "dbms_1",
        "topic_id": "dbms",
        "question_text": "Which ACID property ensures that once a transaction has committed, its effects will not be lost even in the event of an abrupt system crash or power outage?",
        "options": [
            "Atomicity",
            "Consistency",
            "Isolation",
            "Durability"
        ],
        "correct_index": 3,
        "difficulty": "Easy",
        "explanation": "Durability guarantees that once a transaction completes successfully and commits, its changes survive permanently in non-volatile storage, even during system crashes."
    },
    {
        "question_id": "dbms_2",
        "topic_id": "dbms",
        "question_text": "A relational database table is in Third Normal Form (3NF) if and only if it is in 2NF and has no:",
        "options": [
            "Partial functional dependencies",
            "Transitive dependencies of non-prime attributes on the primary key",
            "Multi-valued dependencies",
            "Null attributes in the candidate key"
        ],
        "correct_index": 1,
        "difficulty": "Medium",
        "explanation": "2NF eliminates partial dependencies (dependencies on part of a composite key). 3NF eliminates transitive dependencies (X -> Y -> Z where Z is a non-prime attribute)."
    },
    {
        "question_id": "dbms_3",
        "topic_id": "dbms",
        "question_text": "Why are B+ Trees predominantly preferred over standard binary search trees or hash tables for indexing relational databases on disk storage?",
        "options": [
            "B+ Trees have O(1) worst-case search complexity",
            "B+ Trees have high fan-out, minimizing disk I/O operations, and support efficient range queries via leaf node pointers",
            "B+ Trees require zero memory overhead for maintenance",
            "B+ Trees prevent phantom reads without database locks"
        ],
        "correct_index": 1,
        "difficulty": "Medium",
        "explanation": "Disk access is several orders of magnitude slower than RAM. High fan-out reduces tree height (few disk page reads), and linked leaf nodes allow sequential range scanning."
    },
    {
        "question_id": "dbms_4",
        "topic_id": "dbms",
        "question_text": "Which SQL transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?",
        "options": [
            "Read Uncommitted",
            "Read Committed",
            "Repeatable Read",
            "Serializable"
        ],
        "correct_index": 2,
        "difficulty": "Hard",
        "explanation": "In standard ANSI SQL, Repeatable Read locks rows read by the transaction, preventing dirty and non-repeatable reads. However, newly inserted rows matching a range query (phantom rows) can still appear unless Serializable is used."
    },
    {
        "question_id": "dbms_5",
        "topic_id": "dbms",
        "question_text": "Consider two tables: Students (1000 rows) and Enrollments (5000 rows). What type of JOIN returns all records from Students along with matching rows from Enrollments, filling unmatched students with NULLs?",
        "options": [
            "INNER JOIN",
            "LEFT OUTER JOIN",
            "CROSS JOIN",
            "FULL OUTER JOIN"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "A LEFT OUTER JOIN preserves all rows from the left table (Students) regardless of whether a matching record exists in the right table (Enrollments)."
    },

    # --- OPERATING SYSTEMS ---
    {
        "question_id": "os_1",
        "topic_id": "os",
        "question_text": "Which of the following is NOT one of the four necessary Coffman conditions for a system deadlock to occur?",
        "options": [
            "Mutual Exclusion",
            "Hold and Wait",
            "Preemptive Scheduling",
            "Circular Wait"
        ],
        "correct_index": 2,
        "difficulty": "Medium",
        "explanation": "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive scheduling actually prevents or breaks deadlocks."
    },
    {
        "question_id": "os_2",
        "topic_id": "os",
        "question_text": "What occurs during a 'Thrashing' state in an operating system's virtual memory subsystem?",
        "options": [
            "The CPU spends excessive time swapping pages in and out of disk rather than executing application instructions",
            "The memory management unit permanently corrupts physical RAM blocks",
            "Processes deadlock because all memory pages are exclusively locked",
            "Disk cache buffers overflow due to DMA transfers"
        ],
        "correct_index": 0,
        "difficulty": "Medium",
        "explanation": "Thrashing occurs when the collective working set of running processes exceeds physical RAM capacity. The OS spends nearly all its CPU cycles handling page faults and disk I/O."
    },
    {
        "question_id": "os_3",
        "topic_id": "os",
        "question_text": "What key difference distinguishes a Thread from a Process in standard Unix/Linux architectures?",
        "options": [
            "Threads have independent memory address spaces, while processes share address spaces",
            "Threads within the same process share the heap, data, and code segments, but maintain separate stacks and registers",
            "Threads cannot execute concurrently across multiple CPU cores",
            "Process context switches are substantially faster than thread context switches"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "Threads in the same process share the virtual address space (heap, global variables, open file descriptors), but each thread has its own program counter, stack, and register set."
    },
    {
        "question_id": "os_4",
        "topic_id": "os",
        "question_text": "Which CPU scheduling algorithm is mathematically proven to guarantee the optimal minimum average waiting time for a set of stationary processes?",
        "options": [
            "First-Come, First-Served (FCFS)",
            "Round Robin (RR)",
            "Shortest Job First (SJF / SRTF)",
            "Priority Scheduling"
        ],
        "correct_index": 2,
        "difficulty": "Medium",
        "explanation": "Shortest Job First (SJF) schedules the shortest CPU burst first, mathematically minimizing average waiting time across all processes."
    },
    {
        "question_id": "os_5",
        "topic_id": "os",
        "question_text": "What hardware mechanism allows I/O devices (like network cards and storage drives) to transfer data directly to/from physical memory without continuous CPU intervention?",
        "options": [
            "Direct Memory Access (DMA)",
            "Translation Lookaside Buffer (TLB)",
            "Interrupt Vector Table (IVT)",
            "Programmed I/O (PIO)"
        ],
        "correct_index": 0,
        "difficulty": "Easy",
        "explanation": "DMA controllers transfer blocks of data between I/O peripherals and RAM directly, interrupting the CPU only when the entire data block transfer is complete."
    },

    # --- COMPUTER NETWORKS ---
    {
        "question_id": "cn_1",
        "topic_id": "cn",
        "question_text": "During the TCP 3-way handshake to establish a reliable connection between Client and Server, what is the exact packet sequence transmitted?",
        "options": [
            "ACK -> SYN -> SYN-ACK",
            "SYN -> SYN-ACK -> ACK",
            "SYN -> ACK -> DATA",
            "HELLO -> ACK -> ESTABLISHED"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "Client sends SYN(seq=x). Server responds with SYN-ACK(seq=y, ack=x+1). Client concludes with ACK(ack=y+1). Connection is then established."
    },
    {
        "question_id": "cn_2",
        "topic_id": "cn",
        "question_text": "At which layer of the OSI 7-Layer Reference Model does the IP (Internet Protocol) and packet routing operate?",
        "options": [
            "Data Link Layer (Layer 2)",
            "Network Layer (Layer 3)",
            "Transport Layer (Layer 4)",
            "Session Layer (Layer 5)"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "The Network Layer (Layer 3) handles logical IP addressing, packet forwarding, and path selection across diverse subnets."
    },
    {
        "question_id": "cn_3",
        "topic_id": "cn",
        "question_text": "Why does real-time audio and video conferencing typically employ UDP instead of TCP as the transport protocol?",
        "options": [
            "UDP enforces hardware-level encryption automatically",
            "UDP avoids retransmission delays and flow/congestion control overhead, favoring low latency over guaranteed packet arrival",
            "UDP packets cannot be dropped by intermediate routers",
            "TCP packets are strictly limited to 64 bytes"
        ],
        "correct_index": 1,
        "difficulty": "Medium",
        "explanation": "For live voice/video, receiving a late retransmitted packet is useless. UDP has zero handshake overhead and no retransmissions, guaranteeing minimal transmission latency."
    },
    {
        "question_id": "cn_4",
        "topic_id": "cn",
        "question_text": "What is the maximum number of usable host IP addresses in an IPv4 subnet with CIDR prefix /28?",
        "options": [
            "14",
            "16",
            "30",
            "32"
        ],
        "correct_index": 0,
        "difficulty": "Medium",
        "explanation": "A /28 subnet leaves 32 - 28 = 4 host bits. 2^4 = 16 total IPs. Subtracting the network address and broadcast address leaves 14 usable host IP addresses."
    },
    {
        "question_id": "cn_5",
        "topic_id": "cn",
        "question_text": "What security mechanism prevents man-in-the-middle attacks and establishes encrypted symmetric session keys in an HTTPS TLS handshake?",
        "options": [
            "X.509 Digital Certificates issued by trusted Certificate Authorities (CAs) and asymmetric public-key cryptography",
            "MD5 hashing of client IP headers",
            "DNSSEC record caching on local proxy servers",
            "TCP sequence number scrambling"
        ],
        "correct_index": 0,
        "difficulty": "Medium",
        "explanation": "TLS uses CA-signed X.509 digital certificates to authenticate the server's identity and asymmetric cryptography (RSA/ECC) to securely agree upon symmetric session keys for AES encryption."
    },

    # --- DATA STRUCTURES & ALGORITHMS ---
    {
        "question_id": "dsa_1",
        "topic_id": "dsa",
        "question_text": "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) containing N nodes?",
        "options": [
            "O(log N)",
            "O(N)",
            "O(N log N)",
            "O(1)"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "When elements are inserted in sorted order, an unbalanced BST degenerates into a linear linked list, yielding O(N) worst-case search complexity."
    },
    {
        "question_id": "dsa_2",
        "topic_id": "dsa",
        "question_text": "Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue and guarantees discovering the shortest path (in terms of edge count) in an unweighted graph?",
        "options": [
            "Depth-First Search (DFS)",
            "Breadth-First Search (BFS)",
            "Kruskal's Algorithm",
            "Tarjan's Algorithm"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "BFS explores nodes level by level using a queue, guaranteeing that the first time a destination node is visited, it is along the path with the minimum number of edges."
    },
    {
        "question_id": "dsa_3",
        "topic_id": "dsa",
        "question_text": "In a hash table employing separate chaining for collision resolution, what does average-case O(1) lookup performance primarily depend upon?",
        "options": [
            "Sorting the keys alphabetically before insertion",
            "A uniform hash function that evenly distributes keys and maintains a low load factor",
            "Pre-allocating a contiguous array of size 2^32",
            "Using binary search across linked chains"
        ],
        "correct_index": 1,
        "difficulty": "Medium",
        "explanation": "A good uniform hash function minimizes collision clustering. Combined with dynamic rehashing to keep the load factor (N/M) bounded, bucket chains stay O(1) in average length."
    },
    {
        "question_id": "dsa_4",
        "topic_id": "dsa",
        "question_text": "Which algorithm design paradigm breaks a problem into overlapping subproblems, solves each subproblem once, and caches the results to avoid redundant calculations?",
        "options": [
            "Greedy Approach",
            "Dynamic Programming (Memoization / Tabulation)",
            "Divide and Conquer",
            "Backtracking"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "Dynamic Programming is applicable when subproblems overlap and possess optimal substructure. Caching computed results (memoization) reduces exponential time to polynomial time."
    },
    {
        "question_id": "dsa_5",
        "topic_id": "dsa",
        "question_text": "What is the time complexity to build a binary Min-Heap of N unordered elements using the bottom-up heapify algorithm?",
        "options": [
            "O(N log N)",
            "O(N)",
            "O(N^2)",
            "O(log N)"
        ],
        "correct_index": 1,
        "difficulty": "Hard",
        "explanation": "Building a heap bottom-up via heapify takes O(N) time because most nodes are near the leaves and have short sift-down distances; the mathematical sum of (h / 2^h) converges to a constant."
    },

    # --- SYSTEM DESIGN ---
    {
        "question_id": "sd_1",
        "topic_id": "system-design",
        "question_text": "According to the CAP Theorem for distributed data stores, what two guarantees can a system provide simultaneously during a network partition (P)?",
        "options": [
            "Either Consistency (CP) or Availability (AP)",
            "Both Consistency and Availability simultaneously (CA)",
            "Performance and Durability",
            "Atomicity and Scalability"
        ],
        "correct_index": 0,
        "difficulty": "Medium",
        "explanation": "In a distributed system, network partitions (P) are unavoidable. When a partition occurs, the system must either reject writes to preserve Consistency (CP) or accept writes on split nodes to preserve Availability (AP)."
    },
    {
        "question_id": "sd_2",
        "topic_id": "system-design",
        "question_text": "In a high-throughput microservices architecture, what caching strategy writes data to the cache and the backing database concurrently in a single transaction?",
        "options": [
            "Cache-Aside (Lazy Loading)",
            "Write-Through Cache",
            "Write-Behind (Write-Back) Cache",
            "Refresh-Ahead Cache"
        ],
        "correct_index": 1,
        "difficulty": "Medium",
        "explanation": "In Write-Through caching, the application writes directly to the cache, and the cache synchronously writes to the primary database before confirming success, ensuring cache and DB are never stale."
    },
    {
        "question_id": "sd_3",
        "topic_id": "system-design",
        "question_text": "What architectural technique distributes incoming client HTTP traffic across multiple backend web server instances based on server health, round-robin, or least-connections?",
        "options": [
            "Database Replication",
            "Reverse Proxy / Load Balancer",
            "Distributed Hash Table",
            "Message Broker"
        ],
        "correct_index": 1,
        "difficulty": "Easy",
        "explanation": "A Load Balancer (such as NGINX, HAProxy, or AWS ALB) acts as a reverse proxy, distributing requests across healthy application servers to prevent hotspots and provide high availability."
    },
    {
        "question_id": "sd_4",
        "topic_id": "system-design",
        "question_text": "What database scaling strategy splits a massive table horizontally across multiple separate database servers based on a shard key (e.g. user_id % N)?",
        "options": [
            "Database Sharding (Horizontal Partitioning)",
            "Vertical Scaling (Scale-Up)",
            "Read-Replica Clustering",
            "Normalization"
        ],
        "correct_index": 0,
        "difficulty": "Medium",
        "explanation": "Sharding distributes rows horizontally across independent physical databases by a shard key, enabling horizontal write and storage scalability beyond single-server hardware limits."
    },
    {
        "question_id": "sd_5",
        "topic_id": "system-design",
        "question_text": "Why are asynchronous message queues (e.g., Apache Kafka, RabbitMQ) recommended between decoupled services in microservices architectures?",
        "options": [
            "They eliminate all network latency between services",
            "They buffer bursty traffic, decouple service lifecycles, and prevent cascading downstream failures via asynchronous processing",
            "They automatically optimize relational SQL join queries",
            "They replace the need for persistent databases"
        ],
        "correct_index": 1,
        "difficulty": "Medium",
        "explanation": "Message queues provide rate leveling, absorb unpredictable spikes, and decouple producers from consumers, preventing downstream slowdowns from crashing upstream services."
    }
]

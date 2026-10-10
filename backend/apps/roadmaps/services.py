import datetime
import uuid

class RoadmapService:
    """
    Personalized Roadmap Synthesis Engine:
    Dynamically sequences week-by-week topic milestones directly from
    the student's evaluated skill gaps, prioritizing critical blockers first.
    """

    # Structured curriculum modules mapped to skills
    TOPIC_CURRICULUM = {
        "data structures & algorithms": {
            "theme": "Data Structures & Algorithmic Foundations",
            "tasks": [
                {
                    "title": "Arrays, Strings & Two-Pointer Techniques",
                    "difficulty": "Beginner",
                    "estimated_hours": 4,
                    "subtopics": ["Array operations & prefix sums", "Two-pointer pattern", "Sliding window technique", "String manipulation"],
                    "recommended_action": "Implement sliding window and two-pointer solutions on 5 core array problems."
                },
                {
                    "title": "Hash Maps, Sets & Frequency Counting",
                    "difficulty": "Beginner",
                    "estimated_hours": 3,
                    "subtopics": ["Hash collision resolution", "Frequency map lookup", "Two-sum pattern", "Anagram & substring checks"],
                    "recommended_action": "Master O(1) average lookup patterns using Hash Tables."
                },
                {
                    "title": "Linked Lists, Stacks & Queues",
                    "difficulty": "Intermediate",
                    "estimated_hours": 5,
                    "subtopics": ["Fast & slow pointers (cycle detection)", "Reversing linked lists", "Monotonic stack pattern", "Queue with two stacks"],
                    "recommended_action": "Implement reverse linked list in-place and monotonic stack for next greater element."
                },
                {
                    "title": "Binary Trees & Graph Traversals (BFS / DFS)",
                    "difficulty": "Advanced",
                    "estimated_hours": 6,
                    "subtopics": ["Tree traversals (Inorder, Preorder, Level-order)", "Binary Search Trees", "Graph representations", "BFS shortest path & DFS recursion"],
                    "recommended_action": "Practice BFS level-order traversal and DFS recursion on binary trees."
                }
            ]
        },
        "dbms": {
            "theme": "Database Systems, SQL & Transactional Integrity",
            "tasks": [
                {
                    "title": "Relational Data Modeling & Normalization",
                    "difficulty": "Beginner",
                    "estimated_hours": 4,
                    "subtopics": ["1NF, 2NF, 3NF & BCNF", "Primary, Foreign & Candidate keys", "Functional dependencies", "Anomalies prevention"],
                    "recommended_action": "Work through decomposition of unnormalized tables up to 3NF."
                },
                {
                    "title": "Complex SQL Queries & Joins",
                    "difficulty": "Intermediate",
                    "estimated_hours": 4,
                    "subtopics": ["INNER, LEFT, RIGHT, FULL OUTER joins", "GROUP BY, HAVING, Aggregate functions", "Window functions (ROW_NUMBER, RANK)", "Correlated subqueries"],
                    "recommended_action": "Write multi-table join queries and calculate running totals using window functions."
                },
                {
                    "title": "ACID Properties & Transaction Management",
                    "difficulty": "Intermediate",
                    "estimated_hours": 3,
                    "subtopics": ["Atomicity, Consistency, Isolation, Durability", "Transaction isolation levels", "Dirty reads, Non-repeatable reads, Phantom reads", "Write-Ahead Logging"],
                    "recommended_action": "Understand transaction isolation tradeoffs and deadlock prevention."
                },
                {
                    "title": "Indexing & Query Optimization",
                    "difficulty": "Advanced",
                    "estimated_hours": 3,
                    "subtopics": ["B-Tree & Hash index internals", "Clustered vs Non-clustered indexes", "EXPLAIN query execution plans", "Index cardinality"],
                    "recommended_action": "Analyze query execution plans to identify table scans vs index lookups."
                }
            ]
        },
        "computer networks": {
            "theme": "Computer Networks, Protocols & Web Architecture",
            "tasks": [
                {
                    "title": "OSI & TCP/IP Model Layers",
                    "difficulty": "Beginner",
                    "estimated_hours": 3,
                    "subtopics": ["Physical to Application layer mapping", "Encapsulation & decapsulation", "MAC addresses vs IP addresses", "Subnetting basics"],
                    "recommended_action": "Memorize the responsibilities and protocol assignments across the 7 OSI layers."
                },
                {
                    "title": "Transport Layer Protocols (TCP vs UDP)",
                    "difficulty": "Intermediate",
                    "estimated_hours": 4,
                    "subtopics": ["TCP 3-Way Handshake & 4-Way Termination", "Flow control & Sliding window", "Congestion control (Slow start)", "UDP datagrams vs TCP streams"],
                    "recommended_action": "Trace packet flow during TCP connection establishment and teardown."
                },
                {
                    "title": "Application Layer: HTTP/HTTPS, DNS & Web Sockets",
                    "difficulty": "Intermediate",
                    "estimated_hours": 4,
                    "subtopics": ["HTTP methods, status codes (2xx, 3xx, 4xx, 5xx)", "TLS/SSL handshake & certificate verification", "DNS hierarchical resolution", "WebSocket bidirectional streams"],
                    "recommended_action": "Explain the step-by-step lifecycle of what happens when typing a URL into a browser."
                },
                {
                    "title": "Network Security & Routing Basics",
                    "difficulty": "Advanced",
                    "estimated_hours": 3,
                    "subtopics": ["Firewalls & NAT (Network Address Translation)", "Routing algorithms (Link State vs Distance Vector)", "DDoS attacks & mitigation", "CORS & Content Security Policies"],
                    "recommended_action": "Review NAT translation tables and modern browser CORS negotiation."
                }
            ]
        },
        "operating systems": {
            "theme": "Operating Systems, Concurrency & Memory Architecture",
            "tasks": [
                {
                    "title": "Processes, Threads & CPU Scheduling",
                    "difficulty": "Beginner",
                    "estimated_hours": 4,
                    "subtopics": ["Process state transitions", "User vs Kernel mode", "Round Robin, FCFS, Priority scheduling", "Context switching overhead"],
                    "recommended_action": "Calculate average turnaround and waiting times for Round Robin scheduling."
                },
                {
                    "title": "Concurrency, Synchronization & Deadlocks",
                    "difficulty": "Intermediate",
                    "estimated_hours": 5,
                    "subtopics": ["Critical section problem", "Mutexes, Semaphores & Spinlocks", "4 Necessary conditions for deadlock", "Banker's Algorithm & deadlock avoidance"],
                    "recommended_action": "Implement a producer-consumer synchronization pattern using semaphores."
                },
                {
                    "title": "Memory Management & Virtual Memory",
                    "difficulty": "Advanced",
                    "estimated_hours": 4,
                    "subtopics": ["Paging & Segmentation", "Page tables & TLB (Translation Lookaside Buffer)", "Virtual memory & Page faults", "Page replacement (LRU, FIFO, Optimal)"],
                    "recommended_action": "Trace address translation through page tables and calculate TLB hit ratios."
                }
            ]
        },
        "system design": {
            "theme": "High-Level System Design & Scalability Principles",
            "tasks": [
                {
                    "title": "Scalability, Caching & Load Balancing",
                    "difficulty": "Intermediate",
                    "estimated_hours": 4,
                    "subtopics": ["Vertical vs Horizontal scaling", "Load balancing algorithms", "Caching strategies (Write-through, Cache-aside)", "CDN architecture"],
                    "recommended_action": "Design a scalable rate limiter or URL shortener architecture."
                },
                {
                    "title": "Database Scaling: Sharding, Replication & CAP Theorem",
                    "difficulty": "Advanced",
                    "estimated_hours": 4,
                    "subtopics": ["Master-Slave replication", "Horizontal sharding strategies", "CAP theorem & PACELC", "Eventual consistency vs Strong consistency"],
                    "recommended_action": "Explain tradeoffs between Consistency and Availability in distributed stores."
                }
            ]
        }
    }

    @classmethod
    def get_curriculum_for_skill(cls, skill_name: str) -> dict:
        normalized = skill_name.strip().lower()
        for key, curr in cls.TOPIC_CURRICULUM.items():
            if key in normalized or normalized in key:
                return curr

        # Fallback generic module for specific skills
        return {
            "theme": f"{skill_name} Mastery & Core Competencies",
            "tasks": [
                {
                    "title": f"{skill_name} Foundations & Syntax",
                    "difficulty": "Beginner",
                    "estimated_hours": 3,
                    "subtopics": [f"Core {skill_name} fundamentals", "Standard patterns", "Best practices"],
                    "recommended_action": f"Review standard conventions and core libraries in {skill_name}."
                },
                {
                    "title": f"Applied {skill_name} Projects & Integration",
                    "difficulty": "Intermediate",
                    "estimated_hours": 4,
                    "subtopics": ["Architecture patterns", "Error handling & testing", "Performance considerations"],
                    "recommended_action": f"Build a practical implementation project highlighting {skill_name}."
                }
            ]
        }

    @classmethod
    def generate_roadmap(cls, gap_analysis: dict, existing_roadmap: dict = None) -> dict:
        """
        Synthesizes a 4-week prioritized roadmap from the student's actual gaps.
        Preserves task completion states if a roadmap already exists!
        """
        gap_items = gap_analysis.get("gap_items", [])
        
        # Filter for skills with an actual deficiency (exclude Satisfied P4 skills)
        deficiencies = [g for g in gap_items if g.get("gap_size") != "None"]

        # Prioritize P1 first, then P2, P3
        priority_rank = {"P1": 1, "P2": 2, "P3": 3}
        deficiencies.sort(key=lambda x: (priority_rank.get(x.get("priority"), 9), -x.get("delta", 0)))

        # Build map of completed tasks if re-generating
        completed_task_ids = set()
        if existing_roadmap and "weeks" in existing_roadmap:
            for w in existing_roadmap["weeks"]:
                for t in w.get("tasks", []):
                    if t.get("is_completed"):
                        completed_task_ids.add(t.get("title"))

        weeks_plan = []
        task_id_counter = 1

        # We schedule 4 structured preparation weeks
        # Week 1: Top priority blocker
        # Week 2: Second priority gap
        # Week 3: Third priority gap or deep-dive
        # Week 4: System Design & Mock Interview Review

        target_skills_for_weeks = []
        if len(deficiencies) >= 3:
            target_skills_for_weeks = [
                deficiencies[0]["skill_name"],
                deficiencies[1]["skill_name"],
                deficiencies[2]["skill_name"],
                "System Design & Mock Placement Review"
            ]
        elif len(deficiencies) == 2:
            target_skills_for_weeks = [
                deficiencies[0]["skill_name"],
                deficiencies[1]["skill_name"],
                "Operating Systems & Concurrency",
                "System Design & Mock Placement Review"
            ]
        elif len(deficiencies) == 1:
            target_skills_for_weeks = [
                deficiencies[0]["skill_name"],
                "Data Structures & Algorithms",
                "DBMS & Database Architecture",
                "System Design & Mock Placement Review"
            ]
        else:
            # Student already meets benchmarks; provide advanced polish roadmap
            target_skills_for_weeks = [
                "Advanced Data Structures & Algorithms",
                "Database Tuning & High-Availability",
                "Operating Systems & Distributed Networking",
                "System Design & Mock Placement Review"
            ]

        all_tasks = []
        for week_idx, focus_skill in enumerate(target_skills_for_weeks, start=1):
            curr = cls.get_curriculum_for_skill(focus_skill)
            week_tasks = []

            for task_template in curr["tasks"]:
                task_id = f"task_{week_idx}_{task_id_counter}"
                task_id_counter += 1
                
                # Check if this task was previously marked completed
                was_completed = task_template["title"] in completed_task_ids

                task_obj = {
                    "task_id": task_id,
                    "week_number": week_idx,
                    "title": task_template["title"],
                    "focus_skill": focus_skill,
                    "difficulty": task_template["difficulty"],
                    "estimated_hours": task_template["estimated_hours"],
                    "subtopics": task_template["subtopics"],
                    "recommended_action": task_template["recommended_action"],
                    "is_completed": was_completed,
                    "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat() if was_completed else None
                }
                week_tasks.append(task_obj)
                all_tasks.append(task_obj)

            weeks_plan.append({
                "week_number": week_idx,
                "theme": curr["theme"],
                "focus_skill": focus_skill,
                "task_count": len(week_tasks),
                "tasks": week_tasks
            })

        total_tasks = len(all_tasks)
        completed_count = sum(1 for t in all_tasks if t["is_completed"])
        completion_percentage = int((completed_count / total_tasks) * 100) if total_tasks > 0 else 0

        now = datetime.datetime.now(datetime.timezone.utc)

        return {
            "target_role_id": gap_analysis.get("target_role_id"),
            "target_role_title": gap_analysis.get("target_role_title"),
            "total_weeks": 4,
            "total_tasks": total_tasks,
            "completed_tasks": completed_count,
            "completion_percentage": completion_percentage,
            "weeks": weeks_plan,
            "generated_at": now
        }

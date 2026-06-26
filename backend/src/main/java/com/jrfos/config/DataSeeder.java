package com.jrfos.config;

import com.jrfos.entity.Subject;
import com.jrfos.entity.Subtopic;
import com.jrfos.entity.Topic;
import com.jrfos.enums.MasteryLevel;
import com.jrfos.enums.PaperType;
import com.jrfos.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the database with the complete UGC NET Computer Science syllabus
 * on first application startup (only when the subjects table is empty).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (subjectRepository.count() > 0) {
            log.info("Database already seeded. Skipping data initialization.");
            return;
        }

        log.info("Seeding database with UGC NET Computer Science syllabus...");

        List<Subject> subjects = new ArrayList<>();
        subjects.addAll(createPaperISubjects());
        subjects.addAll(createPaperIISubjects());

        subjectRepository.saveAll(subjects);
        log.info("Successfully seeded {} subjects into the database.", subjects.size());
    }

    /**
     * Creates all Paper I subjects with their topics and subtopics.
     */
    private List<Subject> createPaperISubjects() {
        List<Subject> subjects = new ArrayList<>();

        // 1. Teaching Aptitude
        subjects.add(createSubject("Teaching Aptitude", PaperType.PAPER_I,
                "Understanding of teaching concepts, objectives, and methodologies", 1,
                List.of(
                        createTopicWithSubtopics("Teaching Concept", 1, List.of()),
                        createTopicWithSubtopics("Objectives of Teaching", 2, List.of()),
                        createTopicWithSubtopics("Levels of Teaching", 3, List.of()),
                        createTopicWithSubtopics("Teaching Characteristics", 4, List.of()),
                        createTopicWithSubtopics("Learner Characteristics", 5, List.of()),
                        createTopicWithSubtopics("Factors Affecting Teaching", 6, List.of()),
                        createTopicWithSubtopics("Methods of Teaching", 7, List.of()),
                        createTopicWithSubtopics("Teaching Aids", 8, List.of()),
                        createTopicWithSubtopics("Evaluation Systems", 9, List.of())
                )));

        // 2. Research Aptitude
        subjects.add(createSubject("Research Aptitude", PaperType.PAPER_I,
                "Research methodology, ethics, and academic writing", 2,
                List.of(
                        createTopicWithSubtopics("Research Meaning, Objectives, and Types", 1, List.of()),
                        createTopicWithSubtopics("Steps of Research", 2, List.of()),
                        createTopicWithSubtopics("Methods of Research", 3, List.of()),
                        createTopicWithSubtopics("Research Ethics", 4, List.of()),
                        createTopicWithSubtopics("Thesis, Article, and Conference Paper Writing", 5, List.of()),
                        createTopicWithSubtopics("Research Tools", 6, List.of())
                )));

        // 3. Comprehension
        subjects.add(createSubject("Comprehension", PaperType.PAPER_I,
                "Reading comprehension and passage analysis", 3,
                List.of(
                        createTopicWithSubtopics("Reading Comprehension Passages", 1, List.of())
                )));

        // 4. Communication
        subjects.add(createSubject("Communication", PaperType.PAPER_I,
                "Communication skills, media, and technology", 4,
                List.of(
                        createTopicWithSubtopics("Communication Meaning, Types, and Characteristics", 1, List.of()),
                        createTopicWithSubtopics("Effective Communication", 2, List.of()),
                        createTopicWithSubtopics("Barriers to Communication", 3, List.of()),
                        createTopicWithSubtopics("Mass Media", 4, List.of()),
                        createTopicWithSubtopics("Communication Technologies", 5, List.of())
                )));

        // 5. Mathematical Reasoning & Aptitude
        subjects.add(createSubject("Mathematical Reasoning & Aptitude", PaperType.PAPER_I,
                "Logical and mathematical problem solving", 5,
                List.of(
                        createTopicWithSubtopics("Types of Reasoning", 1, List.of()),
                        createTopicWithSubtopics("Number Series", 2, List.of()),
                        createTopicWithSubtopics("Letter Series", 3, List.of()),
                        createTopicWithSubtopics("Coding and Decoding", 4, List.of()),
                        createTopicWithSubtopics("Mathematical Aptitude", 5, List.of())
                )));

        // 6. Logical Reasoning
        subjects.add(createSubject("Logical Reasoning", PaperType.PAPER_I,
                "Understanding arguments, Venn diagrams, and analogies", 6,
                List.of(
                        createTopicWithSubtopics("Understanding Logical Arguments", 1, List.of()),
                        createTopicWithSubtopics("Venn Diagrams", 2, List.of()),
                        createTopicWithSubtopics("Indian Logic", 3, List.of()),
                        createTopicWithSubtopics("Analogies", 4, List.of())
                )));

        // 7. Data Interpretation
        subjects.add(createSubject("Data Interpretation", PaperType.PAPER_I,
                "Data analysis, graphical representation, and interpretation", 7,
                List.of(
                        createTopicWithSubtopics("Sources of Data", 1, List.of()),
                        createTopicWithSubtopics("Data Analysis", 2, List.of()),
                        createTopicWithSubtopics("Graphical Representation", 3, List.of()),
                        createTopicWithSubtopics("Data Interpretation", 4, List.of())
                )));

        // 8. Information & Communication Technology
        subjects.add(createSubject("Information & Communication Technology", PaperType.PAPER_I,
                "ICT fundamentals, tools, and e-governance", 8,
                List.of(
                        createTopicWithSubtopics("ICT Meaning, Advantages, and Disadvantages", 1, List.of()),
                        createTopicWithSubtopics("General ICT Tools", 2, List.of()),
                        createTopicWithSubtopics("E-Governance", 3, List.of())
                )));

        // 9. People, Development & Environment
        subjects.add(createSubject("People, Development & Environment", PaperType.PAPER_I,
                "Sustainable development, environmental issues, and policies", 9,
                List.of(
                        createTopicWithSubtopics("Development and Environment Interaction", 1, List.of()),
                        createTopicWithSubtopics("Sustainable Development", 2, List.of()),
                        createTopicWithSubtopics("Environmental Issues", 3, List.of()),
                        createTopicWithSubtopics("Natural Hazards", 4, List.of()),
                        createTopicWithSubtopics("Government Policies", 5, List.of())
                )));

        // 10. Higher Education System
        subjects.add(createSubject("Higher Education System", PaperType.PAPER_I,
                "Indian higher education institutions, governance, and regulatory bodies", 10,
                List.of(
                        createTopicWithSubtopics("Institutions of Higher Education", 1, List.of()),
                        createTopicWithSubtopics("Professional and Regulatory Bodies", 2, List.of()),
                        createTopicWithSubtopics("UGC, NAAC, and NIRF", 3, List.of()),
                        createTopicWithSubtopics("Educational Governance", 4, List.of())
                )));

        return subjects;
    }

    /**
     * Creates all Paper II subjects with their topics and subtopics.
     */
    private List<Subject> createPaperIISubjects() {
        List<Subject> subjects = new ArrayList<>();

        // 1. Discrete Structures and Optimization
        subjects.add(createSubject("Discrete Structures and Optimization", PaperType.PAPER_II,
                "Mathematical foundations including sets, logic, graphs, and optimization", 1,
                List.of(
                        createTopicWithSubtopics("Sets, Relations, and Functions", 1,
                                List.of("Set operations", "Types of relations", "Types of functions", "Composition of functions")),
                        createTopicWithSubtopics("Propositional Logic", 2,
                                List.of("Propositions and connectives", "Truth tables", "Tautology and contradiction", "Logical equivalence")),
                        createTopicWithSubtopics("Predicate Logic", 3,
                                List.of("Quantifiers", "Free and bound variables", "Inference rules")),
                        createTopicWithSubtopics("Boolean Algebra", 4,
                                List.of("Boolean functions", "Simplification", "Karnaugh maps")),
                        createTopicWithSubtopics("Graph Theory", 5,
                                List.of("Graph terminology", "Graph types", "Euler and Hamiltonian graphs", "Graph coloring", "Planar graphs")),
                        createTopicWithSubtopics("Trees", 6,
                                List.of("Tree properties", "Spanning trees", "Binary trees", "Tree traversals")),
                        createTopicWithSubtopics("Combinatorics", 7,
                                List.of("Permutations", "Combinations", "Pigeonhole principle", "Inclusion-exclusion")),
                        createTopicWithSubtopics("Recurrence Relations", 8,
                                List.of("Linear recurrence", "Solving recurrence relations", "Generating functions")),
                        createTopicWithSubtopics("Optimization Methods", 9,
                                List.of("Linear programming", "Simplex method", "Transportation problem", "Assignment problem"))
                )));

        // 2. Computer System Architecture
        subjects.add(createSubject("Computer System Architecture", PaperType.PAPER_II,
                "Digital logic, processor design, memory and I/O organization", 2,
                List.of(
                        createTopicWithSubtopics("Digital Logic Circuits", 1,
                                List.of("Logic gates", "Combinational circuits", "Sequential circuits", "Flip-flops", "Counters and registers")),
                        createTopicWithSubtopics("Number Representation", 2,
                                List.of("Binary number system", "Signed number representation", "Floating point representation", "Fixed point arithmetic")),
                        createTopicWithSubtopics("Processor Design", 3,
                                List.of("ALU design", "Register organization", "Instruction set architecture", "Addressing modes")),
                        createTopicWithSubtopics("Control Unit Design", 4,
                                List.of("Hardwired control", "Microprogrammed control", "Microinstruction sequencing")),
                        createTopicWithSubtopics("Memory Organization", 5,
                                List.of("Memory hierarchy", "Cache memory", "Virtual memory", "Memory management unit")),
                        createTopicWithSubtopics("I/O Organization", 6,
                                List.of("I/O interfaces", "Programmed I/O", "Interrupt-driven I/O", "DMA")),
                        createTopicWithSubtopics("Pipelining", 7,
                                List.of("Pipeline stages", "Pipeline hazards", "Hazard resolution")),
                        createTopicWithSubtopics("Parallel Processing", 8,
                                List.of("Flynn classification", "Multiprocessor architectures", "Interconnection networks"))
                )));

        // 3. Programming Languages and Computer Graphics
        subjects.add(createSubject("Programming Languages and Computer Graphics", PaperType.PAPER_II,
                "Language design, programming paradigms, and graphics fundamentals", 3,
                List.of(
                        createTopicWithSubtopics("Language Design Issues", 1,
                                List.of("Syntax and semantics", "Language evaluation criteria", "Language categories")),
                        createTopicWithSubtopics("Programming Paradigms", 2,
                                List.of("Imperative programming", "Functional programming", "Logic programming", "Scripting languages")),
                        createTopicWithSubtopics("Data Types", 3,
                                List.of("Primitive types", "Structured types", "Type checking", "Type conversion")),
                        createTopicWithSubtopics("Control Structures", 4,
                                List.of("Selection statements", "Iterative statements", "Subprogram control")),
                        createTopicWithSubtopics("OOP Concepts", 5,
                                List.of("Classes and objects", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction")),
                        createTopicWithSubtopics("Exception Handling", 6,
                                List.of("Exception types", "Try-catch mechanisms", "Exception propagation")),
                        createTopicWithSubtopics("2D and 3D Transformations", 7,
                                List.of("Translation", "Rotation", "Scaling", "Composite transformations", "Homogeneous coordinates")),
                        createTopicWithSubtopics("Projection", 8,
                                List.of("Parallel projection", "Perspective projection", "Viewing pipeline")),
                        createTopicWithSubtopics("Rendering", 9,
                                List.of("Visible surface detection", "Illumination models", "Shading techniques", "Ray tracing basics"))
                )));

        // 4. Database Management Systems
        subjects.add(createSubject("Database Management Systems", PaperType.PAPER_II,
                "Database design, SQL, normalization, and transaction management", 4,
                List.of(
                        createTopicWithSubtopics("ER Model", 1,
                                List.of("Entities and attributes", "Relationships", "ER diagram notation", "Extended ER model")),
                        createTopicWithSubtopics("Relational Model", 2,
                                List.of("Relational algebra", "Relational calculus", "Keys and constraints", "Integrity constraints")),
                        createTopicWithSubtopics("SQL", 3,
                                List.of("DDL statements", "DML statements", "Joins and subqueries", "Views and indexes", "Aggregate functions")),
                        createTopicWithSubtopics("Normalization", 4,
                                List.of("Functional dependencies", "1NF, 2NF, 3NF", "BCNF", "Multivalued dependencies", "4NF and 5NF")),
                        createTopicWithSubtopics("Transaction Processing", 5,
                                List.of("ACID properties", "Transaction states", "Serializability", "Schedule types")),
                        createTopicWithSubtopics("Concurrency Control", 6,
                                List.of("Lock-based protocols", "Timestamp-based protocols", "Deadlock handling")),
                        createTopicWithSubtopics("Recovery", 7,
                                List.of("Log-based recovery", "Checkpointing", "Shadow paging")),
                        createTopicWithSubtopics("NoSQL Basics", 8,
                                List.of("NoSQL data models", "Key-value stores", "Document databases", "CAP theorem"))
                )));

        // 5. System Software and Operating System
        subjects.add(createSubject("System Software and Operating System", PaperType.PAPER_II,
                "System software tools and operating system concepts", 5,
                List.of(
                        createTopicWithSubtopics("Assemblers", 1,
                                List.of("One-pass assembler", "Two-pass assembler", "Assembly language features")),
                        createTopicWithSubtopics("Linkers and Loaders", 2,
                                List.of("Linking process", "Loading schemes", "Dynamic linking")),
                        createTopicWithSubtopics("Compilers", 3,
                                List.of("Lexical analysis", "Syntax analysis", "Semantic analysis", "Code generation", "Code optimization")),
                        createTopicWithSubtopics("Process Management", 4,
                                List.of("Process concept", "Process scheduling", "CPU scheduling algorithms", "Threads", "Inter-process communication")),
                        createTopicWithSubtopics("Memory Management", 5,
                                List.of("Contiguous allocation", "Paging", "Segmentation", "Virtual memory", "Page replacement algorithms")),
                        createTopicWithSubtopics("File Systems", 6,
                                List.of("File organization", "Directory structure", "File allocation methods", "Free space management")),
                        createTopicWithSubtopics("I/O Management", 7,
                                List.of("I/O scheduling", "Disk scheduling algorithms", "RAID", "Buffering and caching")),
                        createTopicWithSubtopics("Deadlocks", 8,
                                List.of("Deadlock characterization", "Deadlock prevention", "Deadlock avoidance", "Deadlock detection and recovery")),
                        createTopicWithSubtopics("Protection and Security", 9,
                                List.of("Access control", "Authentication", "Security threats", "Encryption basics"))
                )));

        // 6. Software Engineering
        subjects.add(createSubject("Software Engineering", PaperType.PAPER_II,
                "Software development processes, design, testing, and project management", 6,
                List.of(
                        createTopicWithSubtopics("Software Process Models", 1,
                                List.of("Waterfall model", "Iterative models", "Spiral model", "V-model", "Prototyping")),
                        createTopicWithSubtopics("Requirements Engineering", 2,
                                List.of("Requirements elicitation", "Requirements analysis", "Requirements specification", "Requirements validation")),
                        createTopicWithSubtopics("Software Design", 3,
                                List.of("Design principles", "Architectural design", "Component-level design", "Design patterns", "UML diagrams")),
                        createTopicWithSubtopics("Coding Practices", 4,
                                List.of("Coding standards", "Code reviews", "Refactoring", "Clean code principles")),
                        createTopicWithSubtopics("Testing Strategies", 5,
                                List.of("Unit testing", "Integration testing", "System testing", "Acceptance testing", "Regression testing")),
                        createTopicWithSubtopics("Software Quality", 6,
                                List.of("Quality metrics", "Quality assurance", "CMMI", "ISO standards")),
                        createTopicWithSubtopics("Project Management", 7,
                                List.of("Project planning", "Risk management", "Effort estimation", "COCOMO model", "Function point analysis")),
                        createTopicWithSubtopics("Agile Methodologies", 8,
                                List.of("Scrum", "Kanban", "Extreme programming", "Agile principles")),
                        createTopicWithSubtopics("DevOps Basics", 9,
                                List.of("CI/CD pipelines", "Containerization", "Infrastructure as code", "Monitoring"))
                )));

        // 7. Data Structures and Algorithms
        subjects.add(createSubject("Data Structures and Algorithms", PaperType.PAPER_II,
                "Fundamental data structures, algorithms, and complexity analysis", 7,
                List.of(
                        createTopicWithSubtopics("Arrays", 1,
                                List.of("Array operations", "Multidimensional arrays", "Sparse arrays")),
                        createTopicWithSubtopics("Linked Lists", 2,
                                List.of("Singly linked list", "Doubly linked list", "Circular linked list", "Linked list operations")),
                        createTopicWithSubtopics("Stacks", 3,
                                List.of("Stack operations", "Stack applications", "Expression evaluation", "Infix to postfix conversion")),
                        createTopicWithSubtopics("Queues", 4,
                                List.of("Queue operations", "Circular queue", "Priority queue", "Deque")),
                        createTopicWithSubtopics("Trees", 5,
                                List.of("Binary tree", "Binary search tree", "AVL tree", "B-tree", "Heap", "Tree traversals")),
                        createTopicWithSubtopics("Graphs", 6,
                                List.of("Graph representations", "BFS and DFS", "Shortest path algorithms", "Minimum spanning tree", "Topological sorting")),
                        createTopicWithSubtopics("Hashing", 7,
                                List.of("Hash functions", "Collision resolution", "Open addressing", "Chaining")),
                        createTopicWithSubtopics("Sorting Algorithms", 8,
                                List.of("Bubble sort", "Selection sort", "Insertion sort", "Merge sort", "Quick sort", "Heap sort", "Radix sort")),
                        createTopicWithSubtopics("Searching Algorithms", 9,
                                List.of("Linear search", "Binary search", "Interpolation search")),
                        createTopicWithSubtopics("Algorithm Design Techniques", 10,
                                List.of("Divide and conquer", "Greedy algorithms", "Dynamic programming", "Backtracking", "Branch and bound")),
                        createTopicWithSubtopics("Complexity Analysis", 11,
                                List.of("Big-O notation", "Big-Omega notation", "Big-Theta notation", "Time complexity analysis", "Space complexity analysis")),
                        createTopicWithSubtopics("NP-Completeness", 12,
                                List.of("P vs NP", "NP-complete problems", "NP-hard problems", "Reduction techniques"))
                )));

        // 8. Theory of Computation
        subjects.add(createSubject("Theory of Computation", PaperType.PAPER_II,
                "Formal languages, automata theory, and computability", 8,
                List.of(
                        createTopicWithSubtopics("Regular Languages", 1,
                                List.of("Regular expressions", "Properties of regular languages", "Pumping lemma for regular languages", "Closure properties")),
                        createTopicWithSubtopics("Finite Automata", 2,
                                List.of("DFA", "NFA", "NFA to DFA conversion", "Minimization of DFA", "Equivalence of automata")),
                        createTopicWithSubtopics("Context-Free Grammars", 3,
                                List.of("CFG definition", "Parse trees", "Ambiguity", "Simplification of CFG", "Normal forms (CNF, GNF)")),
                        createTopicWithSubtopics("Pushdown Automata", 4,
                                List.of("PDA definition", "Deterministic PDA", "PDA and CFG equivalence")),
                        createTopicWithSubtopics("Turing Machines", 5,
                                List.of("TM definition", "TM variants", "Universal Turing machine", "Church-Turing thesis")),
                        createTopicWithSubtopics("Undecidability", 6,
                                List.of("Halting problem", "Rice theorem", "Reducibility", "Undecidable languages")),
                        createTopicWithSubtopics("Complexity Classes", 7,
                                List.of("P class", "NP class", "Co-NP", "PSPACE", "Polynomial hierarchy"))
                )));

        // 9. Artificial Intelligence
        subjects.add(createSubject("Artificial Intelligence", PaperType.PAPER_II,
                "AI techniques including search, knowledge representation, and machine learning", 9,
                List.of(
                        createTopicWithSubtopics("Search Methods", 1,
                                List.of("Uninformed search (BFS, DFS, IDDFS)", "Informed search (A*, heuristic search)", "Hill climbing", "Simulated annealing", "Genetic algorithms")),
                        createTopicWithSubtopics("Knowledge Representation", 2,
                                List.of("Propositional logic", "First-order logic", "Semantic networks", "Frames", "Ontologies")),
                        createTopicWithSubtopics("Planning", 3,
                                List.of("STRIPS", "Partial-order planning", "Planning graphs", "Hierarchical planning")),
                        createTopicWithSubtopics("Natural Language Processing", 4,
                                List.of("Syntax analysis", "Semantic analysis", "Language models", "Text classification")),
                        createTopicWithSubtopics("Expert Systems", 5,
                                List.of("Rule-based systems", "Inference engines", "Knowledge acquisition", "Expert system architecture")),
                        createTopicWithSubtopics("Machine Learning Basics", 6,
                                List.of("Supervised learning", "Unsupervised learning", "Reinforcement learning", "Decision trees", "k-NN", "SVM basics")),
                        createTopicWithSubtopics("Neural Networks", 7,
                                List.of("Perceptron", "Multilayer networks", "Backpropagation", "Activation functions", "Deep learning basics")),
                        createTopicWithSubtopics("Fuzzy Logic", 8,
                                List.of("Fuzzy sets", "Fuzzy operations", "Fuzzy inference", "Defuzzification"))
                )));

        // 10. Computer Networks
        subjects.add(createSubject("Computer Networks", PaperType.PAPER_II,
                "Network architecture, protocols, and security", 10,
                List.of(
                        createTopicWithSubtopics("Network Models", 1,
                                List.of("OSI model", "TCP/IP model", "Network topologies", "Network types")),
                        createTopicWithSubtopics("Physical Layer", 2,
                                List.of("Transmission media", "Multiplexing", "Switching techniques", "Modulation")),
                        createTopicWithSubtopics("Data Link Layer", 3,
                                List.of("Framing", "Error detection and correction", "Flow control", "MAC protocols", "Ethernet", "Wireless LANs")),
                        createTopicWithSubtopics("Network Layer", 4,
                                List.of("IP addressing", "Subnetting", "Routing algorithms", "IPv4 and IPv6", "ICMP", "ARP")),
                        createTopicWithSubtopics("Transport Layer", 5,
                                List.of("TCP", "UDP", "Congestion control", "Flow control", "Port addressing")),
                        createTopicWithSubtopics("Application Layer", 6,
                                List.of("HTTP and HTTPS", "FTP", "SMTP and email", "DNS", "DHCP")),
                        createTopicWithSubtopics("Network Security", 7,
                                List.of("Security threats", "Firewalls", "Intrusion detection", "VPN", "SSL/TLS")),
                        createTopicWithSubtopics("Cryptography", 8,
                                List.of("Symmetric key cryptography", "Asymmetric key cryptography", "Digital signatures", "Hash functions", "PKI")),
                        createTopicWithSubtopics("Wireless Networks", 9,
                                List.of("WiFi standards", "Bluetooth", "Mobile networks", "Ad-hoc networks"))
                )));

        return subjects;
    }

    /**
     * Helper to create a Subject entity with its topics.
     */
    private Subject createSubject(String name, PaperType paperType, String description,
                                  int displayOrder, List<Topic> topics) {
        Subject subject = Subject.builder()
                .name(name)
                .paperType(paperType)
                .description(description)
                .displayOrder(displayOrder)
                .topics(new ArrayList<>())
                .build();

        for (Topic topic : topics) {
            topic.setSubject(subject);
            subject.getTopics().add(topic);
        }

        return subject;
    }

    /**
     * Helper to create a Topic entity with its subtopics.
     */
    private Topic createTopicWithSubtopics(String name, int displayOrder, List<String> subtopicNames) {
        Topic topic = Topic.builder()
                .name(name)
                .masteryLevel(MasteryLevel.NOT_STARTED)
                .weight(1)
                .confidenceScore(0.0)
                .displayOrder(displayOrder)
                .subtopics(new ArrayList<>())
                .build();

        for (int i = 0; i < subtopicNames.size(); i++) {
            Subtopic subtopic = Subtopic.builder()
                    .topic(topic)
                    .name(subtopicNames.get(i))
                    .isCompleted(false)
                    .displayOrder(i + 1)
                    .build();
            topic.getSubtopics().add(subtopic);
        }

        return topic;
    }
}

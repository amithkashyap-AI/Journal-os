import { getPrisma } from "../dist/index.js";
import { createHash } from "node:crypto";

const prisma = getPrisma();

// Standard bcrypt hash for "password123" used across all seed accounts
const HASHED_PASSWORD = "$2b$10$smq4kM8PXbOJGYDjFVwfPeWjX0HtYrWuH3O0rC9B5o0MCyB8GsAgm";

// 1. Editors
const EDITORS = [
  {
    email: "editor.ai@rpos.dev",
    name: "Dr. Sarah Chen",
    affiliation: "Massachusetts Institute of Technology (MIT), CSAIL",
    orcid: "0000-0002-1825-0097",
    journalId: "journal-ai-systems",
  },
  {
    email: "editor.quantum@rpos.dev",
    name: "Prof. Marcus Vance",
    affiliation: "University of Oxford, Quantum Information Institute",
    orcid: "0000-0002-3914-1142",
    journalId: "journal-quantum-comp",
  },
  {
    email: "editor.biotech@rpos.dev",
    name: "Dr. Elena Rostova",
    affiliation: "Harvard Medical School, Center for Genomic Medicine",
    orcid: "0000-0003-4512-8821",
    journalId: "journal-genomic-med",
  },
  {
    email: "editor.energy@rpos.dev",
    name: "Prof. David Tanaka",
    affiliation: "Kyoto University, Clean Energy Technologies Laboratory",
    orcid: "0000-0001-9234-7710",
    journalId: "journal-clean-energy",
  },
  {
    email: "editor.cyber@rpos.dev",
    name: "Dr. Aisha Al-Mansoor",
    affiliation: "Stanford University, Cryptography & Network Security Center",
    orcid: "0000-0002-8845-6619",
    journalId: "journal-cyber-crypto",
  },
  {
    email: "editor.neuro@rpos.dev",
    name: "Prof. Julian Weber",
    affiliation: "ETH Zurich, Cognitive Systems & Brain Research Lab",
    orcid: "0000-0003-1289-5503",
    journalId: "journal-neuro-cog",
  },
  {
    email: "editor.nano@rpos.dev",
    name: "Dr. Priya Nair",
    affiliation: "University of Cambridge, Nanomaterials & Molecular Engineering",
    orcid: "0000-0001-6734-2291",
    journalId: "journal-nano-eng",
  },
  {
    email: "editor.ling@rpos.dev",
    name: "Prof. Liam O'Connor",
    affiliation: "University of Edinburgh, Centre for Speech and Language Technology",
    orcid: "0000-0002-7719-3384",
    journalId: "journal-comp-ling",
  },
  {
    email: "editor.climate@rpos.dev",
    name: "Dr. Sofia Morales",
    affiliation: "UC Berkeley, Climate Systems & Environmental Informatics Hub",
    orcid: "0000-0003-6621-9940",
    journalId: "journal-climate-sys",
  },
  {
    email: "editor.biomed@rpos.dev",
    name: "Prof. Henrik Lindqvist",
    affiliation: "Karolinska Institute, Department of Biomedical Engineering",
    orcid: "0000-0001-5582-4417",
    journalId: "journal-biomed-eng",
  },
];

// 2. 10 Journals
const JOURNALS = [
  {
    id: "journal-ai-systems",
    title: "International Journal of Artificial Intelligence & Autonomous Systems",
    slug: "ijaias",
    issn: "2768-4521",
    description:
      "The International Journal of Artificial Intelligence & Autonomous Systems is a peer-reviewed, open-access scholarly periodical dedicated to foundational and applied breakthroughs in deep learning, neural-symbolic architectures, autonomous robotics, reinforcement learning, and ethical machine intelligence. Publication frequency: Quarterly (Issue 1: Jan 15 – Mar 31; Issue 2: Apr 01 – Jun 30; Issue 3: Jul 01 – Sep 30; Issue 4: Oct 01 – Dec 31). Annual volume archival close date: December 31, 2026.",
    categories: ["Artificial Intelligence", "Autonomous Systems", "Machine Learning", "Neural Networks", "Robotics"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 6,
    notes:
      "Continuous article publishing with quarterly archival compilations. Spring cycle publication start date: 2026-01-15, submission deadline: 2026-04-30, volume end date: 2026-12-31. Diamond Open Access subsidized by Institutional Consortium.",
    scopusCategory: "Computer Science: Artificial Intelligence",
    sourceUrl: "https://doaj.org/toc/2768-4521",
    scopusUrl: "https://www.scopus.com/sourceid/27684521",
  },
  {
    id: "journal-quantum-comp",
    title: "Journal of Quantum Information and Computing",
    slug: "jqic",
    issn: "2769-1020",
    description:
      "Journal of Quantum Information and Computing publishes high-impact theoretical and experimental research in fault-tolerant quantum algorithms, superconducting qubits, photonic quantum interconnects, quantum key distribution, and quantum complexity theory. Publication cycle: Semiannual (Vol 1: Jan 01 – Jun 30; Vol 2: Jul 01 – Dec 31). Volume archival close date: December 31, 2026.",
    categories: ["Quantum Computing", "Quantum Information", "Physics", "Quantum Cryptography"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 8,
    notes:
      "Biannual peer review cycle. Fall cycle publication date: 2026-07-01, final submission cutoff: 2026-10-15, volume close and archiving end date: 2026-12-31. No author fees.",
    scopusCategory: "Physics and Astronomy: Quantum Computing",
    sourceUrl: "https://doaj.org/toc/2769-1020",
    scopusUrl: "https://www.scopus.com/sourceid/27691020",
  },
  {
    id: "journal-genomic-med",
    title: "Applied Biotechnology and Genomic Medicine",
    slug: "abgm",
    issn: "2770-5534",
    description:
      "Applied Biotechnology and Genomic Medicine is a premier venue for translational CRISPR therapeutics, single-cell spatial transcriptomics, synthetic biology, and computational oncology. Publication frequency: Bimonthly. Volume publication start date: January 1, 2026; Volume close date: December 31, 2026.",
    categories: ["Biotechnology", "Genomics", "Precision Medicine", "CRISPR", "Bioinformatics"],
    feeModel: "CONDITIONAL",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 7,
    notes:
      "Bimonthly publication schedule (6 issues annually). Volume publication start date: January 1, 2026; final issue close date: December 31, 2026. Institutional waivers available for lower-income countries.",
    scopusCategory: "Biochemistry, Genetics and Molecular Biology",
    sourceUrl: "https://doaj.org/toc/2770-5534",
    scopusUrl: "https://www.scopus.com/sourceid/27705534",
  },
  {
    id: "journal-clean-energy",
    title: "Transactions on Sustainable Clean Energy & Grid Systems",
    slug: "tsce",
    issn: "2771-8890",
    description:
      "Transactions on Sustainable Clean Energy & Grid Systems focuses on next-generation perovskite photovoltaics, solid-state battery chemistry, green hydrogen electrolysis, and distributed smart microgrid optimization. Published continuously with bi-monthly issue compilations. Final annual publication end date: December 20, 2026.",
    categories: ["Clean Energy", "Renewable Power", "Battery Technology", "Smart Grids", "Hydrogen Systems"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 5,
    notes:
      "Continuous publication model. Volume 8 publication opening date: January 15, 2026; mid-year milestone: June 30, 2026; annual closing end date: December 20, 2026.",
    scopusCategory: "Energy Engineering and Power Technology",
    sourceUrl: "https://doaj.org/toc/2771-8890",
    scopusUrl: "https://www.scopus.com/sourceid/27718890",
  },
  {
    id: "journal-cyber-crypto",
    title: "Journal of Advanced Cybersecurity & Cryptography",
    slug: "jacc",
    issn: "2772-3341",
    description:
      "The Journal of Advanced Cybersecurity & Cryptography covers post-quantum cryptographic primitives, zero-knowledge proofs, hardware security enclaves, formal protocol verification, and distributed threat intelligence. Publication frequency: Quarterly. Final publication end date: December 15, 2026.",
    categories: ["Cybersecurity", "Cryptography", "Zero-Knowledge", "Post-Quantum", "Network Security"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 6,
    notes:
      "Quarterly peer-reviewed issues. Cycle 1 publication: March 31, 2026; Cycle 2: June 30, 2026; Cycle 3: September 30, 2026; Cycle 4 publication & archival end date: December 15, 2026.",
    scopusCategory: "Computer Networks and Security",
    sourceUrl: "https://doaj.org/toc/2772-3341",
    scopusUrl: "https://www.scopus.com/sourceid/27723341",
  },
  {
    id: "journal-neuro-cog",
    title: "Neural Computing and Cognitive Brain Research",
    slug: "nccbr",
    issn: "2773-9922",
    description:
      "Neural Computing and Cognitive Brain Research bridges biological neural dynamics and neuromorphic computing, high-density brain-computer interfaces, neural prosthetics, and spiking neural architectures. Bi-annual volume schedule with closing end date of November 30, 2026.",
    categories: ["Cognitive Neuroscience", "Brain-Computer Interface", "Neuromorphic Computing", "Neural Dynamics"],
    feeModel: "CONDITIONAL",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 8,
    notes:
      "Bi-annual publication cadence. Spring Issue release: May 15, 2026; Fall Issue release & volume completion end date: November 30, 2026. Fast-track reviews for clinical trials.",
    scopusCategory: "Neuroscience: Cognitive Neuroscience",
    sourceUrl: "https://doaj.org/toc/2773-9922",
    scopusUrl: "https://www.scopus.com/sourceid/27739922",
  },
  {
    id: "journal-nano-eng",
    title: "Journal of Nanomaterials and Molecular Engineering",
    slug: "jnme",
    issn: "2774-7715",
    description:
      "Journal of Nanomaterials and Molecular Engineering showcases high-impact research in 2D transition metal dichalcogenides, MXenes, carbon nanotube composites, and molecular self-assembly for next-generation nanoelectronics. Quarterly publication cadence. Issue 4 publication end date: December 28, 2026.",
    categories: ["Nanotechnology", "Materials Science", "2D Materials", "Molecular Engineering", "Nanoelectronics"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 6,
    notes:
      "Quarterly volume cycle. Issue 1 publication: March 15, 2026; Issue 2: June 15, 2026; Issue 3: September 15, 2026; Issue 4 publication close date: December 28, 2026.",
    scopusCategory: "Materials Science: Nanotechnology",
    sourceUrl: "https://doaj.org/toc/2774-7715",
    scopusUrl: "https://www.scopus.com/sourceid/27747715",
  },
  {
    id: "journal-comp-ling",
    title: "Computational Linguistics & Natural Language Intelligence",
    slug: "clnli",
    issn: "2775-6638",
    description:
      "Computational Linguistics & Natural Language Intelligence advances foundational multilingual language models, syntactic parsing, semantic reasoning, mechanistic interpretability, and low-resource dialect adaptation. Continuous publishing model with annual volume closing date of December 31, 2026.",
    categories: ["Computational Linguistics", "Natural Language Processing", "Large Language Models", "Semantics"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 5,
    notes:
      "Continuous publishing workflow. Manuscripts are published online within 10 days of acceptance. Volume 12 close and metadata deposit end date: December 31, 2026.",
    scopusCategory: "Linguistics and Language",
    sourceUrl: "https://doaj.org/toc/2775-6638",
    scopusUrl: "https://www.scopus.com/sourceid/27756638",
  },
  {
    id: "journal-climate-sys",
    title: "Frontiers in Climate Systems & Environmental Informatics",
    slug: "fcsei",
    issn: "2776-4429",
    description:
      "Frontiers in Climate Systems & Environmental Informatics delivers cutting-edge research in high-resolution earth system modeling, satellite remote sensing, paleoclimate reconstruction, and geospatial machine learning for extreme weather prediction. Bimonthly release schedule. Publication volume end date: December 31, 2026.",
    categories: ["Climate Science", "Environmental Informatics", "Remote Sensing", "Earth Systems", "Geospatial AI"],
    feeModel: "FREE",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 7,
    notes:
      "Bimonthly schedule (Issues in Feb, Apr, Jun, Aug, Oct, Dec). Final 2026 issue published on December 20, 2026 with volume archival close date on December 31, 2026.",
    scopusCategory: "Earth and Planetary Sciences: Atmospheric Science",
    sourceUrl: "https://doaj.org/toc/2776-4429",
    scopusUrl: "https://www.scopus.com/sourceid/27764429",
  },
  {
    id: "journal-biomed-eng",
    title: "Biomedical Engineering & Translational Healthcare",
    slug: "beth",
    issn: "2777-1184",
    description:
      "Biomedical Engineering & Translational Healthcare is dedicated to biocompatible implants, organ-on-a-chip microfluidics, robot-assisted surgical navigation, and real-time physiological biosensors. Quarterly publication schedule ending on December 31, 2026.",
    categories: ["Biomedical Engineering", "Translational Healthcare", "Medical Devices", "Biosensors", "Microfluidics"],
    feeModel: "CONDITIONAL",
    accessModel: "OPEN_ACCESS",
    publicationWeeks: 8,
    notes:
      "Quarterly publication timeline. Issue 1: March 30; Issue 2: June 30; Issue 3: September 30; Issue 4 & Annual volume completion end date: December 31, 2026.",
    scopusCategory: "Biomedical Engineering",
    sourceUrl: "https://doaj.org/toc/2777-1184",
    scopusUrl: "https://www.scopus.com/sourceid/27771184",
  },
];

// 3. 10 Conferences (with location, startsAt, endsAt)
const CONFERENCES = [
  {
    id: "conf-iclas-2026",
    title: "International Conference on Learning Representations & Autonomous Systems",
    slug: "iclas-2026",
    location: "San Francisco, USA",
    startsAt: new Date("2026-05-10T09:00:00Z"),
    endsAt: new Date("2026-05-15T18:00:00Z"),
  },
  {
    id: "conf-qip-2026",
    title: "Global Symposium on Quantum Information Processing & Computing",
    slug: "qip-2026",
    location: "Geneva, Switzerland",
    startsAt: new Date("2026-06-20T09:00:00Z"),
    endsAt: new Date("2026-06-25T18:00:00Z"),
  },
  {
    id: "conf-wcbg-2026",
    title: "World Congress on Translational Biotechnology & Gene Therapy",
    slug: "wcbg-2026",
    location: "Boston, USA",
    startsAt: new Date("2026-07-14T08:30:00Z"),
    endsAt: new Date("2026-07-18T17:30:00Z"),
  },
  {
    id: "conf-isreg-2026",
    title: "International Summit on Renewable Energy & Grid Integration",
    slug: "isreg-2026",
    location: "Tokyo, Japan",
    startsAt: new Date("2026-08-05T09:00:00Z"),
    endsAt: new Date("2026-08-09T18:00:00Z"),
  },
  {
    id: "conf-accns-2026",
    title: "Annual Conference on Cryptography & Network Security",
    slug: "accns-2026",
    location: "Berlin, Germany",
    startsAt: new Date("2026-09-12T09:00:00Z"),
    endsAt: new Date("2026-09-16T18:00:00Z"),
  },
  {
    id: "conf-iccsn-2026",
    title: "International Conference on Cognitive Systems & Neurotechnology",
    slug: "iccsn-2026",
    location: "Zurich, Switzerland",
    startsAt: new Date("2026-10-18T09:00:00Z"),
    endsAt: new Date("2026-10-22T18:00:00Z"),
  },
  {
    id: "conf-anwf-2026",
    title: "Advanced Nanomaterials World Forum & Exposition",
    slug: "anwf-2026",
    location: "Singapore",
    startsAt: new Date("2026-11-04T09:00:00Z"),
    endsAt: new Date("2026-11-08T18:00:00Z"),
  },
  {
    id: "conf-gcclai-2026",
    title: "Global Conference on Computational Linguistics & AI",
    slug: "gcclai-2026",
    location: "Edinburgh, UK",
    startsAt: new Date("2026-11-20T09:00:00Z"),
    endsAt: new Date("2026-11-24T18:00:00Z"),
  },
  {
    id: "conf-iccri-2026",
    title: "International Colloquium on Climate Resilience & Informatics",
    slug: "iccri-2026",
    location: "Vancouver, Canada",
    startsAt: new Date("2026-12-01T09:00:00Z"),
    endsAt: new Date("2026-12-05T18:00:00Z"),
  },
  {
    id: "conf-wcbcr-2026",
    title: "World Congress on Biomedical Engineering & Clinical Robotics",
    slug: "wcbcr-2026",
    location: "Stockholm, Sweden",
    startsAt: new Date("2026-12-15T09:00:00Z"),
    endsAt: new Date("2026-12-19T18:00:00Z"),
  },
];

// 4. 10 Authors
const AUTHORS = [
  {
    email: "author@rpos.dev",
    name: "Author User",
    affiliation: "Institute of Advanced Computer Science, MIT",
    orcid: "0000-0002-1825-0001",
    // 5 papers on 5 different journals: J1, J3, J5, J7, J9
    journalIndices: [0, 2, 4, 6, 8],
  },
  {
    email: "author.chen@rpos.dev",
    name: "Dr. Wei Chen",
    affiliation: "Stanford Artificial Intelligence Laboratory",
    orcid: "0000-0002-9912-3451",
    // 5 papers on 5 different journals: J1, J2, J4, J6, J8
    journalIndices: [0, 1, 3, 5, 7],
  },
  {
    email: "author.smith@rpos.dev",
    name: "Dr. Emily Smith",
    affiliation: "Oxford Quantum Physics & Nanotechnology Centre",
    orcid: "0000-0003-8821-4562",
    // 5 papers on 5 different journals: J2, J3, J5, J7, J10
    journalIndices: [1, 2, 4, 6, 9],
  },
  {
    email: "author.patel@rpos.dev",
    name: "Prof. Rajesh Patel",
    affiliation: "Harvard Medical School, Department of Genetics",
    orcid: "0000-0001-7734-5673",
    // 5 papers on 5 different journals: J3, J4, J6, J8, J10
    journalIndices: [2, 3, 5, 7, 9],
  },
  {
    email: "author.kim@rpos.dev",
    name: "Dr. Min-Jun Kim",
    affiliation: "KAIST Energy and Environmental Engineering Institute",
    orcid: "0000-0002-6645-6784",
    // 5 papers on 5 different journals: J4, J5, J7, J9, J1
    journalIndices: [3, 4, 6, 8, 0],
  },
  {
    email: "author.garcia@rpos.dev",
    name: "Prof. Carlos Garcia",
    affiliation: "UC Berkeley Cryptography and Security Group",
    orcid: "0000-0003-5556-7895",
    // 5 papers on 5 different journals: J5, J6, J8, J10, J2
    journalIndices: [4, 5, 7, 9, 1],
  },
  {
    email: "author.dupont@rpos.dev",
    name: "Dr. Claire Dupont",
    affiliation: "Sorbonne University, Neuroimaging and Cognition Unit",
    orcid: "0000-0001-4467-8906",
    // 5 papers on 5 different journals: J6, J7, J9, J1, J3
    journalIndices: [5, 6, 8, 0, 2],
  },
  {
    email: "author.muller@rpos.dev",
    name: "Prof. Hans Müller",
    affiliation: "Max Planck Institute for Polymer Research",
    orcid: "0000-0002-3378-9017",
    // 5 papers on 5 different journals: J7, J8, J10, J2, J4
    journalIndices: [6, 7, 9, 1, 3],
  },
  {
    email: "author.tanaka@rpos.dev",
    name: "Dr. Kenji Tanaka",
    affiliation: "University of Tokyo, Department of Information Science",
    orcid: "0000-0003-2289-0128",
    // 5 papers on 5 different journals: J8, J9, J1, J3, J5
    journalIndices: [7, 8, 0, 2, 4],
  },
  {
    email: "author.novak@rpos.dev",
    name: "Prof. Ana Novak",
    affiliation: "University of Toronto, Department of Computer Science & Earth Science",
    orcid: "0000-0001-1190-1239",
    // 5 papers on 5 different journals: J9, J10, J2, J4, J6
    journalIndices: [8, 9, 1, 3, 5],
  },
];

// 5. Scientific Paper Templates per Journal
const PAPER_POOLS = {
  "journal-ai-systems": [
    {
      title: "Self-Supervised Representation Learning for High-Degree-of-Freedom Autonomous Robotic Manipulation",
      abstract: "Autonomous robotic manipulation in unstructured industrial and healthcare environments requires spatial reasoning over high-dimensional sensory inputs. In this paper, we propose a multi-view contrastive predictive representation framework that integrates tactile feedback and RGB-D telemetry. Evaluated on 1,200 simulated and 400 physical robotic trials, our approach achieves an 89.4% task completion rate, outperforming state-of-the-art behavior cloning baselines by 21.7%.",
      keywords: ["self-supervised learning", "robotics", "reinforcement learning", "manipulation", "computer vision"],
    },
    {
      title: "Verifiable Neural-Symbolic Policy Synthesis for Safety-Critical Autonomous Aerial Vehicles",
      abstract: "Safety verification of deep reinforcement learning policies in autonomous aerial systems remains a primary bottleneck for FAA and EASA certification. We present a hybrid neuro-symbolic framework where deep policy networks are continuously constrained by real-time linear temporal logic (LTL) barrier certificates. Flight tests demonstrate zero safety violations across 50 simulated wind-shear failure scenarios while maintaining 94.2% trajectory efficiency.",
      keywords: ["neural-symbolic", "autonomous vehicles", "safety certification", "linear temporal logic", "drones"],
    },
    {
      title: "Continual Meta-Learning for Non-Stationary Multi-Agent Coordination under Asynchronous Communication",
      abstract: "Multi-agent systems deployed in contested environments must coordinate under asynchronous latency and non-stationary environment dynamics. We introduce Asynchronous Meta-Gradient Policy Optimization (AM-GPO), decoupling local gradient steps from consensus sync rounds. Empirical benchmarks on StarCraft II and warehouse fleet coordination demonstrate a 3.4x convergence speedup with robust resilience up to 45% packet loss.",
      keywords: ["multi-agent systems", "meta-learning", "reinforcement learning", "asynchronous systems", "coordination"],
    },
    {
      title: "Energy-Efficient Neuromorphic Spiking Architectures for Real-Time Edge Video Perception",
      abstract: "Deploying high-frame-rate visual perception on sub-watt micro-aerial vehicles requires radical efficiency breakthroughs. We evaluate a 16-core neuromorphic spiking convolutional network implemented on a 28nm asynchronous silicon prototype. The architecture processes 240 fps event-stream video at 14.8 milliwatts, yielding a 92.1% accuracy on pedestrian and obstacle detection benchmarks.",
      keywords: ["neuromorphic computing", "spiking neural networks", "edge computing", "computer vision", "low power"],
    },
    {
      title: "Calibrated Uncertainty Estimation in Vision-Language Models for Clinical Diagnostic Reasoning",
      abstract: "While multimodal vision-language models demonstrate impressive diagnostic capabilities, uncalibrated confidence scores introduce severe clinical liabilities. We present Conformal Temperature Scaling (CTS), a distribution-free conformal prediction framework tailored for chest radiography interpretation. Across three hospital cohort datasets (MIMIC-CXR, CheXpert, PadChest), CTS maintains 95% coverage guarantees while reducing prediction set sizes by 38.6%.",
      keywords: ["conformal prediction", "vision-language models", "medical imaging", "uncertainty estimation", "clinical AI"],
    },
  ],
  "journal-quantum-comp": [
    {
      title: "Fault-Tolerant Surface Code Thresholds under Coherent and Correlated Stray-Coupling Noise",
      abstract: "Realistic superconducting quantum processors suffer from non-Markovian coherent stray couplings that violate standard independent-and-identically-distributed error models. We formulate a stabilizer syndrome decoding algorithm using minimum-weight perfect matching augmented by neural-belief propagation. Our simulated threshold analysis indicates a sustained 0.82% fault-tolerant threshold even under 15% correlated ZZ-crosstalk.",
      keywords: ["quantum error correction", "surface code", "superconducting qubits", "syndrome decoding", "fault tolerance"],
    },
    {
      title: "Scalable Photonic Quantum Interconnects with Low-Loss Silicon Nitride Microresonator Arrays",
      abstract: "Connecting spatially distributed quantum processor modules requires high-fidelity photonic interconnects operating at telecommunication wavelengths. We demonstrate an integrated silicon nitride micro-ring resonator platform with an intrinsic quality factor exceeding 1.8 x 10^7. Quantum state tomography confirms an entanglement distribution fidelity of 96.4% across a 20-meter fiber link at 1550 nm.",
      keywords: ["quantum photonics", "silicon nitride", "quantum interconnects", "entanglement distribution", "microresonators"],
    },
    {
      title: "Parameterized Quantum Circuit Optimization for Variational Quantum Eigensolver in Strongly Correlated Chemistry",
      abstract: "Simulating strongly correlated transition metal catalysts on noisy intermediate-scale quantum (NISQ) devices requires parameter-efficient ansatz designs that mitigate barren plateaus. We introduce Symmetry-Adapted Entanglement Pruning (SAEP), which dynamically eliminates redundant CNOT gates during optimization. Numerical calculations on the FeMo cofactor core demonstrate an 83% reduction in circuit depth with 1.4 mHa chemical accuracy.",
      keywords: ["quantum chemistry", "VQE", "barren plateaus", "quantum algorithms", "molecular simulation"],
    },
    {
      title: "High-Threshold Transmon Qubit Implementations with Tunable Flux-Mediated Couplers",
      abstract: "Superconducting circuit architectures require aggressive cross-resonance cancellation during idle states without compromising two-qubit gate speeds. We present a four-qubit circuit utilizing dynamic flux-tunable transmon couplers that suppress residual ZZ interactions below 1.2 kHz. Controlled-Z gate fidelities exceed 99.72%, as verified by interleaved randomized benchmarking.",
      keywords: ["transmon qubits", "superconducting circuits", "gate fidelity", "quantum hardware", "randomized benchmarking"],
    },
    {
      title: "Post-Quantum Quantum Key Distribution Over Multi-Core Optical Fibers with Real-Time Phase Compensation",
      abstract: "Long-haul field deployments of continuous-variable quantum key distribution (CV-QKD) face severe channel phase drift. We deploy a field trial across a 74-km deployed 7-core optical fiber network utilizing autonomous FPGA-based pilot phase tracking. The system generates an asymptotic secret key rate of 4.2 Mbps under real-world metropolitan environmental vibrations.",
      keywords: ["quantum key distribution", "optical fiber", "CV-QKD", "phase compensation", "quantum communications"],
    },
  ],
  "journal-genomic-med": [
    {
      title: "Single-Cell Spatial Transcriptomics Uncovers Immunosuppressive Fibroblast Niches in Pancreatic Adenocarcinoma",
      abstract: "Pancreatic ductal adenocarcinoma (PDAC) remains notoriously refractory to checkpoint immunotherapy due to a dense, desmoplastic stroma. Using 100-plex spatial transcriptomics combined with single-cell RNA sequencing on 48 resected human tumor specimens, we identify a distinct LRRC15+ myofibroblastic subpopulation that physically excludes CD8+ T cells. Targeted ablation in murine models restores anti-PD-1 sensitivity and increases survival by 64%.",
      keywords: ["spatial transcriptomics", "pancreatic cancer", "immunotherapy", "tumor microenvironment", "single-cell genomics"],
    },
    {
      title: "High-Precision Prime Editing in Hematopoietic Stem Cells for the Genetic Correction of Sickle Cell Disease",
      abstract: "Sickle cell anemia and beta-thalassemia stem from monogenic hemoglobin subunit beta (HBB) mutations. Here, we engineer a compact, high-efficiency prime editing ribonucleoprotein complex targeting the pathogenic HBB E6V allele in primary human CD34+ hematopoietic stem cells. We achieve 78.4% target gene correction with undetectable (<0.1%) off-target indel generation across 124 candidate genomic loci.",
      keywords: ["prime editing", "sickle cell disease", "hematopoietic stem cells", "gene therapy", "CRISPR-Cas9"],
    },
    {
      title: "Deep Generative Models for De Novo Therapeutic Antibody Design with Engineered Epitope Specificity",
      abstract: "De novo design of monoclonal antibodies with high affinity and low developability liabilities remains an elusive target in structural bioinformatics. We introduce AbDiff, an equivariant SE(3) diffusion model that co-generates antibody CDR-H3 loop conformations and amino acid sequences conditioned on antigen surface topology. In vitro surface plasmon resonance validates nanomolar binding affinities for 14 novel candidates against SARS-CoV-2 and RSV glycoproteins.",
      keywords: ["antibody design", "diffusion models", "structural biology", "biotherapeutics", "deep learning"],
    },
    {
      title: "Circulating Tumor DNA Methylation Signatures for Non-Invasive Pan-Cancer Early Detection in Asymptomatic Cohorts",
      abstract: "Early detection of solid malignancies before clinical metastasis significantly reduces cancer mortality. We profile cell-free DNA (cfDNA) methylation landscapes in a prospective cohort of 3,400 asymptomatic participants using targeted enzymatic methyl-seq. Our ensemble machine learning classifier demonstrates 91.8% sensitivity for Stage I–II colorectal, lung, and ovarian cancers at a 99.2% specificity threshold.",
      keywords: ["liquid biopsy", "DNA methylation", "early cancer detection", "cfDNA", "biomarkers"],
    },
    {
      title: "Targeted Lipid Nanoparticle Formulations for mRNA Delivery to Extrahepatic Macrophage Lineages",
      abstract: "Clinical mRNA vaccines have succeeded largely through intramuscular or hepatic delivery, but targeting alveolar and splenic macrophages remains challenging. We synthesize an ionizable lipid library containing cyclic headgroups that modulate lipid nanoparticle pKa and surface charge. In vivo biodistribution assays in non-human primates show an 8.6-fold enrichment in alveolar macrophages over standard MC3 formulations.",
      keywords: ["lipid nanoparticles", "mRNA therapeutics", "drug delivery", "macrophages", "nanomedicine"],
    },
  ],
  "journal-clean-energy": [
    {
      title: "Halide Homogenization and Interfacial Passivation for 26.2% Efficient Perovskite Solar Cells under Continuous Operation",
      abstract: "Perovskite solar cells (PSCs) offer exceptional photovoltaic performance, but halide phase segregation under continuous 1-sun illumination hampers commercialization. We develop a bi-functional fluorinated alkylammonium iodide passivation layer that suppresses vacancy migration and stabilizes mixed iodide-bromide lattices. Fabricated unencapsulated devices maintain 95.8% of their initial 26.2% power conversion efficiency after 2,000 hours of continuous operational tracking.",
      keywords: ["perovskite solar cells", "halide segregation", "photovoltaics", "passivation", "clean energy"],
    },
    {
      title: "Electrochemical Synthesis of Ammonia via Direct Nitrate Reduction with High Faradaic Efficiency on Bimetallic Cu-Co Catalysts",
      abstract: "Green ammonia synthesis from ambient nitrate wastewater offers an attractive carbon-neutral alternative to the energy-intensive Haber-Bosch process. We synthesize porous copper-cobalt bimetallic nanosheets with tuned d-band centers that accelerate *NO intermediate hydrogenation while suppressing hydrogen evolution. The catalyst exhibits a Faradaic efficiency of 94.7% and an ammonia yield rate of 1.82 mmol h^-1 cm^-2 at -0.45 V vs. RHE.",
      keywords: ["ammonia synthesis", "electrocatalysis", "nitrate reduction", "green chemistry", "sustainable energy"],
    },
    {
      title: "Solid-State Sodium-Ion Battery Electrolytes Enabled by Fluorinated Succinonitrile Plastic Crystal Matrices",
      abstract: "Solid-state sodium batteries present an abundant and cost-effective alternative to lithium-ion technology for grid-scale energy storage. We formulate a solid composite electrolyte comprising sodium bis(fluorosulfonyl)imide dissolved in a succinonitrile plastic crystal matrix reinforced with functionalized ceramic nanoparticles. The electrolyte demonstrates high ionic conductivity of 1.4 x 10^-3 S cm^-1 at 25°C and stable sodium plating/stripping for over 1,500 hours.",
      keywords: ["sodium-ion batteries", "solid-state electrolytes", "grid energy storage", "electrochemistry", "battery materials"],
    },
    {
      title: "Distributed Model Predictive Control for Islanded Microgrids with High Penetration of Inverter-Based Renewables",
      abstract: "High penetration of intermittent wind and solar generation induces frequency and voltage instabilities in islanded microgrids lacking rotational inertia. We formulate an ADMM-based distributed model predictive control (MPC) algorithm that coordinates synthetic inertia from battery storage and smart inverters at 10-millisecond horizons. Hardware-in-the-loop tests demonstrate frequency nadir stabilization within +/- 0.15 Hz during severe 40% generation loss transients.",
      keywords: ["smart grids", "microgrids", "model predictive control", "synthetic inertia", "power systems"],
    },
    {
      title: "High-Temperature Proton Exchange Membrane Electrolyzers Utilizing Phosphoric Acid-Doped Polybenzimidazole Membranes",
      abstract: "Hydrogen production through high-temperature proton exchange membrane (HT-PEM) electrolysis at 160°C offers superior thermodynamic efficiency and simplified thermal integration. We report a crosslinked polybenzimidazole membrane with immobilized functionalized graphene oxide flakes that achieves a proton conductivity of 0.28 S cm^-1 with zero external humidification. Water electrolysis yields 3.2 A cm^-2 at 1.85 V with sustained durability over 1,000 hours.",
      keywords: ["hydrogen electrolysis", "fuel cells", "proton exchange membrane", "polybenzimidazole", "clean hydrogen"],
    },
  ],
  "journal-cyber-crypto": [
    {
      title: "Succinct Non-Interactive Arguments of Knowledge (SNARKs) with Linear Prover Time and Sub-Kilobyte Proofs",
      abstract: "Scaling zero-knowledge rollups in decentralized settlement networks requires proving cryptographic statements over large arithmetic circuits without excessive hardware costs. We introduce HyperArg, a multilinear polynomial commitment scheme that achieves strictly linear prover runtime O(N) over field operations while keeping proof sizes under 780 bytes. Microbenchmarks show an 8.4x reduction in prover memory consumption compared to Plonk.",
      keywords: ["zero-knowledge proofs", "zk-SNARKs", "polynomial commitments", "cryptography", "rollups"],
    },
    {
      title: "Post-Quantum Identity-Based Encryption from the Ring Learning With Errors Problem with Tight Security Reductions",
      abstract: "Deploying secure identity-based encryption (IBE) in post-quantum environments is essential for next-generation email and messaging protocols. We construct an efficient IBE scheme based on the standard Ring Learning With Errors (R-LWE) assumption under a tightly secure reduction in the Quantum Random Oracle Model (QROM). Public keys and ciphertexts are under 2.4 KB, with encryption executing in 0.8 milliseconds on standard ARM64 processors.",
      keywords: ["post-quantum cryptography", "ring-LWE", "identity-based encryption", "QROM", "lattice cryptography"],
    },
    {
      title: "Hardware Enclave Side-Channel Countermeasures for Transient Execution Attacks in Speculative Out-of-Order Cores",
      abstract: "Speculative execution vulnerabilities such as Spectre and Foreshadow continually undermine trust in hardware secure enclaves (e.g., Intel SGX, AMD SEV). We design SpectreShield, a hardware-assisted speculation fence and cache-allocation masking scheme implemented on a RISC-V Rocket core. Cycle-accurate gem5 simulations confirm complete mitigation of timing side-channels with an overall IPC execution penalty of less than 3.8%.",
      keywords: ["hardware security", "side-channel attacks", "speculative execution", "secure enclaves", "RISC-V"],
    },
    {
      title: "Automated Formal Verification of Smart Contract Protocols via Constrained Horn Clause Solvers",
      abstract: "Flaws in decentralized smart contract logic have resulted in billions of dollars in exploitative arbitrage and reentrancy drains. We present VeriSolv, an automated verification pipeline that translates EVM bytecode into constrained Horn clauses (CHCs) and executes inductive invariant inference using Z3. VeriSolv successfully identifies 94% of historical CVE exploits across 2,400 audited contracts with an average verification latency of 18 seconds per protocol.",
      keywords: ["formal verification", "smart contracts", "Horn clauses", "EVM bytecode", "vulnerability analysis"],
    },
    {
      title: "Privacy-Preserving Federated Learning via Secure Multi-Party Computation with Differential Privacy Guarantees",
      abstract: "Collaborative machine learning among competitive enterprise institutions requires strict privacy preservation against gradient leakage attacks. We formulate an MPC-FL protocol combining secret sharing over additive rings with adaptive local differential privacy noise calibration. In training a ResNet-50 across 10 distributed financial institutions, our protocol prevents membership inference attacks while sustaining 96.2% top-1 model accuracy.",
      keywords: ["federated learning", "multi-party computation", "differential privacy", "data privacy", "machine learning security"],
    },
  ],
  "journal-neuro-cog": [
    {
      title: "High-Density Bidirectional Brain-Computer Interfaces with Wireless 1,024-Channel Neural Telemetry",
      abstract: "Restoring motor mobility and sensory feedback in individuals with severe spinal cord injury requires bidirectional communication between cortical tissue and neural prosthetics. We present an implantable 1,024-channel microelectrode array interfaced with a sub-50mW ASIC that transmits raw spike waveforms over high-bandwidth UWB telemetry. In non-human primates, the device demonstrates stable continuous decodings of 2D arm kinematic trajectories over 180 days.",
      keywords: ["brain-computer interface", "neural telemetry", "microelectrode array", "motor decoding", "neuroprosthetics"],
    },
    {
      title: "Spike-Timing-Dependent Plasticity in Neuromorphic Memristive Arrays for Low-Power On-Chip Hebbian Learning",
      abstract: "Emulating synaptic plasticity at the physical hardware layer enables edge intelligent devices to adapt without backpropagation. We fabricate a 64x64 crossbar array of titanium oxide memristive synapses exhibiting analog conductance modulation governed by biological Spike-Timing-Dependent Plasticity (STDP). Unsupervised classification of spatio-temporal audio-visual patterns achieves 91.3% accuracy while consuming 84 nanojoules per synaptic update.",
      keywords: ["memristors", "STDP", "neuromorphic hardware", "synaptic plasticity", "unsupervised learning"],
    },
    {
      title: "Cortical Oscillatory Dynamics Underlying Working Memory Gating and Attentional Control in the Prefrontal Cortex",
      abstract: "The neural mechanisms governing how transient sensory stimuli are selected and maintained in working memory remain debated. We analyze laminar local field potentials and single-unit recordings in primate dorsolateral prefrontal cortex (dlPFC) during a delayed-match-to-sample paradigm. We show that burst-like beta oscillations (20-30 Hz) gate access to working memory representations encoded by gamma-band (60-90 Hz) spiking activity.",
      keywords: ["prefrontal cortex", "working memory", "neural oscillations", "attentional gating", "electrophysiology"],
    },
    {
      title: "Generative Neural Decoding of Auditory Speech Percepts from Human Intracranial Electrocorticography",
      abstract: "Decoding imagined or perceived acoustic speech directly from human sensory cortex provides a powerful avenue for communication restoration in paralyzed patients. We train an autoregressive neural decoder conditioned on high-gamma (70-150 Hz) activity recorded from 256-channel electrocorticography (ECoG) grids over the superior temporal gyrus. The synthesized speech audio achieves an 84.1% word error rate accuracy and naturalistic prosodic inflection.",
      keywords: ["electrocorticography", "speech decoding", "neural prosthetics", "brain decoding", "auditory cortex"],
    },
    {
      title: "Cellular-Resolution Whole-Brain Optical Mapping of Fear Memory Engram Re-activation Dynamics",
      abstract: "Memory engrams are distributed neuronal networks whose coordinated re-activation underlies mnemonic recall. Using volumetric two-photon optical clear-skull imaging in transgenic mice, we track the longitudinal reactivation of 12,000 contextual fear-conditioned engram cells across hippocampal CA1, basolateral amygdala, and anterior cingulate cortex. Chemogenetic silencing confirms that memory retrieval requires synchronous co-activation across all three hubs.",
      keywords: ["memory engrams", "optogenetics", "two-photon imaging", "hippocampus", "behavioral neuroscience"],
    },
  ],
  "journal-nano-eng": [
    {
      title: "Atomic-Layer Synthesis of 2D Molybdenum Disulfide Transistors with Sub-1-Nanometer Equivalent Gate Oxide",
      abstract: "Scaling semiconductor logic beyond silicon limits requires two-dimensional transition metal dichalcogenides (TMDs) with ultrathin gate dielectrics. We synthesize monolayer MoS2 via chemical vapor deposition and engineer a sub-1-nm hafnium oxide gate dielectric using molecular beam epitaxy. Fabricated field-effect transistors exhibit an on/off ratio of 10^8 and a subthreshold swing of 64 mV/decade, approaching the thermodynamic Boltzmann limit.",
      keywords: ["2D materials", "MoS2", "field-effect transistors", "atomic layer deposition", "nanoelectronics"],
    },
    {
      title: "MXene-Reinforced Carbon Nanotube Aerogels for Ultra-Broadband Electromagnetic Interference Shielding",
      abstract: "Aerospace and high-density electronics demand lightweight, mechanically robust materials capable of attenuating electromagnetic interference across radio and radar frequencies. We formulate a freeze-cast Ti3C2Tx MXene aerogel interwoven with single-walled carbon nanotubes. The aerogel achieves an electromagnetic shielding effectiveness of 82.4 dB across X-band and Ku-band frequencies at a density of only 12 mg cm^-3.",
      keywords: ["MXenes", "carbon nanotubes", "aerogels", "EMI shielding", "nanomaterials"],
    },
    {
      title: "DNA Origami-Directed Molecular Assembly of Plasmonic Nanoparticle Clusters for Single-Molecule Raman Sensing",
      abstract: "Surface-Enhanced Raman Scattering (SERS) requires reproducible sub-nanometer hot spots to detect individual biomolecules. We utilize self-assembled 2D DNA origami scaffolds to position gold nanoparticles with 1-nanometer spatial precision. The engineered plasmonic dimers produce an electromagnetic field enhancement factor exceeding 10^10, enabling label-free single-molecule detection of circulating microRNAs.",
      keywords: ["DNA origami", "plasmonics", "nanoparticles", "SERS", "molecular sensing"],
    },
    {
      title: "Hierarchical Porous Metal-Organic Frameworks for High-Selectivity Direct Air Capture of Carbon Dioxide",
      abstract: "Direct air capture (DAC) of CO2 from atmospheric concentrations (~420 ppm) demands sorbents with extreme selectivity over moisture. We synthesize an amine-functionalized metal-organic framework (MOF) featuring a hierarchical micro-mesoporous network. The sorbent exhibits a CO2 uptake of 3.8 mol kg^-1 under 400 ppm CO2 at 60% relative humidity with complete thermal regenerability at 95°C.",
      keywords: ["metal-organic frameworks", "carbon capture", "direct air capture", "porous materials", "nanomaterials"],
    },
    {
      title: "Chiral Nanocrystal Superlattices with Amplified Circular Dichroism for Chiroptical Biosensing",
      abstract: "Chirality plays a crucial role in drug efficacy and molecular recognition, yet natural biomolecules exhibit faint chiroptical signals. We assemble helical superlattices of gold nanorods guided by chiral peptide templates. The resulting macroscopic metamaterials display giant circular dichroism in the near-infrared spectrum with an anisotropy factor g of 0.24, enabling enantiomeric distinction of pharmaceuticals at sub-micromolar levels.",
      keywords: ["chiral nanomaterials", "circular dichroism", "superlattices", "plasmonics", "biosensing"],
    },
  ],
  "journal-comp-ling": [
    {
      title: "Mechanistic Interpretability of Circuit Specialization in Multilingual Transformer Language Models",
      abstract: "Large language models demonstrate cross-lingual generalization, but whether linguistic concepts share localized neuronal circuits or emerge as distributed representations remains unclear. We apply causal activation patching and circuit ablation across 24 language pairs in a 13-billion-parameter foundation model. We identify a sparse, language-invariant core of 4.2% of attention heads responsible for syntactic role binding across typologically diverse families.",
      keywords: ["mechanistic interpretability", "multilingual NLP", "transformers", "causal tracing", "representation learning"],
    },
    {
      title: "Zero-Shot Cross-Lingual Dialogue State Tracking for Low-Resource Dialects via Synthetic Grammatical Transfer",
      abstract: "Dialogue systems frequently fail when deployed on non-standard dialects and endangered vernaculars lacking annotated conversational corpora. We introduce DialectBridge, an automated grammatical morphosyntax synthesizer that transforms standard language dialogue datasets into linguistically faithful dialectal variants. On low-resource African and Indigenous American dialects, DialectBridge improves zero-shot joint goal accuracy by 28.4%.",
      keywords: ["cross-lingual", "dialogue systems", "low-resource languages", "morphosyntax", "speech technology"],
    },
    {
      title: "Linear-Time Associative Memory Attention with Constant-State Recurrence for Million-Token Sequence Modeling",
      abstract: "Quadratic computational complexity limits standard self-attention mechanisms when analyzing book-length documents or long-horizon codebases. We formulate an associative state-space memory architecture with input-dependent state transitions and decay gating. Evaluated on retrieval tasks exceeding 1,000,000 tokens, our architecture achieves 99.8% needle-in-a-haystack accuracy while operating at 4.2x the throughput of standard FlashAttention-2.",
      keywords: ["long-context models", "state-space models", "attention mechanisms", "efficiency", "natural language processing"],
    },
    {
      title: "Provably Grounded Retrieval-Augmented Generation through Entailment-Constrained Decoding",
      abstract: "Hallucination in retrieval-augmented generation (RAG) poses critical risks for legal, clinical, and regulatory document processing. We propose GroundedDec, a decoding algorithm that dynamically constrains vocabulary generation to token trajectories with formal natural language inference (NLI) entailment support. Automated and human evaluations across 5,000 technical legal summaries demonstrate a reduction of unsupported factual claims to 0.4%.",
      keywords: ["retrieval-augmented generation", "hallucination mitigation", "natural language inference", "factuality", "legal NLP"],
    },
    {
      title: "Phonetically Informed Speech-to-Speech Translation Models with Preserved Speaker Prosody and Emotional Valence",
      abstract: "Direct speech-to-speech translation systems often discard the vocal identity, rhythm, and affective tone of the original speaker. We build an end-to-end discrete acoustic token translation model that disentangles semantic representation, speaker timbral embeddings, and prosodic contour features. Listening tests across 600 bilingual participants demonstrate a 91.2% preference rating for voice similarity and emotional fidelity.",
      keywords: ["speech-to-speech translation", "prosody", "acoustic tokens", "speech synthesis", "multimodal AI"],
    },
  ],
  "journal-climate-sys": [
    {
      title: "Sub-Kilometer High-Resolution Earth System Modeling via Physics-Informed Fourier Neural Operators",
      abstract: "Accurate forecasting of local extreme convective storms requires resolving mesoscale atmospheric dynamics below the resolution of current global numerical weather models. We train a physics-informed spherical Fourier Neural Operator (FNO) on 40 years of ECMWF ERA5 reanalysis data. Our model generates 10-day global forecasts at 3.5-km resolution in 0.4 seconds on a single GPU, predicting hurricane landfall trajectories with 18% lower error than IFS.",
      keywords: ["climate modeling", "Fourier neural operators", "extreme weather", "deep learning", "atmospheric science"],
    },
    {
      title: "Satellite Hyperspectral Detection of Methane Super-Emitters with Sub-Facility Localization and Uncertainty Quantification",
      abstract: "Point-source fugitive methane leaks from fossil fuel extraction and landfills represent high-leverage greenhouse gas mitigation opportunities. We process orbital hyperspectral imagery from PRISMA and EnMAP using matched filter radiance inversion coupled with atmospheric radiative transfer correction. The automated pipeline detects 1,400 previously unreported super-emitters (>100 kg/hr) globally with a false-positive rate under 2.1%.",
      keywords: ["methane detection", "hyperspectral remote sensing", "greenhouse gases", "satellite imaging", "climate informatics"],
    },
    {
      title: "Paleoclimate Reconstruction of Holocene Hydroclimate Variability in the Global Tropics from Cave Speleothems",
      abstract: "Understanding prospective anthropogenically forced monsoon migrations necessitates benchmarking against high-resolution paleoclimate records. We present a multi-proxy compilation of oxygen and carbon isotope ratios from 84 tropical speleothems covering the past 11,700 years. The synthesized dataset reveals multi-centennial megadrought cycles linked to North Atlantic overturning circulation slowdowns, providing key constraints for IPCC AR7 projections.",
      keywords: ["paleoclimate", "monsoon dynamics", "speleothems", "Holocene hydroclimate", "climate change"],
    },
    {
      title: "Ocean Biogeochemical Feedback Mechanisms under Accelerated Marine Heatwaves in Subtropical Gyres",
      abstract: "Marine heatwaves have surged in frequency and severity, causing widespread coral bleaching and oxygen depletion. Using autonomous biogeochemical Argo profiling floats deployed across the subtropical Pacific, we analyze nutrient drawdown, dissolved oxygen depletion, and chlorophyll-a shifts during the record 2024–2025 heatwave events. Results demonstrate an 18% reduction in net primary productivity with prolonged carbon export depression.",
      keywords: ["marine heatwaves", "biogeochemical Argo", "ocean warming", "carbon export", "marine ecosystems"],
    },
    {
      title: "Geospatial Graph Neural Networks for Global Wildfire Spread Prediction and Evacuation Vulnerability Modeling",
      abstract: "Wildfire spread across wildland-urban interfaces is driven by complex interactions among fuel moisture, topography, and shifting winds. We model fuel beds and meteorological vectors as dynamic spatiotemporal graphs processed by edge-conditioned graph convolutional networks. Validated on historical California and Mediterranean mega-fires, our model predicts 48-hour fire perimeter expansions with an 88.4% spatial intersection-over-union.",
      keywords: ["wildfire prediction", "graph neural networks", "geospatial modeling", "disaster response", "climate resilience"],
    },
  ],
  "journal-biomed-eng": [
    {
      title: "Biodegradable Zinc-Alloy Vascular Scaffolds with Controlled Endothelialization and Zero Thrombogenic Risk",
      abstract: "Permanent metallic coronary stents induce chronic vascular inflammation and late in-stent restenosis. We engineer a fully bioresorbable zinc-copper-manganese alloy vascular scaffold coated with an electrospun polymer layer releasing endothelial progenitor cell recruitment factors. In porcine femoral artery implants over 12 months, the scaffold degrades uniformly with complete neo-intimal endothelialization and zero thrombotic occlusion.",
      keywords: ["vascular stents", "bioresorbable materials", "zinc alloys", "endothelialization", "biomedical implants"],
    },
    {
      title: "Organ-on-a-Chip Multi-Organ Microfluidics for Predicting Human Drug Pharmacokinetics and Cardiotoxicity",
      abstract: "High failure rates in drug clinical trials stem from animal models that poorly emulate human metabolic responses. We construct a 4-organ microfluidic platform interconnecting micro-physiological models of the human liver, intestine, kidney, and vascularized cardiac tissue with continuous recirculating perfusion. Pharmacokinetic profiling of 15 oncology compounds matches human Phase I clinical bioavailability within 86% fidelity.",
      keywords: ["organ-on-a-chip", "microfluidics", "cardiotoxicity", "pharmacokinetics", "translational medicine"],
    },
    {
      title: "Closed-Loop Deep Brain Stimulation with Adaptive Local Field Potential Biomarkers for Parkinson's Disease",
      abstract: "Conventional continuous deep brain stimulation (DBS) often induces speech impairment and battery depletion. We implement an adaptive closed-loop neurostimulation system that tracks subthalamic nucleus beta-band (13-30 Hz) power in real time to dynamically modulate stimulation voltage. Clinical trials in 18 patients show a 42% reduction in motor motor-off times and a 54% reduction in electrical energy consumption.",
      keywords: ["deep brain stimulation", "closed-loop systems", "Parkinson's disease", "neural engineering", "neurotechnology"],
    },
    {
      title: "Wearable Continuous Sweat Biosensor Patches for Real-Time Multi-Analyte Physiological Stress Tracking",
      abstract: "Non-invasive monitoring of metabolic exertion and stress in athletes and military personnel requires continuous biochemical tracking. We fabricate a flexible, microfluidic patch with integrated ion-selective field-effect transistors that measure sweat cortisol, glucose, lactate, and electrolytes simultaneously. The patch transmits data via Bluetooth Low Energy with continuous in vivo calibration over 12 hours of strenuous exercise.",
      keywords: ["wearable biosensors", "sweat analysis", "microfluidics", "metabolic tracking", "health monitoring"],
    },
    {
      title: "Autonomous Robot-Assisted Microsurgical Suturing with Sub-Millimeter Vision and Haptic Force Feedback",
      abstract: "Revascularization in micro-vascular and ophthalmic surgery demands sub-millimeter precision beyond manual human tremor thresholds. We develop a dual-arm microsurgical robotic platform equipped with 4K stereoscopic optical coherence tomography (OCT) and fiber-Bragg-grating force sensors. The autonomous system executes 0.3-mm vascular anastomoses with a suture placement accuracy of 42 micrometers.",
      keywords: ["surgical robotics", "microsurgery", "haptic feedback", "optical coherence tomography", "medical robotics"],
    },
  ],
};

async function main() {
  console.log("=== Starting Research Publishing OS Dummy Data Seeding ===");

  // 1. Ensure publisher owner exists
  const publisherOwner = await prisma.user.findFirst({
    where: { email: "publisher@rpos.dev" },
  });
  const ownerId = publisherOwner ? publisherOwner.id : null;

  // 2. Upsert Publisher
  const publisher = await prisma.publisher.upsert({
    where: { id: "pub-demo" },
    update: {
      name: "Research Publishing OS Consortium",
      slug: "demo-publisher",
      website: "https://researchos.io",
      ownerId: ownerId,
    },
    create: {
      id: "pub-demo",
      name: "Research Publishing OS Consortium",
      slug: "demo-publisher",
      website: "https://researchos.io",
      ownerId: ownerId,
    },
  });
  console.log(`[Publisher] ${publisher.name} (${publisher.id}) ready.`);

  // 3. Upsert Editors and link to publisher
  const editorUsers = [];
  for (const editorData of EDITORS) {
    const user = await prisma.user.upsert({
      where: { email: editorData.email },
      update: {
        name: editorData.name,
        affiliation: editorData.affiliation,
        orcid: editorData.orcid,
        roles: ["EDITOR"],
      },
      create: {
        email: editorData.email,
        name: editorData.name,
        affiliation: editorData.affiliation,
        orcid: editorData.orcid,
        roles: ["EDITOR"],
        passwordHash: HASHED_PASSWORD,
      },
    });

    await prisma.publisherMember.upsert({
      where: {
        publisherId_userId_role: {
          publisherId: publisher.id,
          userId: user.id,
          role: "EDITOR",
        },
      },
      update: {},
      create: {
        publisherId: publisher.id,
        userId: user.id,
        role: "EDITOR",
      },
    });

    editorUsers.push({ ...user, journalId: editorData.journalId });
    console.log(`[Editor] ${user.name} (${user.email}) ready.`);
  }

  // Also ensure generic editor@rpos.dev is in publisher_members
  const defaultEditor = await prisma.user.findUnique({ where: { email: "editor@rpos.dev" } });
  if (defaultEditor) {
    await prisma.publisherMember.upsert({
      where: {
        publisherId_userId_role: {
          publisherId: publisher.id,
          userId: defaultEditor.id,
          role: "EDITOR",
        },
      },
      update: {},
      create: {
        publisherId: publisher.id,
        userId: defaultEditor.id,
        role: "EDITOR",
      },
    });
  }

  // 4. Upsert 10 Journals with Profiles, Indexing, and Editor Assignments
  const adminUser = await prisma.user.findFirst({
    where: { roles: { has: "ADMIN" } },
  });
  const verifiedByUserId = adminUser?.id || ownerId || "system";

  for (const jData of JOURNALS) {
    const journal = await prisma.journal.upsert({
      where: { id: jData.id },
      update: {
        title: jData.title,
        slug: jData.slug,
        issn: jData.issn,
        description: jData.description,
        publisherId: publisher.id,
      },
      create: {
        id: jData.id,
        title: jData.title,
        slug: jData.slug,
        issn: jData.issn,
        description: jData.description,
        publisherId: publisher.id,
      },
    });

    // Assign specific editor
    const assignedEditor = editorUsers.find((e) => e.journalId === jData.id);
    if (assignedEditor) {
      await prisma.journalEditorAssignment.upsert({
        where: {
          journalId_userId: {
            journalId: journal.id,
            userId: assignedEditor.id,
          },
        },
        update: {},
        create: {
          journalId: journal.id,
          userId: assignedEditor.id,
        },
      });
    }

    // Publication Profile
    await prisma.journalPublicationProfile.upsert({
      where: { journalId: journal.id },
      update: {
        categories: jData.categories,
        feeModel: jData.feeModel,
        accessModel: jData.accessModel,
        publicationWeeks: jData.publicationWeeks,
        sourceUrl: jData.sourceUrl,
        checkedAt: new Date("2026-03-15T00:00:00Z"),
        notes: jData.notes,
        verifiedBy: verifiedByUserId,
      },
      create: {
        journalId: journal.id,
        categories: jData.categories,
        feeModel: jData.feeModel,
        accessModel: jData.accessModel,
        publicationWeeks: jData.publicationWeeks,
        sourceUrl: jData.sourceUrl,
        checkedAt: new Date("2026-03-15T00:00:00Z"),
        notes: jData.notes,
        verifiedBy: verifiedByUserId,
      },
    });

    // Scopus Indexing Evidence
    await prisma.journalIndexingEvidence.upsert({
      where: {
        journalId_source: {
          journalId: journal.id,
          source: "SCOPUS",
        },
      },
      update: {
        status: "ACTIVE",
        quartile: "Q1",
        indexYear: 2026,
        subjectCategory: jData.scopusCategory,
        coverageStartYear: 2018,
        coverageEndYear: 2026,
        sourceUrl: jData.scopusUrl,
        checkedAt: new Date("2026-03-15T00:00:00Z"),
        notes: `Verified Scopus Q1 indexed journal. Continuous coverage from 2018 through 2026 with verified CiteScore percentile > 85th in ${jData.scopusCategory}.`,
        verifiedBy: verifiedByUserId,
      },
      create: {
        journalId: journal.id,
        source: "SCOPUS",
        status: "ACTIVE",
        quartile: "Q1",
        indexYear: 2026,
        subjectCategory: jData.scopusCategory,
        coverageStartYear: 2018,
        coverageEndYear: 2026,
        sourceUrl: jData.scopusUrl,
        checkedAt: new Date("2026-03-15T00:00:00Z"),
        notes: `Verified Scopus Q1 indexed journal. Continuous coverage from 2018 through 2026 with verified CiteScore percentile > 85th in ${jData.scopusCategory}.`,
        verifiedBy: verifiedByUserId,
      },
    });

    // DOAJ Indexing Evidence
    await prisma.journalIndexingEvidence.upsert({
      where: {
        journalId_source: {
          journalId: journal.id,
          source: "DOAJ",
        },
      },
      update: {
        status: "ACTIVE",
        sourceUrl: jData.sourceUrl,
        checkedAt: new Date("2026-03-15T00:00:00Z"),
        notes: `Directory of Open Access Journals (DOAJ) seal recipient. Rigorous blind peer review, immediate open access, CC-BY 4.0 licensing compliance confirmed.`,
        verifiedBy: verifiedByUserId,
      },
      create: {
        journalId: journal.id,
        source: "DOAJ",
        status: "ACTIVE",
        sourceUrl: jData.sourceUrl,
        checkedAt: new Date("2026-03-15T00:00:00Z"),
        notes: `Directory of Open Access Journals (DOAJ) seal recipient. Rigorous blind peer review, immediate open access, CC-BY 4.0 licensing compliance confirmed.`,
        verifiedBy: verifiedByUserId,
      },
    });

    // AI Quality Assessment
    const assessmentContext = JSON.stringify({
      title: journal.title,
      issn: journal.issn,
      scopus: "Q1",
      field: jData.scopusCategory,
    });
    const hash = createHash("sha256").update(assessmentContext).digest("hex");

    await prisma.journalAssessment.upsert({
      where: { journalId: journal.id },
      update: {
        text: `### Verified Journal Audit & Quality Synthesis\n\n**Journal Identity:** ${journal.title} (ISSN: ${journal.issn})\n**Indexing Status:** Verified Scopus Q1 (Top 15th Percentile) in *${jData.scopusCategory}*, indexed continuously from 2018 through 2026. Registered with full DOAJ Seal verification and Crossref digital DOI minting.\n\n**Editorial Rigor & Governance:** Led by dedicated Editor-in-Chief (${assignedEditor?.name || "Senior Board"}) with strict double-blind peer review. Turnaround SLA of ${jData.publicationWeeks} weeks from submission to initial editorial decision.\n\n**Publication Cycle & Archiving:** Features an active 2026 volume cycle with scheduled seasonal issue close dates, ending in full annual volume archival on December 31, 2026. Fully open-access with transparent copyright preservation.`,
        model: "llama3.2:3b",
        evidenceHash: hash,
        generatedAt: new Date(),
      },
      create: {
        journalId: journal.id,
        text: `### Verified Journal Audit & Quality Synthesis\n\n**Journal Identity:** ${journal.title} (ISSN: ${journal.issn})\n**Indexing Status:** Verified Scopus Q1 (Top 15th Percentile) in *${jData.scopusCategory}*, indexed continuously from 2018 through 2026. Registered with full DOAJ Seal verification and Crossref digital DOI minting.\n\n**Editorial Rigor & Governance:** Led by dedicated Editor-in-Chief (${assignedEditor?.name || "Senior Board"}) with strict double-blind peer review. Turnaround SLA of ${jData.publicationWeeks} weeks from submission to initial editorial decision.\n\n**Publication Cycle & Archiving:** Features an active 2026 volume cycle with scheduled seasonal issue close dates, ending in full annual volume archival on December 31, 2026. Fully open-access with transparent copyright preservation.`,
        model: "llama3.2:3b",
        evidenceHash: hash,
        generatedAt: new Date(),
      },
    });

    console.log(`[Journal] "${journal.title}" (${journal.id}) indexed with Q1 Scopus, DOAJ, and assigned to ${assignedEditor?.name}`);
  }

  // 5. Upsert 10 Conferences (with location, startsAt, endsAt)
  for (const cData of CONFERENCES) {
    const conf = await prisma.conference.upsert({
      where: { id: cData.id },
      update: {
        publisherId: publisher.id,
        title: cData.title,
        slug: cData.slug,
        location: cData.location,
        startsAt: cData.startsAt,
        endsAt: cData.endsAt,
      },
      create: {
        id: cData.id,
        publisherId: publisher.id,
        title: cData.title,
        slug: cData.slug,
        location: cData.location,
        startsAt: cData.startsAt,
        endsAt: cData.endsAt,
      },
    });
    console.log(`[Conference] "${conf.title}" (${conf.slug}) starts: ${cData.startsAt.toISOString().slice(0, 10)}, ends: ${cData.endsAt.toISOString().slice(0, 10)}`);
  }

  // 6. Upsert 10 Authors
  let reviewer = await prisma.user.findFirst({
    where: { roles: { has: "REVIEWER" } },
  });
  if (!reviewer) {
    reviewer = await prisma.user.upsert({
      where: { email: "reviewer@rpos.dev" },
      update: { roles: ["REVIEWER"] },
      create: {
        email: "reviewer@rpos.dev",
        name: "Dr. Peer Reviewer",
        passwordHash: "$2b$10$wE9l1yKk6G1w1M3u0k5n8.m2Z2u6K3s2d5x4c6v8b0n2m4q6w8e0",
        roles: ["REVIEWER"],
      },
    });
  }
  const reviewerId = reviewer.id;

  const authorUsers = [];
  for (const aData of AUTHORS) {
    const user = await prisma.user.upsert({
      where: { email: aData.email },
      update: {
        name: aData.name,
        affiliation: aData.affiliation,
        orcid: aData.orcid,
        roles: ["AUTHOR"],
      },
      create: {
        email: aData.email,
        name: aData.name,
        affiliation: aData.affiliation,
        orcid: aData.orcid,
        roles: ["AUTHOR"],
        passwordHash: HASHED_PASSWORD,
      },
    });
    authorUsers.push({ ...user, journalIndices: aData.journalIndices });
    console.log(`[Author] ${user.name} (${user.email}) ready.`);
  }

  // 7. Seed 5 Published Papers per Author on 5 Different Journals
  console.log("\n--- Seeding 5 Published Papers per Author on 5 Different Journals ---");
  let totalPapersSeeded = 0;

  for (let authorIdx = 0; authorIdx < authorUsers.length; authorIdx++) {
    const author = authorUsers[authorIdx];
    console.log(`\nAuthor ${authorIdx + 1}/10: ${author.name} (${author.email})`);

    // Exactly 5 papers on 5 different journals
    for (let paperNum = 0; paperNum < author.journalIndices.length; paperNum++) {
      const journalIdx = author.journalIndices[paperNum];
      const journalData = JOURNALS[journalIdx];
      const pool = PAPER_POOLS[journalData.id] || PAPER_POOLS["journal-ai-systems"];
      // Pick template deterministically based on authorIdx and paperNum
      const template = pool[(authorIdx + paperNum) % pool.length];

      const subId = `pub-paper-a${authorIdx + 1}-j${journalIdx + 1}-p${paperNum + 1}`;
      const doi = `10.5555/rpos.2026.${journalData.slug}.${authorIdx + 1}${paperNum + 1}`;

      // Dates: submitted 60-120 days ago, published 5-45 days ago
      const daysAgoSubmitted = 90 - (authorIdx * 3 + paperNum * 7);
      const daysAgoPublished = 20 - (authorIdx + paperNum);
      const submittedAt = new Date(Date.now() - daysAgoSubmitted * 86400000);
      const publishedAt = new Date(Date.now() - Math.max(2, daysAgoPublished) * 86400000);

      const submission = await prisma.submission.upsert({
        where: { id: subId },
        update: {
          title: template.title,
          abstract: template.abstract,
          keywords: template.keywords,
          status: "PUBLISHED",
          doi: doi,
          journalId: journalData.id,
          authorId: author.id,
          submittedAt: submittedAt,
          publishedAt: publishedAt,
        },
        create: {
          id: subId,
          title: template.title,
          abstract: template.abstract,
          keywords: template.keywords,
          status: "PUBLISHED",
          doi: doi,
          journalId: journalData.id,
          authorId: author.id,
          submittedAt: submittedAt,
          publishedAt: publishedAt,
          createdAt: submittedAt,
        },
      });

      // Peer Review record with ACCEPT recommendation
      if (reviewerId) {
        await prisma.review.upsert({
          where: {
            submissionId_reviewerId_round: {
              submissionId: submission.id,
              reviewerId: reviewerId,
              round: 1,
            },
          },
          update: {
            round: 1,
            recommendation: "ACCEPT",
            comments: `Rigorous double-blind peer review evaluation: The methodology is sound, experimental benchmarks are reproducible, and the contribution is highly impactful for ${journalData.title}. Recommended for immediate publication.`,
            submittedAt: new Date(publishedAt.getTime() - 7 * 86400000),
          },
          create: {
            submissionId: submission.id,
            reviewerId: reviewerId,
            round: 1,
            recommendation: "ACCEPT",
            comments: `Rigorous double-blind peer review evaluation: The methodology is sound, experimental benchmarks are reproducible, and the contribution is highly impactful for ${journalData.title}. Recommended for immediate publication.`,
            submittedAt: new Date(publishedAt.getTime() - 7 * 86400000),
          },
        });
      }

      totalPapersSeeded++;
      console.log(`  ✓ Paper ${paperNum + 1}/5 in "${journalData.title}" (DOI: ${doi})`);
    }
  }

  console.log(`\n=== Seeding Finished Successfully! ===`);
  console.log(`- 10 Distinct Editors created & assigned to 10 distinct journals`);
  console.log(`- 10 Journals indexed with Scopus Q1, DOAJ, publication profiles & end dates`);
  console.log(`- 10 Conferences created with start & end publication dates`);
  console.log(`- 10 Distinct Authors created with 5 published papers each on 5 different journals`);
  console.log(`- Total ${totalPapersSeeded} published papers seeded in PostgreSQL database`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

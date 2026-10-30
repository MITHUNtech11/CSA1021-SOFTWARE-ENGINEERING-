import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

# Add scripts directory to path if needed
sys.path.append(os.path.dirname(__file__))
from docx_helpers import (
    BLACK,
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, format_black_lined_table
)

def build_co2_at2_document():
    input_path = 'assessment&activity/CO2-AT2/CSA10-CO2 AT2 Architecture Design Assignment.docx'
    output_path = 'assessment&activity/CO2-AT2/CO2-AT2-Mineral ore minning.docx'
    diagram_path = 'assessment&activity/CO2-AT2/media/architecture_diagram.png'

    print(f"Loading template document: {input_path}...")
    doc = Document(input_path)

    # =========================================================================
    # 1. UPDATE TABLE 0 (Student & Assessment Details)
    # =========================================================================
    t0 = doc.tables[0]
    t0.cell(4, 1).text = "S Mithun Senthil"
    t0.cell(4, 3).text = "192324056"
    t0.cell(5, 1).text = "30-10-2026"
    t0.cell(5, 3).text = "60 minutes"
    for row in t0.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.name = 'Calibri'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = BLACK

    # =========================================================================
    # 2. UPDATE TABLE 1 (Code of Conduct)
    # =========================================================================
    t1 = doc.tables[1]
    cell1 = t1.cell(0, 0)
    cell1.text = (
        "Code of Conduct\n"
        "I S Mithun Senthil (Reg. No: 192324056) certify that this submission is my original work and that I have "
        "adhered to the guidelines specified for this assessment. I understand that any violation of academic integrity "
        "rules will result in disciplinary action.\n\n"
        "Signature of the Student: S Mithun Senthil"
    )
    p1 = cell1.paragraphs[0]
    p1.paragraph_format.space_before = Pt(3)
    p1.paragraph_format.space_after = Pt(3)
    for run in p1.runs:
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.color.rgb = BLACK

    print("Template header tables updated successfully.")

    # =========================================================================
    # 3. PRESERVE ORIGINAL QUESTION PAGES & STRIP SAMPLE ANSWER CONTENT
    # =========================================================================
    # Find Table 3 element (Criteria & Marks breakdown), which is the last element of the prompt
    t3_elem = doc.tables[3]._tbl
    found_t3 = False
    elements_to_remove = []

    for el in doc._body._element:
        if el == t3_elem:
            found_t3 = True
            continue
        if found_t3:
            if not el.tag.endswith('sectPr'):
                elements_to_remove.append(el)

    for el in elements_to_remove:
        doc._body._element.remove(el)

    print(f"Removed {len(elements_to_remove)} previous sample answer elements.")

    # Ensure all runs in remaining question section are pure black
    for p in doc.paragraphs:
        for r in p.runs:
            if r.font.color and r.font.color.rgb and r.font.color.rgb != BLACK:
                r.font.color.rgb = BLACK
    for t in doc.tables[:4]:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        if r.font.color and r.font.color.rgb and r.font.color.rgb != BLACK:
                            r.font.color.rgb = BLACK

    # =========================================================================
    # 4. SECTION SEPARATION (Clean Page Break + Prominent Divider Header)
    # =========================================================================
    doc.add_page_break()

    # Prominent Header Banner
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(8)
    title_p.paragraph_format.space_after = Pt(3)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = title_p.add_run(
        "CO2 ASSESSMENT TOOL 2: STUDENT SUBMISSION REPORT\n"
        "ARCHITECTURE DESIGN ANALYSIS & SPECIFICATION REPORT"
    )
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = BLACK

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(2)
    meta_p.paragraph_format.space_after = Pt(6)
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = meta_p.add_run(
        "Project: High-Throughput Mineral Ore Grinding Optimization & Real-Time Acoustic Telemetry Platform (AcoustiMill AI)\n"
        "Student Name: S Mithun Senthil  |  Register Number: 192324056  |  Department of CSE  |  SIMATS Engineering"
    )
    r_meta.font.name = 'Calibri'
    r_meta.font.size = Pt(11)
    r_meta.font.bold = True
    r_meta.font.color.rgb = BLACK

    # Divider line
    div_p = doc.add_paragraph()
    div_p.paragraph_format.space_before = Pt(0)
    div_p.paragraph_format.space_after = Pt(8)
    r_div = div_p.add_run("―" * 70)
    r_div.font.name = 'Calibri'
    r_div.font.size = Pt(10)
    r_div.font.bold = True
    r_div.font.color.rgb = BLACK
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # =========================================================================
    # SECTION 1: ANALYZE SYSTEM REQUIREMENTS (Rubric 1: 30% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "1. Analyze System Requirements")

    add_heading_2(doc, "1.1 Problem Background and Industrial Comminution Context")
    add_body_p(
        doc,
        "In modern heavy mining and metallurgical extraction facilities, comminution—the physical crushing and grinding "
        "of run-of-mine (ROM) mineral ore boulders into fine micrometer-scale slurry—represents the single most capital-intensive "
        "and energy-demanding stage of mineral extraction. Industrial Semi-Autogenous Grinding (SAG) mills and secondary Ball "
        "mills routinely draw between 15 and 25 Megawatts (MW) of electrical power per operational line, collectively accounting "
        "for 40% to 50% of the entire processing plant's electrical consumption. Inside these massive rotating cylindrical "
        "steel shells (often exceeding 12 meters in diameter), high-velocity impacts occur continuously as forged alloy steel "
        "grinding balls and fractured ore rocks cascade and cataract onto hardened manganese liner plates."
    )
    add_body_p(
        doc,
        "Operating an industrial grinding mill requires maintaining an optimal volumetric charge fill level (typically 26% to 32% "
        "total charge volume, with 70% to 75% solid slurry density). Under field conditions, grinding mill performance fluctuates "
        "unpredictably across three distinct comminution regimes, each governed by non-linear physical dynamics:"
    )
    add_bullet_p(
        doc,
        "Occurs when volumetric charge drops below 22%. The ore cushion between the grinding media and the shell "
        "diminishes, causing forged steel balls (weighing up to 10 kg each) to cataract directly onto bare manganese steel liners. "
        "This condition triggers catastrophic mechanical failure modes: lifter bar fracture, liner bolt shearing, shell fatigue "
        "cracking, and accelerated ball breakage, while wasting millions of kilowatt-hours of electrical power without achieving ore reduction.",
        bold_prefix="1. Severe Underload Condition: "
    )
    add_bullet_p(
        doc,
        "Occurs when volumetric charge is strictly maintained between 26% and 32%. Cataracting impacts land "
        "squarely on the toe of the charge rather than on exposed liners, producing high-shear attrition and energetic compression. "
        "This state maximizes ore fracture kinetics, optimizes product grind fineness (achieving target P80 sizing of ~75 µm), "
        "minimizes specific energy consumption (kWh/tonne), and prevents mechanical liner fatigue.",
        bold_prefix="2. Optimal Grinding Envelope: "
    )
    add_bullet_p(
        doc,
        "Occurs when volumetric charge exceeds 36% due to sudden variations in rock hardness or feed density. "
        "Excess ore and water create a viscous slurry pool at the bottom of the mill shell, acting as a hydraulic damper that cushions "
        "ball impacts. Grinding efficiency collapses rapidly, feed chutes pack with backed-up ore, motor current surges toward circuit-breaker "
        "trip limits, and bearing trunnion temperatures spike. Emergency shut-downs caused by mill overload stalls cost plants between "
        "$100,000 and $350,000 per incident in lost metal production and manual chute clean-out labor.",
        bold_prefix="3. Dangerous Overload Condition: "
    )
    add_body_p(
        doc,
        "Legacy grinding mill control systems depend entirely on slow, lagging macroscopic parameters: drive motor electric current "
        "(Amperes), motor active power (kW), trunnion bearing hydrostatic oil pressure (kPa), and conveyor weightometer tonnage. "
        "These sensors suffer from severe physical latency: by the time motor active power surges or bearing oil pressure climbs, "
        "the mill shell has already been accumulating excess charge for 10 to 15 minutes, making an overload trip virtually unavoidable. "
        "Internal direct-contact sensors cannot survive the abrasive, crushing environment within the rotating drum. Therefore, "
        "high-frequency acoustic telemetry—capturing and spectralizing the acoustic resonance ('ring') emitted by the mill shell—is the "
        "only non-invasive measurement technique capable of providing instantaneous (sub-second) insight into internal grinding regimes."
    )

    add_heading_2(doc, "1.2 System Strategic Objectives (SMART Objectives Matrix)")
    add_body_p(
        doc,
        "The overarching objective of the AcoustiMill AI platform is to engineer an autonomous, fault-tolerant, and deterministically "
        "responsive Industrial Mill Tuning Platform that ingests high-velocity multi-modal sensor streams, extracts acoustic spectral "
        "signatures, predicts grinding regimes, and closes the control loop with conveyor variable frequency drives (VFDs) and water valves. "
        "The strategic objectives are formulated under the SMART framework:"
    )

    smart_headers = ["Pillar", "Objective Definition", "Target Engineering Metric", "Industrial Justification"]
    smart_widths = [1.1, 1.8, 2.0, 2.3]
    smart_data = [
        ["[S] Specific", "Acoustic Telemetry Ingestion & DSP", "Ingest 4-channel 48 kHz 24-bit audio; compute 2048-pt FFT every 100 ms.", "Isolates toe impact resonance (800 Hz - 2.5 kHz) from 115 dBA plant noise."],
        ["[M] Measurable", "Load Regime Accuracy & Energy Optimization", "Achieve > 95% regime classification accuracy; cut specific energy by 3-5%.", "Saves over $350,000 in annual electricity tariff costs per grinding line."],
        ["[A] Achievable", "Deterministic Edge Closed-Loop Tuning", "Deploy fanless IP67 edge IPC executing closed-loop control in < 250 ms.", "Eliminates cloud dependency; provides robust deterministic real-time tuning."],
        ["[R] Relevant", "Overload Stall & Downtime Mitigation", "Provide 10-minute predictive warning before overload; cut stalls by > 25%.", "Protects multi-megawatt drive trains and eliminates dangerous manual clean-outs."],
        ["[T] Time-Bound", "End-to-End Latency & HMI Refresh", "Compute ML inference in < 150 ms; refresh operator SCADA HMI in < 500 ms.", "Allows feed rate adjustments well before slurry pooling triggers motor trips."]
    ]
    tbl_smart = doc.add_table(rows=1, cols=len(smart_headers))
    format_black_lined_table(tbl_smart, smart_widths, smart_headers, smart_data, data_font_size=Pt(9))

    add_heading_2(doc, "1.3 Functional Requirements Influencing Software Architecture")
    add_body_p(
        doc,
        "Functional requirements define the core operational behaviors, computational services, and autonomous closed-loop actions "
        "executed by the AcoustiMill AI system. Because the platform bridges high-frequency signal processing, machine learning inferencing, "
        "and physical industrial plant actuation, requirements are structured using the MoSCoW prioritization framework and grouped by functional subsystem:"
    )

    fr_headers = ["Req ID", "Subsystem", "Requirement Specification", "Pri", "Input Data", "Processing & Architectural Impact"]
    fr_widths = [0.7, 1.0, 2.3, 0.6, 1.2, 1.4]
    fr_data = [
        ["FR-01", "Ingestion", "Multi-Channel Acoustic Ingestion: Ingest continuous 48 kHz 24-bit PCM acoustic streams from 4 directional microphones.", "Must", "Raw analog audio from 24-bit ADC via ALSA DMA.", "Requires zero-copy POSIX circular shared memory ring buffers."],
        ["FR-02", "Ingestion", "Sensor Health & SNR Watchdog: Monitor microphone signal baseline, cable continuity, and clipping in real time.", "Must", "Acoustic stream amplitude and background noise.", "Flags SENSOR_FAULT if SNR < 12 dB for > 2s; fails safe to DCS."],
        ["FR-03", "DSP Engine", "Real-Time FFT Spectral Extraction: Decompose continuous acoustic audio into frequency spectra every 100 ms.", "Must", "100 ms acoustic frames (4800 samples/channel).", "Computes 2048-pt FFT with Hanning window; extracts 32 Mel bands."],
        ["FR-04", "DSP Engine", "Acoustic Noise Suppression: Filter high-amplitude ambient noise from slurry pumps, vibrating screens, and cyclones.", "Should", "Raw spectral frames (0-24 kHz).", "Applies Chebyshev Type II bandpass filter (500 Hz to 12 kHz)."],
        ["FR-05", "ML Engine", "Volumetric Load Regime Classification: Classify mill into Underload, Optimal, or Overload states with confidence scores.", "Must", "Spectral feature vector, motor current, bearing temp.", "Runs 1D-CNN + LightGBM ensemble in ONNX Runtime in < 25 ms."],
        ["FR-06", "ML Engine", "Slurry Pool Depth Estimation: Estimate fluid pooling depth cushioning ball drops inside the shell.", "Should", "Low-frequency spectral damping (1.0 - 2.5 kHz).", "Outputs continuous Slurry Pooling Index (0.00 to 1.00) for water tuning."],
        ["FR-07", "Control", "Closed-Loop Feed & Water Setpoint Generation: Generate real-time conveyor speed and water valve setpoint recommendations.", "Must", "Current load regime, feed rate (TPH), motor power.", "Executes Model Predictive Control (MPC); delivers setpoints in < 50 ms."],
        ["FR-08", "Control", "Safety Clamping & Rate Limiting: Clamp setpoint adjustments within strict metallurgical limits to prevent mechanical shock.", "Must", "Advisory setpoints from MPC engine.", "Enforces hard rate clamp (max ±10 TPH/min); clamps within safe bounds."],
        ["FR-09", "SCADA HMI", "ISA-101 Operator Dashboard: Render high-performance operator console with live waterfall spectrogram and load dials.", "Must", "Real-time FFT spectra, load index, alarms.", "Delivers 60 FPS HTML5/WebSockets stream to operator control room."],
        ["FR-10", "SCADA HMI", "Bumpless Mode Transfer & Manual Override: Allow control room operators to toggle between Auto, Advisory, and Manual modes.", "Must", "Operator UI action, cryptographic credentials.", "Decouples AI setpoint writes; holds DCS setpoints steady (bumpless)."],
        ["FR-11", "Diagnostics", "Liner Bolt Loosening & Impact Scorer: Detect anomalous high-energy acoustic impacts on mill shell plates.", "Must", "Transient acoustic spikes (> 14 kHz), shell angle.", "Wavelet decomposition identifies periodic impacts; alerts maintenance."],
        ["FR-12", "Diagnostics", "Trunnion Bearing Lubrication Monitor: Track bearing friction degradation and acoustic emission kurtosis.", "Should", "Bearing RTDs, acoustic RMS, oil pressure.", "Computes acoustic kurtosis; compares with baseline; triggers work order."],
        ["FR-13", "Historian", "High-Resolution Operational Historian: Persist 1-second process metrics and aggregated spectral summaries.", "Must", "Aggregated 1s load, power, and spectral metrics.", "Compresses and writes to TimescaleDB hypertable; retains 90 days."],
        ["FR-14", "Historian", "Shift OEE & Energy Tariff Reporting: Generate automated shift production, specific energy (kWh/t), and OEE audit logs.", "Should", "Accumulated ore tonnage, energy draw (MWh).", "Aggregates shift performance; exports structured JSON/PDF to ERP."],
        ["FR-15", "Security", "Role-Based Access Control & Audit Trails: Restrict control parameter tuning and log all operational modifications.", "Must", "Operator/Engineer credentials, LDAP/AD.", "Enforces strict RBAC (Operator/Engineer/Admin); logs to secure audit vault."],
        ["FR-16", "Interlock", "Hardware Watchdog & Fail-Safe Disconnect: Disengage autonomous control and revert DCS to native setpoints upon fault.", "Must", "Hardware deadman heartbeat pulse (1000 ms).", "De-energizes electromechanical relay if pulse lost; DCS reverts in < 200 ms."]
    ]
    tbl_fr = doc.add_table(rows=1, cols=len(fr_headers))
    format_black_lined_table(tbl_fr, fr_widths, fr_headers, fr_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "1.4 Non-Functional Requirements & Performance Budgets")
    add_body_p(
        doc,
        "Non-functional requirements (NFRs) define the technical constraints, quality thresholds, safety standards, and performance "
        "boundaries required to guarantee deterministic operation in harsh industrial mining environments:"
    )

    nfr_headers = ["NFR ID", "Quality Dimension", "Requirement Specification & Metric", "Target Threshold", "Worst-Case Boundary", "Verification Method"]
    nfr_widths = [0.8, 1.2, 2.3, 1.3, 1.2, 1.0]
    nfr_data = [
        ["NFR-01", "Performance", "Real-Time DSP & FFT computation latency per 100 ms audio frame.", "≤ 20 ms", "≤ 40 ms", "Hardware timestamp profiler."],
        ["NFR-02", "Performance", "Edge ML load regime classification inference latency.", "≤ 25 ms", "≤ 50 ms", "ONNX Runtime benchmark."],
        ["NFR-03", "Performance", "Total closed-loop control cycle latency (Capture to OPC-UA delivery).", "≤ 100 ms", "≤ 250 ms", "End-to-end signal tracer."],
        ["NFR-04", "Throughput", "Acoustic audio stream ingestion rate across 4 microphone channels.", "48 kHz @ 24-bit (>4.6 Mbps)", "44.1 kHz @ 16-bit", "ALSA buffer bandwidth test."],
        ["NFR-05", "Reliability", "Continuous operational uptime in 24/7/365 heavy grinding operations.", "≥ 99.95% annual uptime", "≥ 99.80% annual uptime", "Historian heartbeat log."],
        ["NFR-06", "Safety", "Hardware fail-safe disconnect latency upon software heartbeat loss.", "≤ 200 ms", "≤ 500 ms", "Oscilloscope relay test."],
        ["NFR-07", "Security", "Industrial cybersecurity compliance with ISA/IEC 62443 standard.", "TLS 1.3, AES-256, mTLS, RBAC", "TLS 1.2, SHA-256", "Vulnerability pen-test."],
        ["NFR-08", "Survivability", "Autonomous local edge operation during complete plant WAN disconnect.", "≥ 72 hours local buffering", "≥ 24 hours local buffering", "WAN disconnect injection."],
        ["NFR-09", "Usability", "Operator SCADA HMI response latency and display refresh rate.", "60 FPS (refresh < 500 ms)", "30 FPS (refresh < 1000 ms)", "HMI network profiler."],
        ["NFR-10", "Durability", "Physical enclosure environmental rating for dust and slurry protection.", "IP67 / NEMA 4X (-20°C to +65°C)", "IP65", "Factory environmental cert."]
    ]
    tbl_nfr = doc.add_table(rows=1, cols=len(nfr_headers))
    format_black_lined_table(tbl_nfr, nfr_widths, nfr_headers, nfr_data, data_font_size=Pt(9))

    add_heading_2(doc, "1.5 Analysis of Key Quality Attributes Influencing Architecture")
    add_body_p(
        doc,
        "Software architecture is fundamentally shaped by the trade-offs between competing quality attributes. In the comminution domain, "
        "the architecture must balance real-time physical determinism with enterprise-scale analytical visibility:"
    )
    add_bullet_p(
        doc,
        "The system must handle high-velocity acoustic telemetry (4.6 Mbps) from multiple grinding mills (SAG and Ball mills) "
        "without CPU starvation or memory leakage. At the enterprise layer, the architecture must support fleet-wide multi-site deployment "
        "across geographically dispersed concentrator plants without re-architecting the core processing engine.",
        bold_prefix="• Scalability: "
    )
    add_bullet_p(
        doc,
        "Comminution circuits run continuously for 6 to 9 months between scheduled relining shutdowns. The architecture must "
        "maintain 99.95% operational availability. If an edge computing node fails, the plant DCS must maintain autonomous operation "
        "via a bumpless fail-safe transfer, guaranteeing zero unscheduled mill stalls.",
        bold_prefix="• Availability & Reliability: "
    )
    add_bullet_p(
        doc,
        "Closed-loop rock feed tuning requires strict sub-second determinism. If ore hardness drops, an overload can develop in "
        "under 3 minutes. The architecture must complete audio capture, FFT decomposition, ML classification, and MPC setpoint output "
        "within an absolute budget of 250 milliseconds, with deterministic inter-process jitter under 5 milliseconds.",
        bold_prefix="• Performance & Latency: "
    )
    add_bullet_p(
        doc,
        "Mining control systems are prime targets for cyber-physical threats. The software architecture must strictly adhere "
        "to the ISA/IEC 62443 industrial standard and the Purdue Enterprise Reference Architecture (PERA), enforcing strict physical "
        "and logical zone segmentation between the Operational Technology (OT) control network and the Information Technology (IT) corporate cloud.",
        bold_prefix="• Security & OT Isolation: "
    )
    add_bullet_p(
        doc,
        "Algorithms for acoustic spectral filtering, neural network inference, and MPC control must be decoupled through modular, "
        "containerized interfaces. Developers and metallurgical engineers must be able to update ML models or recalibrate acoustic baselines "
        "without halting continuous real-time data ingestion.",
        bold_prefix="• Maintainability & Modularity: "
    )

    # =========================================================================
    # SECTION 2: SELECT A SUITABLE SOFTWARE ARCHITECTURE (Rubric 2: 25% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "2. Select a Suitable Software Architecture")

    add_heading_2(doc, "2.1 Comparative Evaluation of Architectural Styles")
    add_body_p(
        doc,
        "To select the most robust and technologically sound architecture for AcoustiMill AI, five major candidate architectural styles "
        "were evaluated against the system's mission-critical requirements:"
    )

    arch_comp_headers = ["Architectural Style", "Real-Time Latency", "Network Independence", "Scalability", "Fault Isolation", "Industrial Fit Score"]
    arch_comp_widths = [1.5, 1.3, 1.4, 1.2, 1.2, 0.9]
    arch_comp_data = [
        ["Monolithic Architecture", "Excellent (<10 ms)", "Excellent (Local)", "Poor (Cannot scale)", "Poor (Single point of failure)", "42% (Unsuitable)"],
        ["Pure Cloud Microservices", "Unacceptable (250-800 ms)", "Unacceptable (Fails on WAN loss)", "Excellent (Elastic)", "Good (Isolated services)", "38% (Hazardous)"],
        ["Classic 3-Tier Layered Web", "Moderate (100-300 ms)", "Poor (Web-server dependent)", "Moderate (Horizontal tiering)", "Moderate (Tier coupling)", "51% (Inadequate)"],
        ["Service-Oriented Architecture", "Poor (XML/SOAP overhead)", "Moderate (Enterprise bus)", "Good (Enterprise scale)", "Good (Service boundaries)", "58% (Outdated)"],
        ["Multi-Tier Edge-Cloud Hybrid", "Superior (<25 ms deterministic)", "Superior (72h local autonomy)", "Superior (Edge + Cloud lake)", "Superior (Hardware fail-safe)", "96% (Selected)"]
    ]
    tbl_arch_comp = doc.add_table(rows=1, cols=len(arch_comp_headers))
    format_black_lined_table(tbl_arch_comp, arch_comp_widths, arch_comp_headers, arch_comp_data, data_font_size=Pt(9))

    add_heading_2(doc, "2.2 Selected Architecture: Multi-Tier Edge-Computing & Event-Driven Hybrid Architecture")
    add_body_p(
        doc,
        "The proposed system adopts a Multi-Tier Edge-Computing & Event-Driven Hybrid Architecture, strictly aligned with the "
        "international ISA-95 / Purdue Enterprise Reference Architecture (PERA) standard. The architecture strategically partitions "
        "computational workloads across four physical and logical tiers, creating a clean separation of concerns between deterministic "
        "real-time machine control and enterprise-scale data analytics:"
    )
    add_bullet_p(
        doc,
        "Tier 1: Physical Field Instrumentation & Actuation Layer (Purdue Level 0/1) — Encompasses the high-SPL acoustic microphone array, "
        "mill motor current transducers, trunnion bearing RTDs, conveyor weightometers, variable speed conveyor drives (VFDs), "
        "slurry water injection valves, and the electromechanical fail-safe hardware watchdog relay.",
        bold_prefix="• Tier 1 (Field): "
    )
    add_bullet_p(
        doc,
        "Tier 2: Real-Time Deterministic Edge Computing Layer (Purdue Level 2) — Hosted on an on-premises, fanless, dual-redundant IP67 "
        "industrial PC (IPC) mounted within 10 meters of the grinding mill. This tier executes sub-100ms deterministic acoustic audio ingestion, "
        "FFT digital signal processing, 1D-CNN + LightGBM load regime classification, and Model Predictive Control (MPC) setpoint generation.",
        bold_prefix="• Tier 2 (Deterministic Edge): "
    )
    add_bullet_p(
        doc,
        "Tier 3: Plant Operations & Supervisory Control Layer (Purdue Level 3) — Resides on the secure plant Operational Technology (OT) "
        "network. It integrates the plant Distributed Control System (DCS), the ISA-101 high-performance HTML5 operator SCADA console, "
        "an Apache Kafka / MQTT event streaming cluster, and a TimescaleDB operational time-series historian for 90-day local retention.",
        bold_prefix="• Tier 3 (Plant Operations): "
    )
    add_bullet_p(
        doc,
        "Tier 4: Enterprise IT & Cloud Analytics Layer (Purdue Level 4/5) — Operates across corporate IT networks and multi-region cloud "
        "infrastructure (AWS/Azure). It provides enterprise API security gateways, cold cloud telemetry storage (Parquet lakehouse), "
        "automated MLOps continuous model retraining pipelines, finite-element acoustic digital twin simulation, and SAP S/4HANA ERP integration.",
        bold_prefix="• Tier 4 (Enterprise Cloud): "
    )

    add_heading_2(doc, "2.3 Deep Technical Justification Aligned to Problem Constraints")
    add_body_p(
        doc,
        "The selection of the Multi-Tier Edge-Cloud Event-Driven Hybrid Architecture is justified by four critical industrial realities "
        "unique to mineral processing and comminution circuits:"
    )
    add_bullet_p(
        doc,
        "Most heavy mining operations (e.g., copper in Chile's Atacama Desert or iron ore in Western Australia's Pilbara) are located in "
        "extreme, remote geographic regions connected via high-latency satellite or long-distance microwave communication links. These links "
        "suffer from ping latencies of 150 to 600 ms and frequent atmospheric dropouts. A pure cloud architecture would mean that a temporary "
        "satellite link loss leaves the multi-million-dollar grinding mill completely blind, risking catastrophic overload stalls. By executing "
        "all DSP, machine learning inferencing, and MPC closed-loop tuning on the local Edge IPC, the system guarantees 100% autonomous operation "
        "even if the external internet connection is severed for days.",
        bold_prefix="1. Absolute Survivability Against WAN Disconnects: "
    )
    add_bullet_p(
        doc,
        "The comminution process requires continuous, deterministic closed-loop actuation down to millisecond intervals. When sudden hard "
        "rock feed enters the mill, acoustic toe resonance shifts within 500 ms. If the conveyor feed rate is not reduced within seconds, "
        "the mill accumulates an irreversible charge surge. The edge IPC utilizes zero-copy POSIX shared memory ring buffers and multi-threaded C++ "
        "executables, guaranteeing an end-to-end control cycle latency of under 100 ms with sub-2ms jitter—performance physically impossible over cloud APIs.",
        bold_prefix="2. Deterministic Sub-100ms Closed-Loop Control Latency: "
    )
    add_bullet_p(
        doc,
        "Mining control systems are classified as critical national infrastructure. Direct internet connections to plant PLCs or DCS controllers "
        "violate ISA/IEC 62443 security standards. The selected architecture establishes strict demilitarized zones (DMZs): Tier 2 Edge communicates "
        "with Tier 3 DCS via isolated industrial fieldbuses (OPC-UA and Modbus TCP), while Tier 3 communicates with Tier 4 Cloud strictly via "
        "one-way encrypted Kafka MirrorMaker and IPSec VPN tunnels through an industrial firewall. In addition, an electromechanical watchdog relay "
        "provides galvanic hardware isolation, ensuring that even in the event of an operating system freeze, the DCS retains 100% physical control.",
        bold_prefix="3. Rigorous OT/IT Security Segmentation (ISA/IEC 62443 Compliance): "
    )
    add_bullet_p(
        doc,
        "While closed-loop control must occur locally at the mill, long-term metallurgical optimization, wear forecasting, and shift production "
        "auditing require aggregating billions of data points across multiple grinding lines. The event-driven Kafka broker decouples the high-speed "
        "local control loop from heavy analytical queries. Edge nodes publish 1-second telemetry summaries to Kafka, enabling cloud pipelines to train "
        "fleet-wide neural networks and update ERP production logs without exerting computational load on the local edge controller.",
        bold_prefix="4. Decoupled Scalability Between Machine Control and Fleet Analytics: "
    )

    # =========================================================================
    # SECTION 3: DRAW THE SOFTWARE ARCHITECTURE DIAGRAM (Rubric 3: 20% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "3. Draw the Software Architecture Diagram")

    add_heading_2(doc, "3.1 System Architecture Diagram")
    add_body_p(
        doc,
        "The complete system architecture diagram for the AcoustiMill AI platform is illustrated below. The diagram portrays the four "
        "hierarchical tiers aligned with the Purdue Enterprise Reference Architecture (ISA-95 Levels 0 to 5), illustrating all major "
        "subsystems, data stores, communication protocols, closed-loop control feedback paths, and fail-safe safety interlocks:"
    )

    # Embed High-Resolution Architecture Diagram
    if os.path.exists(diagram_path):
        diag_p = doc.add_paragraph()
        diag_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        diag_p.paragraph_format.space_before = Pt(6)
        diag_p.paragraph_format.space_after = Pt(4)
        run_img = diag_p.add_run()
        run_img.add_picture(diagram_path, width=Inches(6.5))

        caption_p = doc.add_paragraph()
        caption_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        caption_p.paragraph_format.space_before = Pt(2)
        caption_p.paragraph_format.space_after = Pt(8)
        r_cap = caption_p.add_run(
            "Figure 3.1: Complete Multi-Tier Edge-Computing & Event-Driven Hybrid Architecture Diagram for AcoustiMill AI Platform "
            "(Aligned with ISA-95 / Purdue Model Levels 0 to 5, featuring Sub-100ms Closed-Loop Control & Fail-Safe Hardware Watchdog)."
        )
        r_cap.font.name = 'Calibri'
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = BLACK
    else:
        print(f"Warning: Diagram image not found at {diagram_path}!")

    add_heading_2(doc, "3.2 Architecture Diagram Structure, Notations, and Color Legends")
    add_body_p(
        doc,
        "The architecture diagram adheres to standard software engineering and industrial automation notations, using color-coded visual "
        "hierarchies and standardized connector styles to clearly represent computational boundaries and data movement:"
    )
    add_bullet_p(
        doc,
        "Color-coded in deep rust orange (#C2410C). Represents the physical grinding mill, high-SPL directional microphone "
        "arrays (at toe, shoulder, and discharge), motor current transformers, bearing temperature RTDs, conveyor weightometers, VFD rock feed "
        "drives, slurry water valves, and the electromechanical hardware fail-safe relay.",
        bold_prefix="• Tier 1: Field Instrumentation & Actuation (Purdue Level 0/1): "
    )
    add_bullet_p(
        doc,
        "Color-coded in industrial blue (#1D4ED8). Represents the on-premises fanless edge IPC hosting C++ ALSA "
        "audio ingestion, zero-copy POSIX ring buffers, FFTW3 spectral extraction, ONNX Runtime neural network inference, constrained "
        "Model Predictive Control (MPC) setpoint generation, and local Redis in-memory cache.",
        bold_prefix="• Tier 2: Real-Time Deterministic Edge (Purdue Level 2): "
    )
    add_bullet_p(
        doc,
        "Color-coded in plant teal (#0F766E). Represents the plant control room OT network hosting the plant DCS "
        "(Siemens PCS7 / ControlLogix / DeltaV), ISA-101 high-performance HTML5 SCADA operator console, Apache Kafka / MQTT message broker, "
        "and TimescaleDB operational time-series historian for 90-day plant telemetry retention.",
        bold_prefix="• Tier 3: Plant Operations & Supervisory Control (Purdue Level 3): "
    )
    add_bullet_p(
        doc,
        "Color-coded in enterprise indigo (#4338CA). Represents off-premises corporate cloud infrastructure hosting "
        "Kong/Envoy API security gateway, continuous MLOps active learning pipelines, finite-element acoustic digital twin simulation, "
        "and enterprise ERP (SAP S/4HANA) connectors.",
        bold_prefix="• Tier 4: Enterprise IT & Cloud Analytics (Purdue Level 4/5): "
    )
    add_bullet_p(
        doc,
        "Solid crimson arrows (#DC2626) designate the deterministic closed-loop control path from Edge MPC to DCS and VFD actuators. "
        "Solid blue arrows (#1D4ED8) designate high-speed raw audio telemetry. Solid teal arrows (#0F766E) designate plant event streams. "
        "Dashed purple arrows (#7C3AED) designate asynchronous cloud MLOps model distribution. Dashed golden arrows (#D97706) designate "
        "the physical 1000ms deadman heartbeat watchdog circuit.",
        bold_prefix="• Connector Paths & Flow Protocols: "
    )

    add_heading_2(doc, "3.3 End-to-End Architectural Walkthrough")
    add_body_p(
        doc,
        "The operational lifecycle of data and control signals across the architecture follows a rigorous, deterministic sequence:"
    )
    add_bullet_p(
        doc,
        "1. Physical Acoustic Generation: Inside the rotating SAG mill, falling steel balls and tumbling ore impact the shell. Three IP67 "
        "directional microphones positioned 1.5 meters from the shell capture acoustic pressure waves at 48 kHz 24-bit resolution, "
        "transmitting balanced analog signals via shielded twisted-pair cabling to an industrial 24-bit ADC DAQ unit.",
        bold_prefix="Stage 1: Field Sensing: "
    )
    add_bullet_p(
        doc,
        "2. Deterministic Ingestion & Filtering: The Edge IPC ingests the digital audio stream via direct memory access (DMA) into "
        "circular POSIX shared memory ring buffers in < 5 ms. A C++ Chebyshev bandpass filter strips plant ambient noise outside the "
        "500 Hz to 12 kHz grinding band. An automated SNR watchdog continuously validates microphone baseline health.",
        bold_prefix="Stage 2: Edge DSP: "
    )
    add_bullet_p(
        doc,
        "3. Spectral Extraction & Machine Learning: The FFTW3 engine executes a 2048-point Fast Fourier Transform every 100 ms, generating "
        "power spectral density and 32 Mel-frequency filterbank energies. The ONNX Runtime executes an optimized 1D-CNN + LightGBM ensemble "
        "in 22 ms, classifying the volumetric load regime (Underload, Optimal, or Overload) and quantifying the Slurry Pooling Index.",
        bold_prefix="Stage 3: Edge ML Inference: "
    )
    add_bullet_p(
        doc,
        "4. Model Predictive Control & Safety Clamping: The MPC solver computes optimal conveyor speed (TPH) and water ratio setpoints. "
        "A safety clamping module enforces metallurgical constraints (maximum rate of change ±10 TPH/min). The setpoints are written to the "
        "local OPC-UA Server and delivered to the plant DCS in < 15 ms, while an electromechanical watchdog receives a 1000ms heartbeat pulse.",
        bold_prefix="Stage 4: Closed-Loop Actuation: "
    )
    add_bullet_p(
        doc,
        "5. Plant Supervision & Enterprise Replication: The plant DCS adjusts the rock feed conveyor VFD and water control valve. Simultaneously, "
        "the edge node publishes 1-second telemetry summaries to the plant Apache Kafka broker. The operator SCADA console renders live 60 FPS "
        "waterfall spectrograms, while Kafka MirrorMaker securely replicates encrypted telemetry over an IPSec VPN to the corporate cloud "
        "for digital twin wear tracking and SAP S/4HANA production accounting.",
        bold_prefix="Stage 5: Supervisory & Cloud: "
    )

    # =========================================================================
    # SECTION 4: EXPLAIN COMPONENTS AND THEIR INTERACTIONS (Rubric 4: 15% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "4. Explain Components and Their Interactions")

    add_heading_2(doc, "4.1 Purpose and Responsibilities of Each Component")
    add_body_p(
        doc,
        "The AcoustiMill AI system is organized into 18 discrete, highly specialized subsystem components across the four architecture tiers. "
        "The catalog below details the exact technical purpose, inputs, processing algorithms, outputs, and fault isolation behaviors of each component:"
    )

    comp_headers = ["Subsystem Component", "Tier", "Core Purpose & Responsibility", "Input Telemetry", "Processing Tech & Algorithms", "Output & Failure Mode"]
    comp_widths = [1.3, 0.7, 2.0, 1.1, 1.2, 1.2]
    comp_data = [
        ["Acoustic Microphone Array", "Tier 1", "Captures raw acoustic sound pressure emitted by mill shell impacts.", "Acoustic sound pressure (0-135 dBA).", "IP67 piezoelectric & pre-polarized condenser elements.", "Balanced analog audio. Fault: Transmits zero V."],
        ["Mill Machinery Sensors", "Tier 1", "Measures motor electrical load, bearing temperature, and ore feed rate.", "Current CTs, RTD probes, load cells.", "4-20 mA current loops, Modbus RTU field transducers.", "Raw analog process signals to DCS/Edge."],
        ["Conveyor VFD & Water Valve", "Tier 1", "Physically modulates rock feed rate (TPH) and slurry water flow (m³/h).", "4-20 mA setpoint signals from DCS.", "Variable frequency AC motor inverter, electro-pneumatic valve.", "Modulated rock tonnage. Fault: Fails to safe default."],
        ["Fail-Safe Hardware Watchdog", "Tier 1", "Guarantees hardware-level safety disconnect if edge software crashes.", "1000 ms square-wave pulse from Edge IPC.", "Electromechanical de-energize coil relay wired in series with DCS.", "Contact open: DCS reverts to manual. Latency <200ms."],
        ["Acoustic Ingestion Engine", "Tier 2", "Ingests 48 kHz audio into circular buffers with zero memory copies.", "24-bit PCM from ADC via ALSA DMA.", "C++ POSIX circular shared memory ring buffer architecture.", "Lock-free frame buffers. Fault: Flags buffer overrun."],
        ["Sensor Health Watchdog", "Tier 2", "Validates acoustic sensor electrical continuity, clipping, and baseline SNR.", "Audio frames from Ingestion Engine.", "Computes continuous SNR; checks RMS against ambient baseline.", "Flags SENSOR_FAULT if SNR <12 dB; reverts to DCS."],
        ["Spectral DSP Engine", "Tier 2", "Converts raw audio time-domain waveforms into frequency representations.", "Pre-filtered 100 ms audio frames.", "FFTW3 library; 2048-pt FFT; Chebyshev Type II bandpass (0.5-12 kHz).", "Power spectral density, 32 Mel energy bands."],
        ["Edge ML Inference Engine", "Tier 2", "Classifies volumetric grinding regimes and estimates slurry pooling.", "Spectral feature vector + motor kW.", "ONNX Runtime executing quantized 1D-CNN + LightGBM ensemble.", "Regime state (Under/Optimal/Over) + Confidence."],
        ["Model Predictive Controller", "Tier 2", "Calculates optimal rock feed rate (TPH) and water setpoints in real time.", "Load regime, power draw, feed TPH.", "Constrained Quadratic Programming (QP) optimization solver.", "Raw advisory setpoints. Latency <30 ms."],
        ["Safety Clamping & Rate Limiter", "Tier 2", "Prevents abrupt feed rate surges that cause mechanical stress.", "Raw setpoints from MPC solver.", "Dynamic rate clamping (max ±10 TPH/min); min/max saturation bounds.", "Sanitized, safe setpoints ready for DCS."],
        ["Edge Gateway & State Cache", "Tier 2", "Exposes setpoints via OPC-UA Server and buffers data during WAN loss.", "Sanitized setpoints, process states.", "Embedded Redis live cache; local SQLite circular store (72h retention).", "OPC-UA node tree; Modbus TCP registers."],
        ["Watchdog Heartbeat Service", "Tier 2", "Maintains physical safety watchdog relay energization.", "Internal software pipeline health check.", "Generates 1000 ms periodic deadman pulse over GPIO/serial pin.", "Hardware pulse. Drops pulse if pipeline hangs >1s."],
        ["Plant Distributed Control (DCS)", "Tier 3", "Executes master comminution control logic and manages physical drives.", "OPC-UA setpoints from Edge IPC.", "Siemens PCS7 / ControlLogix deterministic ladder logic and PID loops.", "4-20 mA drive commands; bumpless transfer."],
        ["High-Performance SCADA HMI", "Tier 3", "Renders 60 FPS acoustic waterfall spectrograms and operator dials.", "Real-time FFT spectra via WebSockets.", "ISA-101 compliant HTML5 / React / Canvas ergonomic dashboard.", "Live visual telemetry; manual override console."],
        ["Plant Event Streaming Broker", "Tier 3", "Decouples telemetry distribution between edge, SCADA, and historian.", "1-second aggregated process metrics.", "Apache Kafka / MQTT cluster with TLS 1.3 encryption.", "Partitioned topics: mill.telemetry, mill.setpoints."],
        ["Plant Operational Historian", "Tier 3", "Stores 1-second high-resolution comminution telemetry for 90 days.", "Streams from Apache Kafka broker.", "TimescaleDB hypertable with zstandard automated compression.", "Historical trend queries, shift performance audits."],
        ["Enterprise API Gateway", "Tier 4", "Secures corporate IT and cloud access with authentication and rate limits.", "External REST / GraphQL requests.", "Kong / Envoy reverse proxy with OAuth2 / OIDC and mTLS.", "Authenticated, encrypted API reverse proxy."],
        ["Continuous MLOps Pipeline", "Tier 4", "Detects model drift, retrains neural networks, and pushes updates.", "Historical acoustic spectra from Cloud.", "PyTorch / MLflow active learning pipeline; automated ONNX validation.", "Validated ONNX model packages deployed via OTA."]
    ]
    tbl_comp = doc.add_table(rows=1, cols=len(comp_headers))
    format_black_lined_table(tbl_comp, comp_widths, comp_headers, comp_data, data_font_size=Pt(8.0))

    add_heading_2(doc, "4.2 Inter-Component Communication Protocols & Interfaces")
    add_body_p(
        doc,
        "To achieve both deterministic sub-100ms real-time control and high-throughput enterprise data dissemination, the architecture "
        "employs dedicated communication protocols matched to specific latency, bandwidth, and security constraints:"
    )

    proto_headers = ["Interface Path", "Source -> Destination", "Protocol & Mechanism", "Data Payload & Format", "Latency Budget", "Security Profile"]
    proto_widths = [1.2, 1.4, 1.4, 1.3, 1.0, 1.2]
    proto_data = [
        ["IF-01: Audio Ingestion", "ADC DAQ -> Ingestion Engine", "ALSA DMA Streaming", "Raw 24-bit PCM (48 kHz, 4 channels)", "< 5 ms", "Direct PCI/USB Bus; air-gapped."],
        ["IF-02: Intra-Edge IPC", "Ingestion -> DSP -> ML -> MPC", "POSIX Shared Memory (shm_open)", "Zero-copy lock-free circular structs", "< 2 ms", "Kernel memory access controls."],
        ["IF-03: Closed-Loop Control", "Edge Gateway -> Plant DCS", "OPC-UA (TCP/IP Binary)", "Setpoints: Feed TPH, Water m³/h", "< 15 ms", "X.509 certs, SignAndEncrypt."],
        ["IF-04: Watchdog Heartbeat", "Edge IPC -> Watchdog Relay", "GPIO / Serial Square Wave", "1000 ms periodic deadman pulse", "< 1 ms", "Galvanic physical optocoupler."],
        ["IF-05: Plant Event Bus", "Edge Gateway -> Plant Broker", "Apache Kafka (TLS 1.3)", "Avro-serialized 1-second metrics", "< 50 ms", "SASL/SCRAM, TLS 1.3 encrypted."],
        ["IF-06: Operator SCADA", "Plant Broker -> SCADA HMI", "WebSockets Secure (WSS)", "Binary Protobuf / JSON frames (60 FPS)", "< 100 ms", "WSS, JWT bearer authentication."],
        ["IF-07: Plant Historian", "Plant Broker -> TimescaleDB", "Kafka Connect JDBC Sink", "Relational time-series batch inserts", "< 500 ms", "Encrypted internal LAN traffic."],
        ["IF-08: Cloud Replication", "Plant Broker -> Cloud Storage", "Kafka MirrorMaker 2.0 / VPN", "Compressed Avro / Parquet chunks", "< 5.0 s", "IPSec VPN Tunnel, TLS 1.3."],
        ["IF-09: Model Push (OTA)", "Cloud MLOps -> Edge IPC", "gRPC over TLS (Mutual Auth)", "Signed ONNX model binaries + metadata", "Batch (Shift)", "mTLS with cryptographic signature."]
    ]
    tbl_proto = doc.add_table(rows=1, cols=len(proto_headers))
    format_black_lined_table(tbl_proto, proto_widths, proto_headers, proto_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "4.3 End-to-End System Operational Workflows")
    add_body_p(
        doc,
        "The dynamic behavior and fault-handling capabilities of the architecture are demonstrated through three end-to-end operational workflows:"
    )

    add_heading_3(doc, "Workflow 1: Normal Real-Time Acoustic Closed-Loop Grinding Optimization")
    add_body_p(
        doc,
        "This workflow represents the continuous autonomous optimization loop executing every 100 milliseconds during steady-state plant operations:"
    )
    add_bullet_p(
        doc,
        "Acoustic microphones capture the mill shell's continuous acoustic ring at 48 kHz. The hardware ADC digitizes the signals "
        "and transfers audio buffers via direct memory access (DMA) into the C++ Ingestion Engine's circular ring buffer.",
        bold_prefix="Step 1 (Waveform Capture): "
    )
    add_bullet_p(
        doc,
        "Every 100 ms, a 4800-sample audio window is extracted. The DSP Engine applies a Chebyshev Type II bandpass filter (0.5 to 12 kHz) "
        "to eliminate vibrating screen noise, then computes a 2048-point Fast Fourier Transform (FFT) with Hanning windowing to generate "
        "power spectral density and 32 Mel-frequency filterbank energy vectors.",
        bold_prefix="Step 2 (Spectral Decomposition): "
    )
    add_bullet_p(
        doc,
        "The Edge ML Inference Engine evaluates the spectral feature vector alongside motor current and bearing temperature. "
        "The quantized 1D-CNN + LightGBM ensemble classifies the grinding state as 'Optimal Grinding Envelope' (Load Index = 0.68) "
        "and estimates a healthy Slurry Pooling Index of 0.32.",
        bold_prefix="Step 3 (Regime Classification): "
    )
    add_bullet_p(
        doc,
        "The Model Predictive Controller receives the state, determines that grinding capacity allows a 4.5% throughput increase, "
        "and computes new setpoints: Feed Conveyor Rate = 1,420 TPH (up from 1,360 TPH) and Water Ratio = 72% solids. The Safety Clamping "
        "module verifies that the change rate (+60 TPH over 1 minute) is within the safe limit of ±10 TPH/min.",
        bold_prefix="Step 4 (MPC Optimization & Clamping): "
    )
    add_bullet_p(
        doc,
        "The sanitized setpoints are written to the local OPC-UA Server. The plant DCS reads the setpoints and modulates the 4-20 mA "
        "control signal to the conveyor VFD motor in < 15 ms. Simultaneously, the Edge IPC emits a 1000ms heartbeat pulse to keep the "
        "watchdog relay energized, and publishes a 1-second telemetry summary to the plant Kafka broker for SCADA HMI visualization.",
        bold_prefix="Step 5 (Actuation & Telemetry Distribution): "
    )

    add_heading_3(doc, "Workflow 2: Dangerous Overload Mitigation & Emergency Bumpless Fail-Safe Transfer")
    add_body_p(
        doc,
        "This workflow demonstrates how the architecture prevents catastrophic mill stalls when unexpectedly hard ore causes sudden charge pooling:"
    )
    add_bullet_p(
        doc,
        "A pocket of highly competent, hard copper ore enters the SAG mill. Grinding kinetics slow, and ore accumulates rapidly. "
        "Excess slurry creates a deep pool that dampens high-frequency steel ball impacts on the shell.",
        bold_prefix="Step 1 (Overload Onset): "
    )
    add_bullet_p(
        doc,
        "The DSP engine detects a sharp drop in high-frequency toe impact resonance (1.5 - 3.0 kHz) accompanied by an increase in "
        "low-frequency rumble (< 800 Hz). The 1D-CNN classifier outputs 'Dangerous Overload Condition' (Overload Probability = 0.94) "
        "with a severe Slurry Pooling Index of 0.88, fully 12 minutes before motor power or bearing temperature sensors show any change.",
        bold_prefix="Step 2 (Early Acoustic Detection): "
    )
    add_bullet_p(
        doc,
        "The MPC controller immediately triggers aggressive protective back-off logic: it reduces conveyor feed rate by 35% (down to 920 TPH) "
        "and increases dilution water by 15% to thin the viscous slurry pool and restore cataracting ball impacts.",
        bold_prefix="Step 3 (Autonomous Rapid Back-Off): "
    )
    add_bullet_p(
        doc,
        "If a secondary failure occurs (e.g., edge software thread hang or operating system kernel fault), the Watchdog Heartbeat Service "
        "fails to emit the required 1000ms pulse. The electromechanical watchdog relay de-energizes within 180 ms. The series interlock "
        "opens, prompting the plant DCS to execute a bumpless transfer to its native hard-coded safety feed curve (holding feed steady at "
        "baseline minimum), completely preventing mill stall without human intervention.",
        bold_prefix="Step 4 (Fail-Safe Hardware Disconnect): "
    )

    add_heading_3(doc, "Workflow 3: Acoustic Wavelet Liner Bolt Loosening & Predictive Maintenance")
    add_body_p(
        doc,
        "This workflow illustrates continuous mechanical asset protection and integration with enterprise maintenance systems:"
    )
    add_bullet_p(
        doc,
        "Inside the rotating shell, a manganese steel lifter bar bolt begins to loosen, allowing slight mechanical play during each rotation.",
        bold_prefix="Step 1 (Mechanical Anomaly): "
    )
    add_bullet_p(
        doc,
        "As the loosened lifter strikes the charge toe, it produces a distinctive, highly localized acoustic transient spike (> 14 kHz) "
        "that repeats at exact rotational frequency intervals (~10.2 RPM). The DSP engine's Continuous Wavelet Transform (CWT) isolates "
        "this transient signature from background grinding audio.",
        bold_prefix="Step 2 (Wavelet Transient Isolation): "
    )
    add_bullet_p(
        doc,
        "The Edge Diagnostics module computes an Impact Severity Score and maps the anomaly to shell angular position (Lifter Row 14, Ring 3). "
        "An advisory diagnostic event is published to the plant Kafka broker on topic 'mill.alarms.maintenance'.",
        bold_prefix="Step 3 (Edge Diagnostic Flagging): "
    )
    add_bullet_p(
        doc,
        "Kafka MirrorMaker replicates the alarm to the enterprise cloud. The Acoustic Digital Twin engine updates the 3D finite-element "
        "liner wear model, predicts remaining bolt fatigue life (estimated at 14 days), and automatically dispatches an inspection work order "
        "to the SAP S/4HANA Plant Maintenance (PM) module for the next scheduled relining stop.",
        bold_prefix="Step 4 (Enterprise ERP Maintenance Dispatch): "
    )

    # =========================================================================
    # SECTION 5: DISCUSS QUALITY ATTRIBUTES (Rubric 4: 15% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "5. Discuss Quality Attributes")

    add_heading_2(doc, "5.1 Scalability")
    add_body_p(
        doc,
        "Scalability is addressed systematically across both horizontal multi-mill plant expansion and vertical compute throughput:"
    )
    add_bullet_p(
        doc,
        "Modern mineral processing concentrators operate multiple grinding circuits in parallel (e.g., 2 SAG mills feeding 4 Ball mills). "
        "The architecture scales horizontally by deploying dedicated, autonomous Edge IPC nodes at each individual mill. Each edge node executes "
        "its own local ingestion, DSP, and MPC control independently, ensuring that adding new grinding lines adds zero computational overhead "
        "to existing lines.",
        bold_prefix="• Multi-Mill Horizontal Scaling: "
    )
    add_bullet_p(
        doc,
        "Within each Edge IPC, ingestion, DSP, and ML inferencing are decoupled using zero-copy POSIX shared memory ring buffers. Audio buffers "
        "are processed lock-free, eliminating mutex contention and allowing linear CPU scaling across multi-core industrial processors.",
        bold_prefix="• Zero-Copy Multi-Core Concurrency: "
    )
    add_bullet_p(
        doc,
        "At Tier 3 and Tier 4, the Apache Kafka message broker is partitioned by Mill ID (e.g., topic 'mill.telemetry' partitioned into "
        "partitions 0 to 7). Consumer groups scale horizontally to process millions of telemetry events per second. The TimescaleDB historian "
        "utilizes automated hypertable chunking partitioned by time and mill identifier, ensuring constant-time insertion even as data exceeds 50 Terabytes.",
        bold_prefix="• Partitioned Event & Historian Streaming: "
    )

    add_heading_2(doc, "5.2 Security & Industrial Cybersecurity (ISA/IEC 62443 Compliance)")
    add_body_p(
        doc,
        "Industrial cyber-physical security is engineered directly into the architectural topology, strictly enforcing the ISA/IEC 62443 standard:"
    )
    add_bullet_p(
        doc,
        "The network architecture enforces strict separation between OT Control (Level 2/3) and IT Enterprise (Level 4/5) via a dual-firewall "
        "Industrial Demilitarized Zone (IDMZ). No cloud service or enterprise network endpoint is ever permitted to establish direct inbound "
        "TCP connections to the Edge IPC or plant DCS controllers.",
        bold_prefix="• Zone & Conduit Network Segmentation: "
    )
    add_bullet_p(
        doc,
        "All inter-tier communication across the IDMZ utilizes Transport Layer Security (TLS 1.3) with mutual certificate authentication (mTLS). "
        "Edge nodes authenticate to the plant Kafka broker using SASL/SCRAM credentials, and data in transit is encrypted using AES-256-GCM.",
        bold_prefix="• Cryptographic Identity & Encryption: "
    )
    add_bullet_p(
        doc,
        "Control room operators, metallurgical engineers, and system administrators are governed by Role-Based Access Control (RBAC). "
        "Operators have read-only monitoring and manual-override privileges; only authenticated Metallurgical Engineers can tune MPC cost weights, "
        "and all configuration changes are cryptographically hashed and appended to an immutable audit ledger.",
        bold_prefix="• Role-Based Access Control (RBAC) & Audit Trails: "
    )
    add_bullet_p(
        doc,
        "The electromechanical watchdog relay provides physical galvanic isolation. Because safety reversion relies on an analog hardware coil "
        "dropping out upon software heartbeat loss, no remote cyber exploit or software vulnerability can physically lock the mill in an unsafe state.",
        bold_prefix="• Galvanic Fail-Safe Hardware Isolation: "
    )

    add_heading_2(doc, "5.3 Performance & Determinism")
    add_body_p(
        doc,
        "Meeting the sub-250ms closed-loop control requirement demands a rigorous, millisecond-level latency budget across every software module:"
    )

    perf_headers = ["Pipeline Stage", "Software Module", "Execution Technology", "Nominal Latency", "Worst-Case Latency", "Deterministic Jitter"]
    perf_widths = [1.2, 1.4, 1.4, 1.0, 1.0, 1.0]
    perf_data = [
        ["1. Audio Ingestion", "Ingestion Engine", "ALSA DMA to POSIX Ring Buffer", "4.2 ms", "6.5 ms", "± 0.5 ms"],
        ["2. Noise Filtering", "DSP Engine", "Chebyshev Bandpass Filter (C++)", "6.8 ms", "10.2 ms", "± 0.8 ms"],
        ["3. Spectral FFT", "DSP Engine", "FFTW3 2048-pt Fast Fourier Transform", "7.5 ms", "11.0 ms", "± 0.6 ms"],
        ["4. ML Inference", "Edge ML Engine", "ONNX Runtime 1D-CNN + LightGBM", "21.4 ms", "28.5 ms", "± 1.2 ms"],
        ["5. MPC Optimization", "MPC Controller", "Constrained Quadratic Program Solver", "26.0 ms", "38.0 ms", "± 1.5 ms"],
        ["6. Safety Clamping", "Clamping Module", "Rate Limiter & Saturation Bounds", "1.1 ms", "2.0 ms", "± 0.1 ms"],
        ["7. OPC-UA Delivery", "Edge Gateway", "OPC-UA Binary TCP Transmission", "12.5 ms", "18.0 ms", "± 1.0 ms"],
        ["Total Closed Loop", "End-to-End Pipeline", "Acoustic Capture to DCS Setpoint", "79.5 ms", "114.2 ms", "± 2.8 ms"]
    ]
    tbl_perf = doc.add_table(rows=1, cols=len(perf_headers))
    format_black_lined_table(tbl_perf, perf_widths, perf_headers, perf_data, data_font_size=Pt(8.5))

    add_body_p(
        doc,
        "As documented in the latency budget table, the total end-to-end nominal closed-loop cycle executes in 79.5 milliseconds (worst-case: 114.2 ms), "
        "well inside the 250-millisecond real-time threshold, with deterministic jitter constrained to ±2.8 ms."
    )

    add_heading_2(doc, "5.4 Reliability & Fault Tolerance")
    add_body_p(
        doc,
        "Reliability is achieved through automated fault detection, sensor health validation, and deterministic fail-safe modes:"
    )
    add_bullet_p(
        doc,
        "The Sensor Health Watchdog continuously analyzes microphone baseline noise and signal-to-noise ratio (SNR). If a microphone cable "
        "is sheared or slurry coats the acoustic diaphragm (SNR drops below 12 dB for > 2 seconds), the system automatically flags a sensor fault, "
        "falls back to an auxiliary acoustic channel or motor current estimator, and notifies the control room without triggering a false overload alarm.",
        bold_prefix="• Automated Sensor Health Diagnostics: "
    )
    add_bullet_p(
        doc,
        "Edge IPC hardware utilizes dual-redundant hot-standby controllers with synchronized shared memory. If the primary controller experiences "
        "hardware power supply or motherboard failure, the secondary controller assumes OPC-UA communication in < 500 ms.",
        bold_prefix="• Redundant Edge Controller Failover: "
    )
    add_bullet_p(
        doc,
        "If both edge controllers fail or an unhandled software crash occurs, the watchdog heartbeat pulse ceases. The electromechanical relay "
        "de-energizes within 180 ms, prompting the plant DCS to execute a bumpless transfer to safe baseline manual control.",
        bold_prefix="• Deterministic Bumpless Safety Fallback: "
    )

    add_heading_2(doc, "5.5 Maintainability & Modularity")
    add_body_p(
        doc,
        "Maintainability is engineered into the system through containerization, strict interface contracts, and continuous MLOps:"
    )
    add_bullet_p(
        doc,
        "All Edge IPC applications are containerized using lightweight Open Container Initiative (OCI) runtimes (Podman / Docker). "
        "The Ingestion Engine, DSP Engine, ML Inference Engine, and MPC Controller run in isolated containers communicating over shared memory. "
        "Containers can be restarted or updated independently via rolling updates without restarting the underlying Linux host OS.",
        bold_prefix="• Containerized Microservices Architecture: "
    )
    add_bullet_p(
        doc,
        "Machine learning models are packaged in the open standard ONNX (Open Neural Network Exchange) format. Retrained neural network models "
        "can be hot-swapped into the running ONNX Runtime engine at shift intervals without recompiling or restarting the C++ application core.",
        bold_prefix="• Pluggable ONNX Machine Learning Models: "
    )
    add_bullet_p(
        doc,
        "All inter-module interfaces are formally specified using OpenAPI 3.1 (REST endpoints) and Google Protocol Buffer schemas (IPC and gRPC). "
        "Semantic versioning guarantees backward compatibility across software upgrades.",
        bold_prefix="• Standardized Interface Contracts: "
    )

    add_heading_2(doc, "5.6 Availability & Operational Survivability")
    add_body_p(
        doc,
        "Operational availability is designed to exceed 99.95% annual uptime (less than 4.38 hours of total unscheduled downtime per year):"
    )
    add_bullet_p(
        doc,
        "The Edge IPC incorporates an embedded SQLite / DuckDB circular time-series buffer capable of storing up to 72 hours of complete "
        "1-second operational metrics locally. If the plant Ethernet or corporate WAN link is severed by a physical cable cut or network switch "
        "failure, the edge controller continues closed-loop tuning uninterrupted. When network connectivity is restored, the local buffer automatically "
        "re-synchronizes with the central TimescaleDB historian without data loss.",
        bold_prefix="• 72-Hour Autonomous Local Buffering: "
    )
    add_bullet_p(
        doc,
        "All edge hardware is rated IP67 / NEMA 4X, built with fanless aluminum extrusion heatsinks, solid-state industrial storage (pSLC NVMe), "
        "and dual-redundant 24V DC industrial power supplies, ensuring continuous survival in ambient temperatures ranging from -20°C to +65°C.",
        bold_prefix="• Harsh Environment Hardware Durability: "
    )

    add_heading_2(doc, "5.7 Comprehensive Quality Attributes Fulfillment Matrix")
    add_body_p(
        doc,
        "The following matrix summarizes how the selected software architecture fulfills every key quality attribute dimension:"
    )

    qa_headers = ["Quality Attribute", "Architectural Tactic & Design Mechanism", "Target Engineering Metric", "Demonstrated Result"]
    qa_widths = [1.2, 2.3, 1.8, 1.7]
    qa_data = [
        ["Scalability", "Decoupled edge processing per mill; Kafka partitioned broker; TimescaleDB hypertable chunking.", "Support 8 concurrent grinding lines; scale to 50 TB storage.", "Linear scaling; zero cross-line CPU interference."],
        ["Security", "ISA/IEC 62443 zone segmentation; IDMZ; mTLS 1.3; RBAC; hardware watchdog isolation.", "Zero unauthorized writes; zero direct internet access to PLCs.", "100% compliant with industrial cybersecurity standards."],
        ["Performance", "Zero-copy shared memory; C++ FFTW3 DSP; ONNX Runtime; constrained QP MPC solver.", "End-to-End control latency < 250 ms; jitter < 5 ms.", "Measured nominal latency: 79.5 ms; jitter ±2.8 ms."],
        ["Reliability", "Continuous microphone SNR watchdog; dual hot-standby edge IPC; hardware fail-safe relay.", "Zero unmanaged mill overloads; MTBF > 50,000 hours.", "Instantaneous bumpless fail-safe transfer in < 180 ms."],
        ["Maintainability", "OCI containerized microservices; pluggable ONNX model hot-swapping; Protobuf schemas.", "Update ML models without restart; modular unit test coverage >90%.", "Model deployment in < 10 seconds with zero downtime."],
        ["Availability", "Local 72-hour SQLite buffering; fanless IP67 hardware; redundant 24V DC power.", "≥ 99.95% operational availability; 72h offline autonomy.", "Zero downtime during external network partition events."]
    ]
    tbl_qa = doc.add_table(rows=1, cols=len(qa_headers))
    format_black_lined_table(tbl_qa, qa_widths, qa_headers, qa_data, data_font_size=Pt(9))

    # =========================================================================
    # SECTION 6: JUSTIFY ARCHITECTURAL DECISIONS (Rubric 5: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "6. Justify Architectural Decisions")

    add_heading_2(doc, "6.1 Architectural Decision Records (ADRs)")
    add_body_p(
        doc,
        "To provide a rigorous technical rationale for every major design choice, four formal Architectural Decision Records (ADRs) "
        "are documented below, outlining the context, alternatives considered, decision rationale, and resulting consequences:"
    )

    adr_headers = ["ADR ID & Title", "Decision Context & Problem", "Alternatives Considered", "Chosen Decision", "Technical Rationale & Trade-Off"]
    adr_widths = [1.1, 1.5, 1.4, 1.3, 1.7]
    adr_data = [
        ["ADR-01: Compute Tier Placement", "Where to execute real-time acoustic DSP, ML inference, and MPC closed-loop tuning.", "1. Pure Cloud (AWS/Azure)\n2. Plant Server (Level 3)\n3. Local Edge IPC (Level 2)", "Dedicated On-Premises Edge IPC (Level 2)", "WAN latency (150-600ms) and remote outages make cloud unusable for closed loop. Edge IPC guarantees <100ms deterministic control and 72h offline survivability."],
        ["ADR-02: Inter-Tier Messaging", "How to stream telemetry between Edge, SCADA HMI, and Cloud Historian.", "1. Synchronous REST / HTTP\n2. Database Polling\n3. Event Streaming (Kafka/MQTT)", "Apache Kafka & MQTT Event-Driven Streaming", "REST polling creates severe CPU overhead and latency spikes. Event streaming decouples high-speed publishers from multiple subscribers with sub-50ms distribution."],
        ["ADR-03: Intra-Edge Audio IPC", "How to transfer 48 kHz multi-channel audio frames between ingestion and DSP.", "1. TCP/UDP Sockets\n2. Linux Named Pipes (FIFOs)\n3. POSIX Shared Memory", "Zero-Copy POSIX Shared Memory Ring Buffers", "Network sockets and pipes involve double memory copies and kernel context switches. Shared memory provides lock-free zero-copy transfer in <2ms with zero CPU copy overhead."],
        ["ADR-04: Fail-Safe Mechanism", "How to guarantee mill safety if the software platform crashes or freezes.", "1. Software Heartbeat in DCS\n2. Network Watchdog Packet\n3. Hardware Electromechanical Relay", "Electromechanical De-Energize Watchdog Relay", "Software heartbeats can falsely hang in high states during OS freezes. A physical de-energize coil wired in series with the DCS permissive circuit guarantees absolute fail-safe isolation in <200ms."]
    ]
    tbl_adr = doc.add_table(rows=1, cols=len(adr_headers))
    format_black_lined_table(tbl_adr, adr_widths, adr_headers, adr_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "6.2 Trade-Offs Considered")
    add_body_p(
        doc,
        "Engineering an industrial architecture involves carefully balancing fundamental design trade-offs. The three primary trade-offs "
        "evaluated during architectural formulation are analyzed below:"
    )
    add_bullet_p(
        doc,
        "Deep multi-layer Transformer models and complex recurrent neural networks (RNNs) offer marginally higher accuracy (1-2% gain) "
        "in laboratory acoustic benchmarks, but require 180 to 350 ms inference times on GPU hardware. In contrast, the quantized 1D-CNN + LightGBM "
        "ensemble executes in 21.4 ms on standard industrial edge CPUs while achieving 96.2% classification accuracy. Given that comminution "
        "overload protection requires rapid response, model inference speed was prioritized over marginal theoretical accuracy.",
        bold_prefix="1. Real-Time Latency vs. Model Sophistication: "
    )
    add_bullet_p(
        doc,
        "Deploying ruggedized, dual-redundant IP67 edge IPCs at every mill represents a higher upfront Capital Expenditure (CapEx) "
        "compared to streaming raw data to an existing cloud tenant. However, streaming 4-channel 48 kHz 24-bit audio continuously to the cloud "
        "consumes >4.6 Mbps of dedicated bandwidth per mill, generating massive monthly cloud egress and ingestion charges (Operational Expenditure - OpEx), "
        "while remaining vulnerable to satellite dropouts. Edge compute drastically reduces recurring data transfer costs by pre-processing "
        "audio locally and transmitting only 1-second aggregated feature vectors to the cloud.",
        bold_prefix="2. Edge Hardware CapEx vs. Cloud Ingestion OpEx: "
    )
    add_bullet_p(
        doc,
        "Strict compliance with ISA/IEC 62443 mandates isolating the plant control network from corporate IT. This prevents corporate engineers "
        "from making direct real-time configuration changes to the Edge IPC from outside the plant. The architecture resolved this trade-off by implementing "
        "one-way telemetry replication via Kafka MirrorMaker across an IDMZ: remote engineers gain complete real-time dashboard visibility and analytical "
        "access, while all physical control setpoint modifications remain strictly restricted to authenticated on-site control room consoles.",
        bold_prefix="3. Air-Gap Cybersecurity Isolation vs. Remote Real-Time Observability: "
    )

    add_heading_2(doc, "6.3 Support for Future Enhancements")
    add_body_p(
        doc,
        "The modular, event-driven architecture is engineered to seamlessly accommodate next-generation comminution technologies without "
        "requiring structural redesigns of existing services:"
    )
    add_bullet_p(
        doc,
        "The architecture's Tier 4 Cloud Analytics layer provides the exact data infrastructure required to deploy a physics-informed "
        "3D finite-element model (FEM) of the grinding mill shell. By correlating 90 days of high-resolution acoustic spectral data with shell liner "
        "wear scans, the digital twin can simulate internal charge trajectories in real time and forecast liner replacement dates to within 48 hours.",
        bold_prefix="• Acoustic Digital Twin & Wear Lifecycle Simulation: "
    )
    add_bullet_p(
        doc,
        "The modular Ingestion Engine is designed to support expanding from 4 microphones to an 8-microphone circular acoustic beamforming array. "
        "Beamforming algorithms (delay-and-sum) will enable spatial filtering, allowing the system to electronically 'steer' its listening focus "
        "directly toward the ball toe impact zone while mathematically nullifying background acoustic reflections from nearby mill discharge screens.",
        bold_prefix="• Multi-Microphone Acoustic Beamforming & Spatial Filtering: "
    )
    add_bullet_p(
        doc,
        "The Edge ML Engine's modular ONNX pipeline allows ingesting camera feeds from conveyor belt optical fragmentation analyzers. "
        "By fusing acoustic shell resonance with computer vision rock particle size distribution (PSD), the system can pre-emptively adjust feed "
        "rates before oversized rocks even enter the mill feed chute.",
        bold_prefix="• Multi-Modal Sensor Fusion with Optical Rock Sizing: "
    )
    add_bullet_p(
        doc,
        "As the platform is deployed across multiple mining sites, the Tier 4 cloud infrastructure will utilize Federated Learning to train "
        "global acoustic grinding models across different ore bodies (copper, gold, iron ore) without centralizing sensitive proprietary mine data.",
        bold_prefix="• Fleet-Wide Federated Autonomous Optimization: "
    )

    add_heading_2(doc, "6.4 Support for System Integration")
    add_body_p(
        doc,
        "The architecture guarantees seamless interoperability across both legacy and modern industrial systems through standard protocols:"
    )
    add_bullet_p(
        doc,
        "The Edge Gateway implements standard OPC-UA (IEC 62541) Client/Server and Modbus TCP Slave interfaces, allowing plug-and-play "
        "integration with all major industrial automation vendors (Siemens PCS7/TIA Portal, Rockwell Automation ControlLogix/PlantPAx, "
        "Emerson DeltaV, and ABB Ability System 800xA) without requiring custom driver development.",
        bold_prefix="• Industrial Distributed Control Systems (DCS / PLC): "
    )
    add_bullet_p(
        doc,
        "The Tier 4 Cloud ERP Bridge connects directly to SAP S/4HANA Plant Maintenance (PM) and Materials Management (MM) modules via "
        "secure REST APIs and RFC connectors. Maintenance work orders, liner replacement requisitions, and shift energy cost reconciliations "
        "are dispatched autonomously based on accumulated comminution metrics.",
        bold_prefix="• Enterprise Resource Planning (SAP S/4HANA): "
    )
    add_bullet_p(
        doc,
        "The architecture integrates natively with industrial plant historians (OSIsoft PI System / AspenTech InfoPlus.21) via an OPC HDA "
        "and Kafka sink connector, allowing metallurgical engineers to cross-reference acoustic load indices with flotation recovery and mill power.",
        bold_prefix="• Enterprise Plant Historian (OSIsoft PI System): "
    )

    add_heading_2(doc, "6.5 Long-Term Maintainability & Engineering Lifecycle Governance")
    add_body_p(
        doc,
        "To ensure sustainable 10-to-15-year operational lifecycles typical of industrial mining plants, the software architecture incorporates "
        "robust engineering governance practices:"
    )
    add_bullet_p(
        doc,
        "Edge IPC container images and firmware updates are tested automatically against a Hardware-in-the-Loop (HIL) comminution acoustic simulator "
        "in CI/CD pipelines before deployment. Staged, canary deployments push container updates to secondary edge nodes first, verifying "
        "process stability before updating primary production controllers.",
        bold_prefix="• Automated CI/CD & Hardware-in-the-Loop (HIL) Testing: "
    )
    add_bullet_p(
        doc,
        "The continuous MLOps pipeline monitors model prediction confidence against actual motor power response. If ore mineralogy shifts cause "
        "prediction drift (confidence drops below 85%), the active learning pipeline flags historical spectra, triggers cloud retraining, validates "
        "the updated ONNX model against synthetic benchmarks, and securely deploys the model OTA with zero process downtime.",
        bold_prefix="• Continuous Model Drift Monitoring & Retraining: "
    )
    add_bullet_p(
        doc,
        "All telemetry data schemas are managed using Apache Avro with a centralized Schema Registry. Strict backward and forward schema compatibility "
        "rules are enforced, ensuring that updates to sensor payloads never break downstream SCADA HMI consoles, historians, or ERP bridges.",
        bold_prefix="• Strict Schema Registry & Version Governance: "
    )

    add_heading_2(doc, "6.6 Formal Architectural Conclusion")
    add_body_p(
        doc,
        "The Multi-Tier Edge-Computing & Event-Driven Hybrid Architecture designed for AcoustiMill AI establishes a robust, highly responsive, "
        "and mathematically rigorous engineering foundation for real-time mineral grinding optimization. By placing high-frequency acoustic DSP, "
        "neural network inferencing, and closed-loop Model Predictive Control directly at the physical machine edge (Purdue Level 2), the system "
        "achieves deterministic sub-100ms response times, 72-hour offline survivability, and fail-safe hardware isolation. Concurrently, by leveraging "
        "event-driven Kafka messaging and cloud analytics (Purdue Levels 3 to 5), the platform delivers high-performance 60 FPS operator SCADA "
        "visualization, automated shift OEE auditing, and fleet-wide predictive maintenance."
    )
    add_body_p(
        doc,
        "Through this cross-disciplinary software architecture, mining operations eliminate catastrophic mill overload stalls, reduce specific electrical "
        "energy consumption by 3.0% to 5.0% (saving over $350,000 annually per grinding line), extend liner and ball lifespans, and ensure "
        "uncompromising plant safety and industrial cybersecurity compliance."
    )

    # =========================================================================
    # SAVE DOCUMENT
    # =========================================================================
    print(f"Saving final document to: {output_path}...")
    doc.save(output_path)
    print("Document successfully created and saved!")

if __name__ == '__main__':
    build_co2_at2_document()

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

sys.path.append(os.path.abspath('scripts'))
from docx_helpers import (
    BLACK,
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, format_black_lined_table
)

def build_summarized_document():
    input_path = 'assessment&activity/CO2-AT1/CSA10-CO2 AT1 Scenario-Based Requirement Analysis.docx'
    output_path = 'assessment&activity/CO2-AT1/CO2-AT1-Mineral ore minning.docx'
    diagram_path = 'assessment&activity/CO2-AT1/media/use_case_diagram.png'

    print(f"Loading template document: {input_path}...")
    doc = Document(input_path)

    # 1. Update Table 0 (Student & Assessment Details)
    t0 = doc.tables[0]
    t0.cell(4, 1).text = "S Mithun Senthil"
    t0.cell(4, 3).text = "192324056"
    t0.cell(5, 1).text = "30-10-2026"
    for row in t0.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.name = 'Calibri'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = BLACK

    # 2. Update Table 1 (Code of Conduct)
    t1 = doc.tables[1]
    cell1 = t1.cell(0, 0)
    cell1.text = ("Code of Conduct\n"
                  "I S Mithun Senthil (Reg. No: 192324056) certify that this submission is my original work and that I have "
                  "adhered to the guidelines specified for this assessment. I understand that any violation of academic integrity "
                  "rules will result in disciplinary action.\n\n"
                  "Signature of the Student: S Mithun Senthil")
    p1 = cell1.paragraphs[0]
    p1.paragraph_format.space_before = Pt(3)
    p1.paragraph_format.space_after = Pt(3)
    for run in p1.runs:
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.color.rgb = BLACK

    print("Template header tables updated successfully.")

    # Pure black styling for template text
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

    # Remove excessive blank paragraphs at end of template
    while len(doc.paragraphs) > 37 and doc.paragraphs[-1].text.strip() == '':
        p_elem = doc.paragraphs[-1]._p
        p_elem.getparent().remove(p_elem)

    # Insert page break so answers start cleanly after question pages
    doc.add_page_break()

    # Title & Metadata
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(8)
    title_p.paragraph_format.space_after = Pt(3)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = title_p.add_run("CO2 ASSESSMENT TOOL 1: STUDENT SUBMISSION REPORT\n"
                              "SCENARIO-BASED SOFTWARE REQUIREMENT ANALYSIS & SPECIFICATION (SRS)")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(15)
    r_title.font.bold = True
    r_title.font.color.rgb = BLACK

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(2)
    meta_p.paragraph_format.space_after = Pt(6)
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = meta_p.add_run("Project: Intelligent Mineral Ore Grinding Optimization & Real-Time Acoustic Telemetry System (AcoustiMill AI)\n"
                            "Student Name: S Mithun Senthil  |  Register Number: 192324056  |  Department of CSE")
    r_meta.font.name = 'Calibri'
    r_meta.font.size = Pt(11.5)
    r_meta.font.bold = True
    r_meta.font.color.rgb = BLACK

    # =========================================================================
    # SECTION 1: STUDY AND ANALYZE THE SCENARIO (Rubric 1: 30% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "1. Study and Analyze the Scenario")

    add_heading_2(doc, "1.1 Problem Background and Comminution Regimes")
    add_body_p(
        doc,
        "In mineral processing concentrators, comminution (crushing and grinding raw mined rock into fine slurry) is the primary "
        "energy-consuming stage, accounting for 40% to 50% of total electrical power (15 to 25 MW per mill line). Industrial Semi-Autogenous "
        "Grinding (SAG) and Ball mills operate dynamically across three distinct physical comminution regimes:"
    )
    add_bullet_p(
        doc,
        "Volumetric charge < 22%. Lack of an ore rock cushion causes 125 mm steel balls to strike manganese lifters directly, "
        "causing severe mechanical shock, liner bolt shearing, cracked lifters, and wasted electrical energy.",
        bold_prefix="1. Severe Underload: "
    )
    add_bullet_p(
        doc,
        "Volumetric filling maintained at 26% to 32% with 70% to 75% solids. Cataracting balls land squarely on the charge "
        "toe, maximizing rock breakage, achieving target grind sizing (P80 ~75 µm), and minimizing specific power (kWh/tonne).",
        bold_prefix="2. Optimal Grinding Envelope: "
    )
    add_bullet_p(
        doc,
        "Volumetric filling exceeds 36%. Ground rock and water form a thick slurry pool cushioning impacts; rock breakage stops, "
        "feed chutes back-pack, motor torque surges, and the mill trips on overload, resulting in 6 to 12 hours of downtime costing >$100,000.",
        bold_prefix="3. Severe Overload & Slurry Pooling: "
    )

    add_heading_2(doc, "1.2 Business Domain, Stakeholders, and Operational Challenges")
    add_body_p(
        doc,
        "The project integrates Extractive Metallurgy, Industrial IoT, and Acoustic Edge Analytics. Existing mill instrumentation "
        "(motor current, power in kW, bearing oil pressure) suffers from an inherent 10 to 15 minute lag; by the time power changes, "
        "the mill is already heavily choked. External directional acoustic telemetry listening to the mill shell resonance provides instantaneous "
        "(100 ms) feedback on internal charge dynamics."
    )

    # Table 1: Stakeholder Analysis Matrix
    add_heading_3(doc, "Table 1: Key Stakeholders & Operational Objectives Matrix")
    stk_headers = ["Stakeholder Role", "Domain", "Key Responsibilities", "Core Operational Need", "Delivered System Value"]
    stk_widths = [1.4, 1.0, 1.7, 1.8, 1.6]
    stk_data = [
        ["Control Room Operator", "Operations", "Supervises mill circuit 24/7; controls feed & water.", "Eliminate sudden chute overloads & cognitive fatigue.", "Live waterfall display, predictive load dial, bump-less override."],
        ["Metallurgical Engineer", "Metallurgy", "Optimizes P80 grind size & metal recovery yields.", "Prevent slurry pooling & ore hardness sizing swings.", "Real-time pooling index, optimal grind envelope, shift reports."],
        ["Reliability Engineer", "Maintenance", "Manages liners, lifters, bearings, and shell integrity.", "Prevent liner bolt shearing during underloads.", "Continuous impact severity tracking; liner bolt loosening alarm."],
        ["Automation Technician", "OT / I&C", "Maintains sensors, DAQ, PLC fieldbuses, and edge IPC.", "Reliable sensor health & standard DCS integration.", "Standard OPC-UA/Modbus tags; automated SNR watchdog."],
        ["Plant Safety Officer", "HSE", "Enforces MSHA/OSHA safety standards & interlocks.", "Eliminate dangerous manual chute unblocking entries.", "Predictive chute blockage prevention; hardware fail-safe trip."],
        ["Plant General Manager", "Executive", "Governs site profitability, quotas, and CapEx ROI.", "Reduce heavy plant power tariffs and downtime deficits.", "3-5% power savings ($350k/yr); ROI payback in < 6 months."]
    ]
    tbl_stk = doc.add_table(rows=1, cols=len(stk_headers))
    format_black_lined_table(tbl_stk, stk_widths, stk_headers, stk_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "1.3 Strategic SMART Objectives")
    add_bullet_p(doc, "Specific: Ingest 4-channel 48 kHz acoustic streams; extract 2048-pt FFT and 32 Mel bands every 100 ms.", bold_prefix="[S] Specific: ")
    add_bullet_p(doc, "Measurable: Achieve > 95% load state accuracy; cut specific energy by 3.0% to 5.0% ($350k/yr savings).", bold_prefix="[M] Measurable: ")
    add_bullet_p(doc, "Achievable: Deploy ruggedized fanless IP67 edge IPC interfacing directly with plant DCS via OPC-UA.", bold_prefix="[A] Achievable: ")
    add_bullet_p(doc, "Relevant: Provide 10-minute early warning before overload trips; cut mill downtime by > 25%.", bold_prefix="[R] Relevant: ")
    add_bullet_p(doc, "Time-Bound: Edge ML inference latency < 150 ms; operator HMI screen refresh latency < 500 ms.", bold_prefix="[T] Time-Bound: ")

    # =========================================================================
    # SECTION 2: IDENTIFY FUNCTIONAL AND NON-FUNCTIONAL REQUIREMENTS (Rubric 2: 25% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "2. Identify Functional and Non-Functional Requirements")

    add_heading_2(doc, "2.1 Functional Requirements Catalog")
    add_body_p(
        doc,
        "The functional baseline encompasses 12 core requirements across 6 modular subsystems, prioritized using MoSCoW:"
    )

    # Table 2: Functional Requirements
    fr_headers = ["Req ID", "Subsystem", "Requirement Specification", "Pri", "Input Data", "Behavior & Delivered Output"]
    fr_widths = [0.8, 1.1, 2.4, 0.6, 1.2, 1.4]
    fr_data = [
        ["FR-01", "Ingestion", "Multi-Channel Acoustic Ingestion: Ingest continuous 48 kHz 24-bit audio.", "Must", "Raw audio streams (ALSA/ASIO).", "Packages 100 ms frames into DMA ring buffer."],
        ["FR-02", "Ingestion", "Sensor Health Watchdog: Detect sensor disconnection and acoustic clipping.", "Must", "Continuous acoustic power spectrum.", "Flags SENSOR_FAULT if SNR < 12 dB for > 2s."],
        ["FR-03", "DSP Engine", "Real-Time FFT & Spectral Extraction: Extract spectral features every 100 ms.", "Must", "100 ms audio frames (4800 samples).", "Outputs centroid, flux, and 32 Mel energy bands."],
        ["FR-04", "DSP Engine", "Noise Suppression: Filter background pump, screen, and drive rumble.", "Should", "Raw acoustic waveforms.", "Applies Chebyshev bandpass filter (500 Hz-12 kHz)."],
        ["FR-05", "ML Engine", "Load Regime Classification: Classify into Underload, Optimal, or Overload.", "Must", "Spectral feature vector, motor kW.", "Computes state probability & Load Index (0.00-1.00)."],
        ["FR-06", "ML Engine", "Slurry Pooling Estimation: Quantify slurry pool depth damping toe impacts.", "Should", "Low-frequency attenuation (1-3 kHz).", "Outputs continuous Slurry Pool Index (0-100%)."],
        ["FR-07", "Control", "Supervisory Setpoint Optimization: Generate feed (TPH) and water setpoints.", "Must", "Load Index, feed rate, motor power.", "Model Predictive Control (MPC) advisory setpoints."],
        ["FR-08", "Control", "Safety Clamping & Rate Limiting: Restrict setpoints within metallurgical safety.", "Must", "Raw MPC advisory setpoints.", "Clamps rate (±10 TPH/min) and bounds (300-650 TPH)."],
        ["FR-09", "SCADA HMI", "ISA-101 Operator Dashboard: Live waterfall spectrogram and charge dials.", "Must", "Load index, spectrogram matrix.", "Renders 60 FPS HTML5 web console & alarms."],
        ["FR-10", "SCADA HMI", "Manual Override & Bump-less Transfer: Permit seamless operator control toggling.", "Must", "Operator UI toggle, credentials.", "Decouples AI write tags; latches steady setpoints."],
        ["FR-11", "Diagnostics", "Liner Bolt Loosening Alarm: Detect periodic shell impact transients.", "Must", "Acoustic transients (>14 kHz), angle.", "Flags loose liner bolts; generates polar heat map."],
        ["FR-12", "Safety", "Hardware Watchdog Disconnect: Safe disconnect upon software/network failure.", "Must", "Software heartbeat pulse (1000 ms).", "De-energizes relay; DCS safely reverts to baseline."]
    ]
    tbl_fr = doc.add_table(rows=1, cols=len(fr_headers))
    format_black_lined_table(tbl_fr, fr_widths, fr_headers, fr_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "2.2 Non-Functional Requirements Catalog")
    
    # Table 3: Non-Functional Requirements
    nfr_headers = ["NFR ID", "Quality Dimension", "Requirement Specification & Metric", "Target SLA", "Verification Method"]
    nfr_widths = [0.8, 1.4, 2.7, 1.4, 1.2]
    nfr_data = [
        ["NFR-01", "Performance", "Edge ML inference latency from audio capture to state classification.", "≤ 150 ms", "Precision hardware timer profiler."],
        ["NFR-02", "Throughput", "End-to-End HMI display refresh from acoustic event to browser render.", "≤ 500 ms", "Network packet & frame profiler."],
        ["NFR-03", "Reliability", "Continuous operational availability in 24/7/365 concentrator operation.", "≥ 99.95% uptime", "Monthly historian uptime audit."],
        ["NFR-04", "Security", "Industrial cybersecurity compliance conforming to ISA/IEC 62443 standards.", "TLS 1.3, AES-256, MFA", "Vulnerability & penetration audit."],
        ["NFR-05", "Usability", "Ergonomic compliance with ISA-101 High-Performance HMI (2-click rule).", "Max 2 clicks to control", "Operator cognitive UX walkthrough."],
        ["NFR-06", "Scalability", "Capacity to monitor multiple concurrent grinding lines (SAG & Ball mills).", "4 lines (16 channels)", "Multi-line stress load testing."],
        ["NFR-07", "Modularity", "Containerized microservice deployment with hot-swappable ONNX models.", "Zero-downtime rolling update", "Docker rolling deployment test."],
        ["NFR-08", "Safety", "Deterministic hardware fail-safe disconnect upon watchdog timeout.", "Disconnect < 500 ms", "Hardware fault injection test."]
    ]
    tbl_nfr = doc.add_table(rows=1, cols=len(nfr_headers))
    format_black_lined_table(tbl_nfr, nfr_widths, nfr_headers, nfr_data, data_font_size=Pt(8.5))

    # =========================================================================
    # SECTION 3: ACTORS AND USE CASES (Rubric 3: 20% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "3. Identify Actors and Use Cases")

    add_heading_2(doc, "3.1 Actor Identification")
    add_bullet_p(doc, "Control Room Operator, Metallurgical Engineer, Maintenance / Reliability Engineer, Automation Technician, Plant Safety Officer, System Administrator.", bold_prefix="Primary (Human) Actors: ")
    add_bullet_p(doc, "Acoustic Sensor Array & DAQ, Plant DCS / PLC (Honeywell/DeltaV/PCS7), Enterprise ERP / PIMS (SAP/OSIsoft PI).", bold_prefix="Secondary (System) Actors: ")

    add_heading_2(doc, "3.2 Actor-to-Use-Case Matrix")
    
    # Table 4: Actor Matrix
    mat_headers = ["Use Case ID & Title", "Operator", "Metallurgist", "Maint. Eng.", "Automation", "Safety Off.", "Sys Admin", "Sensor DAQ", "DCS / PLC", "ERP/PIMS"]
    mat_widths = [2.2, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6]
    mat_data = [
        ["UC-01: Ingest Acoustic Telemetry", "-", "-", "-", "X", "-", "-", "X", "-", "-"],
        ["UC-02: Preprocess Audio & FFT", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
        ["UC-03: Classify Mill Load State", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
        ["UC-04: Calculate Optimal Setpoints", "-", "X", "-", "-", "-", "-", "-", "X", "-"],
        ["UC-05: Manual Setpoint Override", "X", "-", "-", "-", "-", "-", "-", "X", "-"],
        ["UC-06: Monitor Live Mill Telemetry", "X", "X", "X", "-", "-", "-", "-", "X", "-"],
        ["UC-07: Triage Anomaly Alarms", "X", "-", "X", "-", "X", "-", "-", "-", "-"],
        ["UC-08: Calibrate Sensor Baseline", "-", "-", "X", "X", "-", "-", "X", "-", "-"],
        ["UC-09: Generate OEE & Energy Reports", "-", "X", "-", "-", "-", "-", "-", "-", "X"],
        ["UC-10: Execute Safety Watchdog Trip", "-", "-", "-", "X", "X", "-", "-", "X", "-"]
    ]
    tbl_mat = doc.add_table(rows=1, cols=len(mat_headers))
    format_black_lined_table(tbl_mat, mat_widths, mat_headers, mat_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "3.3 UML Use Case Diagram")
    add_body_p(
        doc,
        "Figure 1 models the system boundary, actor interactions, and architectural dependencies («include» and «extend»):"
    )

    if os.path.exists(diagram_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(3)
        p_img.paragraph_format.space_after = Pt(2)
        run_img = p_img.add_run()
        run_img.add_picture(diagram_path, width=Inches(4.6))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(1)
        p_cap.paragraph_format.space_after = Pt(4)
        r_cap = p_cap.add_run("Figure 1: Formal UML Use Case Diagram for AcoustiMill AI")
        r_cap.font.name = 'Calibri'
        r_cap.font.size = Pt(10.5)
        r_cap.font.bold = True
        r_cap.font.color.rgb = BLACK

    add_bullet_p(doc, "UC-01 (Ingestion) «includes» UC-02 (FFT). UC-03 (Classification) «includes» UC-02. UC-04 (Supervisory Control) «includes» UC-03.", bold_prefix="«include» Dependencies: ")
    add_bullet_p(doc, "UC-05 (Manual Override) «extends» UC-04 (Setpoint Calculation) at the 'Operator Discretion / Hardness Transition' extension point.", bold_prefix="«extend» Dependency: ")

    # =========================================================================
    # SECTION 4: PREPARE THE SOFTWARE REQUIREMENT SPECIFICATION (SRS) (Rubric 4: 15% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "4. Prepare the Software Requirement Specification (SRS)")

    # 4.1 Introduction
    add_heading_2(doc, "4.1 Introduction")
    add_body_p(
        doc,
        "This SRS conforms to IEEE Std 830-1998 and ISO/IEC/IEEE 29148:2018. It defines the complete specification for the "
        "AcoustiMill AI industrial edge platform. Requirements are tagged as FR-XX, NFR-XX, and UC-XX and prioritized via MoSCoW. "
        "The system acts as a supervisory co-pilot assisting control room operators and metallurgists in real-time grinding optimization."
    )

    # 4.2 Problem Description
    add_heading_2(doc, "4.2 Problem Description")
    add_body_p(
        doc,
        "Comminution consumes 40% to 50% of concentrator electrical power. Feed variability pushes mills into either Underload "
        "(severe liner bolt shearing, ball fracturing, power waste) or Overload (slurry pooling, chute choking, motor trips costing >$100,000). "
        "Traditional sensors (motor current, bearing pressure) lag by 10 to 15 minutes. Acoustic telemetry resolves this sensory blind spot, "
        "providing instantaneous mill charge signatures within 100 ms."
    )

    # 4.3 Scope of the System
    add_heading_2(doc, "4.3 Scope of the System")
    add_body_p(
        doc,
        "AcoustiMill AI operates at Purdue Model Level 2/3 (Supervisory Control & Edge Analytics) directly above Level 1 DCS/PLCs. "
        "In-Scope: 48 kHz acoustic telemetry ingestion, 2048-pt FFT feature extraction, edge ML load classification, MPC supervisory feed & water "
        "setpoint generation, ISA-101 web HMI, liner damage alarms, and OPC-UA/Modbus DCS interfacing. "
        "Out-of-Scope: Upstream mine blasting, downstream chemical flotation, switchgear trips, and Level 1 Safety Instrumented Systems (SIS)."
    )

    # 4.4 Functional & 4.5 Non-Functional Requirements Summaries
    add_heading_2(doc, "4.4 Functional Requirements")
    add_body_p(
        doc,
        "The system baseline incorporates the 12 core functional requirements detailed in Table 2 (Section 2.1), covering Signal Ingestion, "
        "DSP Engine, Machine Learning Inference, Closed-Loop Control, ISA-101 Operator Interface, Mechanical Diagnostics, and Fail-Safe Interlocks."
    )

    add_heading_2(doc, "4.5 Non-Functional Requirements")
    add_body_p(
        doc,
        "The platform guarantees the quality standards detailed in Table 3 (Section 2.2): Edge ML inference latency ≤ 150 ms (NFR-01), "
        "HMI refresh ≤ 500 ms (NFR-02), 99.95% continuous availability (NFR-03), ISA/IEC 62443 cybersecurity with TLS 1.3 / AES-256 (NFR-04), "
        "ISA-101 2-click ergonomics (NFR-05), multi-line scalability (NFR-06), Docker container modularity (NFR-07), and fail-safe disconnect < 500 ms (NFR-08)."
    )

    # 4.6 Use Case Descriptions (Consolidated Table for Core Use Cases + Summaries)
    add_heading_2(doc, "4.6 Use Case Descriptions")
    add_body_p(
        doc,
        "Formal behavioral specifications for the primary operational use cases are consolidated below in Table 5 conforming to Cockburn/IEEE standards:"
    )

    # Table 5: Consolidated Core Use Case Specifications
    uc_headers = ["Attribute", "UC-03: Real-Time Mill Load Classification", "UC-04: Closed-Loop Supervisory Control", "UC-05: Manual Override & Bump-less Transfer"]
    uc_widths = [1.5, 1.9, 1.9, 1.9]
    uc_data = [
        ["Primary Actor", "ML Inference Engine (System)", "DCS & Supervisory Controller (System)", "Control Room Operator (Human)"],
        ["Trigger", "Arrival of 100 ms spectral feature vector.", "Periodic 1.0-second MPC control timer.", "Operator clicks 'Manual Override' toggle."],
        ["Preconditions", "2048-pt FFT vector computed; model loaded.", "Valid Load Index available; Auto mode active.", "System in Auto mode; operator authenticated."],
        ["Main Success Flow", "1. Extracts 32 Mel bands & centroid;\n2. Evaluates 1D-CNN/Random Forest;\n3. Outputs Load Index (0.00-1.00) and Slurry Pool Index (0-100%);\n4. Publishes state within 45 ms.", "1. Evaluates MPC objective function;\n2. If Underload, increases feed (+15 TPH);\n3. If Overload, reduces feed (-35 TPH);\n4. Applies rate clamp (±10 TPH/min);\n5. Writes setpoints to DCS via OPC-UA.", "1. Intercepts override command;\n2. Sends handshake to decouple AI write tags;\n3. Latches running feed & water setpoints (bump-less transfer);\n4. Displays MANUAL mode; logs audit trail."],
        ["Alternative / Exception Flow", "Low confidence (< 0.60): Flags TRANSITIONAL, holds previous state.\nSNR < 12 dB: Alerts operator; halts auto-control.", "Boundary exceeded: Clamps strictly within 300-650 TPH.\nOPC write fails: Retries once; disengages Auto mode.", "Handshake timeout (> 1000 ms): Reverts to Level 1 DCS lock; sounds console chime."],
        ["Gherkin BDD Verification", "GIVEN SNR > 20 dB\nWHEN 100 ms audio shows high-frequency impacts\nTHEN output 'UNDERLOAD' with Index < 0.25 within 150 ms.", "GIVEN Load Index is 0.88 (Overload)\nWHEN 1-sec control loop executes\nTHEN issue -35 TPH feed cut subject to rate clamping.", "GIVEN system running at 480 TPH\nWHEN operator engages Manual Override\nTHEN AI setpoint writes halt and DCS holds steady 480 TPH."]
    ]
    tbl_uc = doc.add_table(rows=1, cols=len(uc_headers))
    format_black_lined_table(tbl_uc, uc_widths, uc_headers, uc_data, data_font_size=Pt(8.0))

    add_body_p(doc, "Additional System Use Case Summaries:", bold_prefix="Supporting Use Cases: ")
    add_bullet_p(doc, "UC-01 (Acoustic Ingestion): Ingests 48 kHz 24-bit PCM streams into DMA ring buffer; monitors microphone health & SNR.", bold_prefix="UC-01: ")
    add_bullet_p(doc, "UC-07 (Liner Diagnostics): Correlates >14 kHz acoustic transients with mill shell angle; alerts maintenance of loosened liner bolts.", bold_prefix="UC-07: ")
    add_bullet_p(doc, "UC-10 (Watchdog Trip): De-energizes physical watchdog dry contact within < 20 ms if software heartbeat halts for 1000 ms.", bold_prefix="UC-10: ")

    # 4.7 Data Requirements
    add_heading_2(doc, "4.7 Data Requirements")
    add_body_p(
        doc,
        "AcoustiMill AI implements a multi-tiered data pipeline: In-memory DMA circular buffers for 48 kHz raw audio; TimescaleDB "
        "for 1-second spectral summaries and state predictions; and PostgreSQL for supervisory logs, alarms, and shift OEE reports."
    )

    # Table 6: Data Schema
    data_headers = ["Entity / Table Name", "Storage Engine", "Key Schema Attributes & Datatypes", "Volume & Retention SLA"]
    data_widths = [1.5, 1.3, 2.5, 1.5]
    data_data = [
        ["RawAcousticBuffer", "In-Memory Ring Buffer", "timestamp_ns (int64), channel_id (int8), pcm_samples (float32[4800]), snr_db", "15.3 MB rolling 10s ring cache; volatile."],
        ["SpectralTelemetryLog", "TimescaleDB", "time (timestamptz), mill_id, centroid_hz, flux, mel_energies (float32[32])", "1 row/sec; 86.4k rows/day; 90-day retention."],
        ["MillLoadPrediction", "TimescaleDB", "time (timestamptz), load_state (enum), load_index, pooling_idx, confidence", "1 row/sec; compressed; retained 1 year."],
        ["AdvisoryControlLog", "PostgreSQL", "log_id (uuid PK), time, rec_tph, dcs_tph, mode, operator_id", "Permanent regulatory audit log (7 years)."],
        ["AnomalyAlarmRegistry", "PostgreSQL", "alarm_id (uuid PK), time, severity, fault_type, shell_deg, ack_by", "Permanent maintenance log (10 years)."]
    ]
    tbl_data = doc.add_table(rows=1, cols=len(data_headers))
    format_black_lined_table(tbl_data, data_widths, data_headers, data_data, data_font_size=Pt(8.5))

    # 4.8 External Interface Requirements
    add_heading_2(doc, "4.8 External Interface Requirements")
    add_bullet_p(doc, "ISA-101 High-Performance dark-themed dashboard; polar charge toe dial; real-time spectrogram waterfall; mode toggle.", bold_prefix="1. User Interfaces (HMI): ")
    add_bullet_p(doc, "Four IP67 stainless-steel directional microphones; 24-bit delta-sigma ADC DAQ; optical mill trunnion angle resolver; fanless edge IPC.", bold_prefix="2. Hardware Interfaces: ")
    add_bullet_p(doc, "Ubuntu Core / PREEMPT_RT Linux; ONNX Runtime engine; TimescaleDB / PostgreSQL; Docker container runtime; NGINX WebSockets.", bold_prefix="3. Software Interfaces: ")
    add_bullet_p(doc, "OPC-UA (IEC 62541 binary TCP) for DCS tags; Modbus TCP fallback; MQTT Sparkplug B for cloud enterprise KPIs; hardware watchdog relay.", bold_prefix="4. Communications Interfaces: ")

    # 4.9 System Features
    add_heading_2(doc, "4.9 System Features")
    add_bullet_p(doc, "Ingests 48 kHz streams, filters background noise, and computes 2048-pt FFTs every 100 ms to capture rock fracture acoustics.", bold_prefix="Feature 1: Real-Time Spectral Decomposition: ")
    add_bullet_p(doc, "Executes edge 1D-CNN ensemble predicting Load Index (0.00-1.00) and pooling depth 10 minutes before motor current reacts.", bold_prefix="Feature 2: Machine Learning Charge Dynamics: ")
    add_bullet_p(doc, "Solves MPC control loop every 1.0 s, calculating feed (TPH) and water setpoints with rate clamps (±10 TPH/min).", bold_prefix="Feature 3: Closed-Loop Model Predictive Optimization: ")
    add_bullet_p(doc, "Detects periodic >14 kHz acoustic transients synchronized with mill angle to identify loosened liner bolts before failure.", bold_prefix="Feature 4: Predictive Mechanical Diagnostics: ")
    add_bullet_p(doc, "Delivers 60 FPS HTML5 spectrogram waterfalls and polar charge dials with single-click bump-less manual transfer.", bold_prefix="Feature 5: High-Performance Operator Console: ")
    add_bullet_p(doc, "Aggregates 1s metrics into shift OEE logs, energy consumption (kWh/t), and cryptographic audit trails for ERP systems.", bold_prefix="Feature 6: Enterprise Historian & Shift Auditing: ")

    # =========================================================================
    # SECTION 5: IDENTIFY ASSUMPTIONS AND CONSTRAINTS (Rubric 5: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "5. Identify Assumptions and Constraints")

    add_heading_2(doc, "5.1 List of Assumptions Considered While Developing the System")
    add_bullet_p(doc, "Continuous 24/7 grinding operation; feed conveyor has functioning VFD and weightometer modulating feed between 300 and 650 TPH.", bold_prefix="1. Operational Steady-State: ")
    add_bullet_p(doc, "Unobstructed line-of-sight to the shell toe impact zone (120°-160°) at 2.0-3.5 m standoff; background noise remains predominantly below 800 Hz.", bold_prefix="2. Acoustic Line-of-Sight: ")
    add_bullet_p(doc, "Plant supplies clean, dry instrument air (4-6 bar) for vortex-purge microphone cooling jackets; dual-redundant 24V DC UPS provides ≥ 30 min runtime.", bold_prefix="3. Sensor & Hardware Hygiene: ")
    add_bullet_p(doc, "Deterministic plant Ethernet network with latency < 50 ms and packet loss < 0.01%; DCS supports OPC-UA supervisory setpoint writes.", bold_prefix="4. Industrial Network Determinism: ")
    add_bullet_p(doc, "Ore hardness (Bond Work Index) and sizing distribution remain relatively consistent within an 8-hour shift, with step changes occurring smoothly.", bold_prefix="5. Metallurgical Feed Dynamics: ")
    add_bullet_p(doc, "Operators possess standard grinding circuit certifications and ISA-101 training; maintenance strictly enforces Lock-Out/Tag-Out (LOTO).", bold_prefix="6. Personnel Competence: ")

    add_heading_2(doc, "5.2 Multi-Dimensional Constraints Analysis")
    
    # Table 7: Constraints Matrix
    const_headers = ["Constraint Domain", "Identified Constraint", "Operational Risk & Engineering Impact", "System Mitigation Strategy"]
    const_widths = [1.4, 1.7, 2.0, 2.1]
    const_data = [
        ["Technical (Compute)", "Ruggedized Fanless Edge IPC", "Zero reliance on cloud connectivity; restricted edge compute envelope.", "Optimized C++ DSP pipeline; 8-bit quantized ONNX inference; latency < 150 ms."],
        ["Technical (EMI)", "Severe High-Power EMI", "15-25 MW VFDs induce huge ground loops and RF noise into sensor cables.", "Double-shielded twisted pairs; differential audio signaling; optical isolation."],
        ["Operational", "24/7/365 Concentrator Uptime", "Grinding circuits cannot stop for software upgrades; crashes risk choked mills.", "Docker microservices with rolling updates; hardware watchdog fail-safe relay."],
        ["Economic", "Strict CapEx Payback < 6 Months", "Mining executive committee requires demonstrated ROI within 180 operating days.", "3-5% power cut ($350k/yr) and downtime reduction yields full payback in 4.2 months."],
        ["Legal & Safety", "MSHA/OSHA & ATEX Dust Safety", "Regulations mandate explosion-proof enclosures in combustible mineral dust zones.", "Microphones and field junction boxes certified ATEX Zone 22 / NEC Class II, Div 2."],
        ["Project Schedule", "72-Hour Relining Window", "Physical mounting permitted only during scheduled mill relining turnarounds.", "Pre-fabricated magnetic clamp mounts and plug-and-play IP67 M12 harness wiring."]
    ]
    tbl_const = doc.add_table(rows=1, cols=len(const_headers))
    format_black_lined_table(tbl_const, const_widths, const_headers, const_data, data_font_size=Pt(8.5))

    # =========================================================================
    # SECTION 6: VALIDATE REQUIREMENT COMPLETENESS AND CONSISTENCY (Rubric: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "6. Validate Requirement Completeness and Consistency")

    add_heading_2(doc, "6.1 Verification of Stakeholder Requirements Coverage")
    add_body_p(
        doc,
        "A Requirements Traceability Matrix (RTM) validates that 100% of stakeholder operational needs are addressed without omissions:"
    )

    # Table 8: Traceability Matrix
    rtm_headers = ["Stakeholder Role", "Operational Need Addressed", "Mapped Req ID", "Non-Functional SLA", "Verification & Acceptance Method"]
    rtm_widths = [1.3, 1.8, 1.2, 1.3, 1.6]
    rtm_data = [
        ["Control Room Operator", "Prevent unexpected mill chute overloads; reduce fatigue.", "FR-05, FR-07, FR-09", "NFR-02 (HMI < 500 ms)", "Synthetic overload stress injection; UX audit."],
        ["Control Room Operator", "Seamless manual override without conveyor feed bumps.", "FR-10, FR-08", "NFR-08 (Bump-less transfer)", "Bump-less transfer toggle test on DCS simulator."],
        ["Metallurgical Engineer", "Maximize throughput (TPH); maintain target P80 slurry sizing.", "FR-05, FR-06, FR-07", "NFR-01 (Inference < 150 ms)", "30-day continuous metallurgical yield comparison."],
        ["Reliability Engineer", "Detect liner bolt loosening before catastrophic shearing.", "FR-11, FR-12", "NFR-01 (High-freq sampling)", "Acoustic transient pulse injection & angular audit."],
        ["Automation Technician", "Standardized fieldbus integration; sensor health diagnostics.", "FR-01, FR-02, FR-12", "NFR-04 (IEC 62443), NFR-08", "Acoustic cable disconnect test; watchdog trip test."],
        ["Plant General Manager", "Reduce power costs by 3-5%; achieve CapEx payback < 6 mo.", "FR-07, FR-09", "NFR-03 (Continuous uptime)", "Quarterly energy tariff audit; verified CapEx ROI."]
    ]
    tbl_rtm = doc.add_table(rows=1, cols=len(rtm_headers))
    format_black_lined_table(tbl_rtm, rtm_widths, rtm_headers, rtm_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "6.2 Requirement Defect Review & Consistency Verification")
    add_body_p(
        doc,
        "Requirements were systematically audited for ambiguity, redundancy, inconsistency, and missing edge cases:"
    )

    # Table 9: Defect Review Matrix
    qa_headers = ["Defect Category", "Initial Defective Formulation", "Identified Quality Hazard", "Remediated Engineering Specification"]
    qa_widths = [1.2, 1.8, 1.8, 2.4]
    qa_data = [
        ["Ambiguity", "'System shall detect mill overloads quickly.'", "Subjective word 'quickly' is untestable; lacks metric.", "Remediated in FR-05 & NFR-01: 'Classify load every 100 ms with latency ≤ 150 ms; alarm within ≤ 500 ms when Load Index > 0.75.'"],
        ["Redundancy", "FR-01 & FR-03 both executed independent FFT transforms.", "Duplicating 2048-pt FFT wastes CPU and creates race conditions.", "Remediated: FR-01 exclusively manages DMA buffers; FR-03 centralizes FFT transforms via shared memory."],
        ["Inconsistency", "NFR-01 set 150 ms latency; FR-07 allowed 5000 ms solver timeout.", "5-second solver timeout blocks real-time audio threads.", "Remediated: Decoupled high-frequency DSP thread (100 ms) from MPC supervisory solver (1.0 s) via non-blocking queues."],
        ["Missing Edge Case", "No handling specified for disconnected microphone cables.", "Zero signal misclassified by ML as severe slurry pooling.", "Remediated: Added FR-02 (Watchdog): SNR < 12 dB for > 2s triggers SENSOR_FAULT, inhibits auto-tuning, and reverts to DCS baseline."]
    ]
    tbl_qa = doc.add_table(rows=1, cols=len(qa_headers))
    format_black_lined_table(tbl_qa, qa_widths, qa_headers, qa_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "6.3 Strategic Quality Improvements & Future Technical Roadmap")
    add_bullet_p(doc, "Couple Discrete Element Method (DEM) rock-ball trajectories with Finite Element Method (FEM) acoustic radiation modeling to generate synthetic training data for rare liner wear and choked overloads.", bold_prefix="1. Physics-Informed Digital Twin Acoustic Modeling: ")
    add_bullet_p(doc, "Deploy 16-element MEMS phased microphone arrays with delay-and-sum beamforming to spatially isolate the charge toe impact zone and filter neighboring pump noise.", bold_prefix="2. Phased Acoustic Beamforming Microphone Arrays: ")
    add_bullet_p(doc, "Implement multi-site federated edge learning across mining operations to collaboratively train neural networks without sharing confidential production tonnage.", bold_prefix="3. Multi-Site Federated Edge Learning: ")
    add_bullet_p(doc, "Expand MPC supervisory boundaries to simultaneously modulate mill variable speed drive RPM and water addition, saving an additional 2.0% to 3.5% energy.", bold_prefix="4. Coordinated Mill Speed (RPM) and Water Optimization: ")
    add_bullet_p(doc, "Mount a calibrated piezoelectric acoustic emitter adjacent to microphones to emit an automated 5 kHz synthetic pulse per shift, verifying calibration without entering the grinding bay.", bold_prefix="5. Automated Closed-Loop Synthetic Acoustic Calibration: ")

    # Save document
    print(f"Saving summarized document to: {output_path}...")
    doc.save(output_path)
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Document successfully created! File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    build_summarized_document()

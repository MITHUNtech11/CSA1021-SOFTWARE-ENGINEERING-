import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx_helpers import (
    BLACK,
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, format_black_lined_table
)

def build_monochrome_document():
    input_path = 'assessment&activity/CO2-AT1/CSA10-CO2 AT1 Scenario-Based Requirement Analysis.docx'
    output_path = 'assessment&activity/CO2-AT1/CO2-AT1-Mineral ore minning.docx'
    diagram_path = 'assessment&activity/CO2-AT1/media/use_case_diagram.png'

    print(f"Loading template document: {input_path}...")
    doc = Document(input_path)

    # 1. Update Table 0 (Student & Assessment Details)
    t0 = doc.tables[0]
    t0.cell(4, 1).text = "S Mithun Senthil"
    t0.cell(4, 3).text = "192324056"
    t0.cell(5, 1).text = "29-10-2026"
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

    # Ensure all text runs in the initial template are pure black
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

    # 3. Clean page break right after the 3 question pages
    # Remove excessive blank paragraphs at end of template if any
    while len(doc.paragraphs) > 37 and doc.paragraphs[-1].text.strip() == '':
        p_elem = doc.paragraphs[-1]._p
        p_elem.getparent().remove(p_elem)

    # Add single clean page break so answers start on Page 4
    doc.add_page_break()

    # 4. ANSWER SECTION HEADER (Pure Black, 16 pt bold)
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(8)
    title_p.paragraph_format.space_after = Pt(3)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = title_p.add_run("CO2 ASSESSMENT TOOL 1: STUDENT SUBMISSION REPORT\n"
                              "SCENARIO-BASED SOFTWARE REQUIREMENT ANALYSIS & SPECIFICATION (SRS)")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = BLACK

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(2)
    meta_p.paragraph_format.space_after = Pt(6)
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = meta_p.add_run("Project: Intelligent Mineral Ore Grinding Optimization & Real-Time Acoustic Telemetry System (AcoustiMill AI)\n"
                            "Student Name: S Mithun Senthil  |  Register Number: 192324056  |  Department of CSE")
    r_meta.font.name = 'Calibri'
    r_meta.font.size = Pt(12)
    r_meta.font.bold = True
    r_meta.font.color.rgb = BLACK

    # =========================================================================
    # SECTION 1: STUDY AND ANALYZE THE SCENARIO (Rubric 1: 30% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "1. Study and Analyze the Scenario")
    
    add_heading_2(doc, "1.1 Problem Background and Comminution Regimes")
    add_body_p(
        doc,
        "In mineral processing plants, comminution is the mechanical reduction of mined ore into micrometer slurry for metal recovery. "
        "Semi-Autogenous Grinding (SAG) and Ball mills consume 40% to 50% of the plant's total electrical power (15 to 25 MW per mill). "
        "Inside the rotating shell, grinding occurs via cascading (attrition) and cataracting (ball impact), fluctuating across three regimes:"
    )
    add_bullet_p(
        doc,
        "Volumetric charge < 22%. Lacking an ore cushion, forged steel balls impact manganese liners directly, "
        "causing liner bolt shearing, cracked lifters, steel ball fracturing, and wasted electrical energy.",
        bold_prefix="1. Severe Underload Condition: "
    )
    add_bullet_p(
        doc,
        "Volumetric filling is maintained at 26% to 32% with 70% to 75% solids. Cataracting impacts land squarely "
        "on the toe, maximizing rock breakage, achieving target grind (P80 ~75 µm), and minimizing specific kWh/tonne energy draw.",
        bold_prefix="2. Optimal Grinding Envelope: "
    )
    add_bullet_p(
        doc,
        "Charge volume exceeds 36%. Slurry pools at the mill bottom, cushioning impacts and halting grinding. "
        "Motor torque surges, bearing temperatures spike, and feed chutes pack, triggering emergency shutdowns costing >$100,000.",
        bold_prefix="3. Dangerous Overload Condition: "
    )

    add_heading_2(doc, "1.2 Business Domain and Technical Ecosystem")
    add_body_p(
        doc,
        "The business domain bridges Extractive Metallurgy, Industrial IoT, Acoustic Telemetry, and OT/IT integration. "
        "Core objectives are maximizing throughput (TPH), reducing specific power (kWh/t), preventing chute blockages, and improving recovery."
    )

    add_heading_2(doc, "1.3 Key Stakeholder Identification & Responsibilities Matrix")
    stk_headers = ["Stakeholder Role", "Domain", "Key Responsibilities", "Core Operational Pain Points", "Delivered System Value"]
    stk_widths = [1.3, 1.1, 1.6, 1.7, 1.5]
    stk_data = [
        ["Control Room Operator", "Operations", "Monitors DCS console 24/7; regulates ore feed and water.", "Cognitive fatigue; lagging motor power; sudden chute overloads.", "Live waterfall display; predictive load index; advisory feed tuning."],
        ["Metallurgical Engineer", "Metallurgy", "Monitors P80 grind sizing; audits specific energy (kWh/t).", "Ore hardness variability causes over/under-grinding; pooling blind spots.", "Live slurry pooling index; optimal grind envelope; shift audits."],
        ["Reliability Engineer", "Maintenance", "Schedules relining; inspects liners, lifters, bearings, and gears.", "Liner cracking and bolt shearing during underloads; bearing wear.", "Continuous impact severity detection; predictive liner wear tracking."],
        ["Automation Tech", "OT / I&C", "Maintains acoustic sensors, cabling, PLC buses, and edge IPC.", "Slurry dust and vibration damage sensors; legacy DCS interface.", "Standardized OPC-UA telemetry; automated sensor SNR self-diagnostics."],
        ["Safety Officer", "HSE", "Enforces mining safety standards, noise limits, and interlocks.", "Manual chute unblocking exposes workers to crushing/slurry hazards.", "Chute blockage mitigation eliminates manual unblocking entries."],
        ["Plant General Manager", "Executive", "Governs site profitability, production quotas, and CapEx ROI.", "Grinding is highest plant power cost; quarterly downtime deficits.", "3-5% power savings ($350k/yr); 25% downtime cut; ROI < 6 months."]
    ]
    tbl_stk = doc.add_table(rows=1, cols=len(stk_headers))
    format_black_lined_table(tbl_stk, stk_widths, stk_headers, stk_data, data_font_size=Pt(9))

    add_heading_2(doc, "1.4 Existing Operational Challenges & Sensor Gaps")
    add_body_p(
        doc,
        "Mill control historically relies on motor power (kW), motor current, bearing oil pressure, and shell load cells. "
        "These sensors are severely lagging: by the time motor current spikes, the mill has already been overloaded for 10 to 15 minutes, "
        "making trips unavoidable. Internal sensors cannot survive inside the abrasive rotating drum, and background noise (105-115 dBA) obscures raw audio."
    )

    add_heading_2(doc, "1.5 System Strategic SMART Objectives")
    smart_headers = ["Pillar", "Objective Definition", "Target Engineering Metric", "Industrial Justification"]
    smart_widths = [1.1, 1.8, 2.0, 2.3]
    smart_data = [
        ["[S] Specific", "Acoustic Telemetry & FFT", "Ingest 4-channel 48 kHz streams; compute 2048-pt FFT every 100 ms.", "Isolates toe impact frequency (800 Hz - 2.5 kHz) from pump noise."],
        ["[M] Measurable", "Load Classification & Energy", "Achieve > 95% load accuracy; reduce specific energy by 3.0% to 5.0%.", "Yields over $350,000 in annual power tariff savings per mill line."],
        ["[A] Achievable", "Edge Computing & Fieldbus", "Deploy fanless IP67 edge IPC interfacing with DCS via OPC-UA/Modbus.", "Eliminates cloud dependency; guarantees local deterministic control."],
        ["[R] Relevant", "Overload & Downtime Mitigation", "Provide 10-minute predictive warning before overload; cut stops by > 25%.", "Protects multi-megawatt drive trains and eliminates chute unblocking."],
        ["[T] Time-Bound", "Edge Inference & HMI Latency", "Complete edge ML inference in < 250 ms; refresh operator HMI in < 1.0s.", "Allows feed adjustments well before slurry pooling triggers motor trips."]
    ]
    tbl_smart = doc.add_table(rows=1, cols=len(smart_headers))
    format_black_lined_table(tbl_smart, smart_widths, smart_headers, smart_data, data_font_size=Pt(9))

    # =========================================================================
    # SECTION 2: IDENTIFY FUNCTIONAL AND NON-FUNCTIONAL REQUIREMENTS (Rubric 2: 25% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "2. Identify Functional and Non-Functional Requirements")

    add_heading_2(doc, "2.1 Comprehensive Functional Requirements Catalog")
    add_body_p(
        doc,
        "Functional requirements define the core operational capabilities and automated behaviors of the platform, "
        "organized across eight modular subsystems and prioritized using the MoSCoW framework:"
    )

    fr_headers = ["Req ID", "Module", "Requirement Specification", "Pri", "Input Data", "Processing & System Behavior"]
    fr_widths = [0.7, 1.0, 2.3, 0.6, 1.2, 1.4]
    fr_data = [
        ["FR-01", "Ingestion", "Multi-Channel Acoustic Ingestion: Ingest continuous 48 kHz 24-bit PCM acoustic telemetry.", "Must", "Raw audio buffers (ALSA/ASIO).", "Manages circular buffers; outputs synchronized 100 ms frames."],
        ["FR-02", "Ingestion", "Sensor Health Watchdog: Monitor microphone baseline and detect disconnection/clipping.", "Must", "Acoustic power spectrum.", "Computes running SNR; flags SENSOR_FAULT if SNR < 12 dB for > 2s."],
        ["FR-03", "DSP Engine", "Real-Time FFT & Spectral Extraction: Convert audio waveforms to frequency representations.", "Must", "100 ms acoustic frames.", "Computes 2048-pt FFT; outputs centroid, flux, and 32 Mel bands."],
        ["FR-04", "DSP Engine", "Ambient Noise Suppression: Filter background slurry pump and vibrating screen noise.", "Should", "Multi-channel audio streams.", "Applies Chebyshev bandpass filter (500 Hz - 12 kHzcomm band)."],
        ["FR-05", "ML Engine", "Volumetric Load Regime Classification: Classify mill into Underload, Optimal, or Overload.", "Must", "Spectral feature vector, power.", "Evaluates Random Forest/1D-CNN; outputs Load Index (0.00-1.00)."],
        ["FR-06", "ML Engine", "Slurry Pooling Estimation: Quantify slurry pool depth damping internal mill impacts.", "Should", "Low-frequency attenuation (1-3 kHz).", "Calculates damping coefficient; outputs Slurry Pool Index (0-100%)."],
        ["FR-07", "Control", "Closed-Loop Feed Rate & Water Optimization: Generate predictive feed/water setpoints.", "Must", "Load Index, feed rate (TPH), power.", "Executes Model Predictive Control (MPC); outputs target setpoints."],
        ["FR-08", "Control", "Safety Clamping & Rate Limiting: Restrict setpoints within metallurgical safety limits.", "Must", "Raw advisory setpoints from FR-07.", "Applies rate clamps (max ±10 TPH/min); clamps within safe bounds."],
        ["FR-09", "SCADA HMI", "ISA-101 Operator Dashboard: Provide live operator visualization and waterfall display.", "Must", "Load index, power, spectrogram.", "Renders 60 FPS HTML5 dashboard; displays real-time load dial."],
        ["FR-10", "SCADA HMI", "Manual Override & Mode Switching: Allow operators to toggle Auto, Advisory, and Manual.", "Must", "Operator UI action, credentials.", "Decouples AI writes; holds DCS setpoints steady (bump-less transfer)."],
        ["FR-11", "Diagnostics", "Liner Bolt Loosening Alarm: Detect anomalous high-energy acoustic impacts on shell.", "Must", "Acoustic transients (>14 kHz), angle.", "Identifies periodic transient peaks; outputs Liner Damage Alert."],
        ["FR-12", "Diagnostics", "Trunnion Bearing Health Engine: Detect bearing friction and lubrication breakdown.", "Should", "Acoustic RMS, oil temp, pressure.", "Computes kurtosis; compares with baseline; alerts maintenance."],
        ["FR-13", "Historian", "High-Resolution Historian: Store 1-second spectral summaries and process metrics.", "Must", "1-second aggregated load metrics.", "Compresses and writes to TimescaleDB; retains data for 90 days."],
        ["FR-14", "Historian", "Automated Shift OEE & Energy Reporting: Generate shift production and energy logs.", "Should", "Tonnage, electrical energy (MWh).", "Calculates OEE, kWh/tonne, optimal time; exports PDF/Excel."],
        ["FR-15", "Security", "Role-Based Access Control & Audit Trails: Restrict configuration and log modifications.", "Must", "User login credentials, LDAP.", "Enforces Operator/Engineer/Admin roles; logs cryptographic audit."],
        ["FR-16", "Interlock", "Automatic Watchdog & Fail-Safe Disconnect: Revert mill to DCS default upon failure.", "Must", "Hardware watchdog heartbeat pulse.", "Opens watchdog relay if heartbeat lost > 1s; DCS reverts to safe feed."]
    ]
    tbl_fr = doc.add_table(rows=1, cols=len(fr_headers))
    format_black_lined_table(tbl_fr, fr_widths, fr_headers, fr_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "2.2 Comprehensive Non-Functional Requirements Catalog")
    nfr_headers = ["NFR ID", "Quality Dimension", "Requirement Specification & Metric", "Target Threshold", "Worst-Case Boundary", "Verification Method"]
    nfr_widths = [0.8, 1.2, 2.3, 1.3, 1.2, 1.0]
    nfr_data = [
        ["NFR-01", "Performance", "Edge ML inference latency from audio capture to output state.", "≤ 150 ms", "≤ 250 ms", "Timestamped profiler."],
        ["NFR-02", "Throughput", "End-to-End HMI display refresh from acoustic event to render.", "≤ 500 ms", "≤ 1.0 second", "Network telemetry profiler."],
        ["NFR-03", "Reliability", "Operational availability in continuous 24/7/365 plant grinding.", "≥ 99.95% uptime", "≥ 99.80% uptime", "Uptime monitoring log."],
        ["NFR-04", "Security", "Compliance with ISA/IEC 62443 industrial cybersecurity standards.", "TLS 1.3, AES-256, MFA", "TLS 1.2, SHA-256", "Vulnerability audit."],
        ["NFR-05", "Usability", "Adherence to ISA-101 High-Performance HMI ergonomic standards.", "Max 2 clicks to control", "Max 3 clicks to control", "Usability walkthrough."],
        ["NFR-06", "Scalability", "Capacity to process multiple concurrent grinding lines (SAG & Ball).", "4 lines (16 channels)", "2 lines (8 channels)", "Stress load testing."],
        ["NFR-07", "Modularity", "Containerized microservices; hot-swapping models without restart.", "Zero process restart", "Restart < 30 seconds", "Docker rolling update test."],
        ["NFR-08", "Safety", "Fail-safe mechanism: zero invalid setpoints; watchdog disconnect.", "Disconnect < 500 ms", "Disconnect < 1000 ms", "Hardware fault injection."]
    ]
    tbl_nfr = doc.add_table(rows=1, cols=len(nfr_headers))
    format_black_lined_table(tbl_nfr, nfr_widths, nfr_headers, nfr_data, data_font_size=Pt(9))

    # =========================================================================
    # SECTION 3: ACTORS AND USE CASES (Rubric 3: 20% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "3. Identify Actors and Use Cases")

    add_heading_2(doc, "3.1 Identification of Primary and Secondary Actors")
    act_headers = ["Actor Name", "Classification", "Profile & Role Description", "Core System Touchpoints"]
    act_widths = [1.5, 1.2, 2.6, 2.3]
    act_data = [
        ["Control Room Operator", "Primary (Human)", "Manages grinding circuit shift from central control console.", "Views live HMI; evaluates advisory setpoints; executes manual override."],
        ["Metallurgical Engineer", "Primary (Human)", "Optimizes grinding chemistry, ore sizing (P80), and recovery.", "Configures target envelope; tunes advisory logic; reviews shift reports."],
        ["Maintenance Engineer", "Primary (Human)", "Responsible for mill mechanical integrity, liners, and bearings.", "Monitors ball-on-liner impact severity; triages mechanical alarms."],
        ["Automation Technician", "Primary (Human)", "Manages physical sensor calibration, cabling, and fieldbuses.", "Calibrates acoustic array; configures OPC-UA; verifies watchdog relay."],
        ["Plant Safety Officer", "Primary (Human)", "Enforces mining safety standards, noise limits, and interlocks.", "Audits emergency trip events; reviews safety interlock logs."],
        ["System Administrator", "Primary (Human)", "Governs system cybersecurity, user credentials, and network.", "Manages RBAC accounts; audits access logs; oversees backups."],
        ["Acoustic Sensor Array", "Secondary (System)", "Directional microphones, accelerometers, and 24-bit ADC DAQ.", "Transmits continuous raw 48 kHz acoustic telemetry streams."],
        ["Plant DCS / PLC", "Secondary (System)", "Industrial distributed control system (DeltaV, PCS7, ControlLogix).", "Receives setpoints; feeds motor power/RPM; monitors watchdog pulse."],
        ["Enterprise ERP / PIMS", "Secondary (System)", "Enterprise Resource Planning (SAP) and Plant Historian (OSIsoft PI).", "Pulls hourly production tonnage, power (MWh), and OEE metrics."]
    ]
    tbl_act = doc.add_table(rows=1, cols=len(act_headers))
    format_black_lined_table(tbl_act, act_widths, act_headers, act_data, data_font_size=Pt(9))

    add_heading_2(doc, "3.2 Actor-to-Use-Case Matrix & Core Catalog")
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
        ["UC-10: Retrain & Validate ML Models", "-", "X", "-", "X", "-", "-", "-", "-", "-"],
        ["UC-11: Manage User Access & RBAC", "-", "-", "-", "-", "-", "X", "-", "-", "-"],
        ["UC-12: Execute Safety Interlock Trip", "-", "-", "-", "X", "X", "-", "-", "X", "-"]
    ]
    tbl_mat = doc.add_table(rows=1, cols=len(mat_headers))
    format_black_lined_table(tbl_mat, mat_widths, mat_headers, mat_data, data_font_size=Pt(8.5))

    add_heading_2(doc, "3.3 Publication-Grade UML Use Case Diagram")
    add_body_p(
        doc,
        "Figure 1 illustrates the formal UML Use Case Diagram modeling the system boundary, actor interactions, "
        "and architectural relationships («include» and «extend») governing the AcoustiMill AI platform:"
    )

    # Embed Diagram Image with compact width (4.7 inches)
    if os.path.exists(diagram_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(4)
        p_img.paragraph_format.space_after = Pt(2)
        run_img = p_img.add_run()
        run_img.add_picture(diagram_path, width=Inches(4.7))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(1)
        p_cap.paragraph_format.space_after = Pt(4)
        r_cap = p_cap.add_run("Figure 1: Formal UML Use Case Diagram for the AcoustiMill AI Platform")
        r_cap.font.name = 'Calibri'
        r_cap.font.size = Pt(11)
        r_cap.font.bold = True
        r_cap.font.color.rgb = BLACK

    add_body_p(
        doc,
        "Key Architectural Relationships in Figure 1:",
        bold_prefix="UML Structural Walkthrough: "
    )
    add_bullet_p(
        doc,
        "Telemetry Ingestion (UC-01) necessarily includes Spectral FFT Extraction (UC-02) because frequency "
        "decomposition is essential for all analysis. Mill Load Classification (UC-03) strictly includes UC-02 features, and Optimal "
        "Setpoint Calculation (UC-04) includes the real-time classified state from UC-03.",
        bold_prefix="«include» Dependencies: "
    )
    add_bullet_p(
        doc,
        "Manual Setpoint Override (UC-05) extends Automated Setpoint Calculation (UC-04) at the explicit "
        "extension point 'Operator Discretion / Ore Hardness Transition', decoupling automated writes and granting manual DCS authority.",
        bold_prefix="«extend» Dependency: "
    )

    # =========================================================================
    # SECTION 4: PREPARE THE SOFTWARE REQUIREMENT SPECIFICATION (SRS) (Rubric 4: 15% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "4. Prepare the Software Requirement Specification (SRS)")

    add_heading_2(doc, "4.1 SRS Introduction and System Scope")
    add_body_p(
        doc,
        "This SRS conforms to IEEE Std 830-1998. AcoustiMill AI operates at Purdue Model Level 2/3 as a supervisory co-pilot "
        "above existing DCS/PLCs. It ingests multi-channel acoustic signals, infers charge dynamics, and writes validated setpoints via "
        "OPC-UA/Modbus. The execution environment consists of fanless IP67 industrial edge PCs operating under -10°C to +55°C plant conditions."
    )

    add_heading_2(doc, "4.2 Structured Use Case Specifications")
    
    # Specification Table: UC-03 & UC-04
    add_heading_3(doc, "Detailed Specification: UC-03 Real-Time Mill Load State Classification")
    uc3_headers = ["Attribute", "Specification Details"]
    uc3_widths = [1.8, 5.0]
    uc3_data = [
        ["Use Case ID & Name", "UC-03: Real-Time Acoustic Mill State Classification"],
        ["Primary Actor", "DSP / Machine Learning Inference Engine (System)"],
        ["Preconditions", "1. Raw audio stream active (UC-01); 2. 2048-pt FFT feature vector computed (UC-02); 3. ONNX model loaded."],
        ["Trigger", "Arrival of newly computed spectral feature vector in the edge queue (periodic every 100 ms)."],
        ["Main Success Flow", "1. System extracts 32 Mel-frequency bins and spectral centroid; 2. Evaluates trained Random Forest/1D-CNN; 3. Computes softmax probabilities across Underload, Optimal, and Overload; 4. Outputs continuous Load Index (0.00-1.00); 5. Publishes load state via OPC-UA within 45 ms."],
        ["Alternative Flows", "3a. Softmax probability < 0.60: Flags state as TRANSITIONAL; retains previous verified state.\n2a. Sensor SNR < 12 dB: Halts classification; flags SENSOR_DEGRADED; alerts operator."],
        ["Gherkin BDD Scenario", "GIVEN the mill operates with steady ore feed and sensor SNR is > 20 dB\nWHEN a 100 ms acoustic window with high-frequency shell impacts (3-6 kHz) is processed\nTHEN the system outputs 'UNDERLOAD' with Load Index < 0.25 within 150 ms."]
    ]
    tbl_uc3 = doc.add_table(rows=1, cols=len(uc3_headers))
    format_black_lined_table(tbl_uc3, uc3_widths, uc3_headers, uc3_data, data_font_size=Pt(9))

    add_heading_3(doc, "Detailed Specification: UC-04 Closed-Loop Feed & Water Ratio Supervisory Control")
    uc4_headers = ["Attribute", "Specification Details"]
    uc4_widths = [1.8, 5.0]
    uc4_data = [
        ["Use Case ID & Name", "UC-04: Closed-Loop Feed & Water Ratio Advisory Recommendation"],
        ["Primary Actor", "Plant Distributed Control System (DCS / PLC) & Supervisory Control Engine"],
        ["Preconditions", "1. Valid Load Index available from UC-03; 2. Motor power (kW) and feed (TPH) received from DCS; 3. Auto/Advisory mode active."],
        ["Trigger", "Periodic 1-second supervisory control loop timer."],
        ["Main Success Flow", "1. Evaluates Model Predictive Control (MPC); 2. If Underload (< 0.30), calculates feed increase (+15 TPH); 3. If Overload (> 0.75), calculates feed reduction (-35 TPH); 4. Applies safety clamping (max ±10 TPH/min); 5. In Auto mode, writes setpoints to DCS via OPC-UA; 6. Logs event."],
        ["Alternative Flows", "4a. Setpoint exceeds bounds (300-650 TPH): Clamps strictly to limit; alerts operator.\n5a. OPC-UA write fails: Retries once; if failed, alerts operator and disengages Auto mode."],
        ["Gherkin BDD Scenario", "GIVEN the mill enters Overload with Load Index 0.88 and motor power declining\nWHEN the 1-second optimization loop executes\nTHEN system issues feed reduction of -30 TPH within 200 ms and limits reduction rate safely."]
    ]
    tbl_uc4 = doc.add_table(rows=1, cols=len(uc4_headers))
    format_black_lined_table(tbl_uc4, uc4_widths, uc4_headers, uc4_data, data_font_size=Pt(9))

    add_heading_2(doc, "4.3 Data Requirements & Schema Dictionary")
    data_headers = ["Entity / Table Name", "Storage Engine", "Key Schema Attributes", "Retention SLA"]
    data_widths = [1.5, 1.3, 2.5, 1.5]
    data_data = [
        ["RawAcousticBuffer", "Edge Memory Buffer", "timestamp_ns (int64), channel_id (int8), pcm_samples (float32[4800])", "10-second rolling cache."],
        ["SpectralTelemetryLog", "TimescaleDB", "timestamp, mill_id, centroid_hz, flux, mel_energies (float32[32]), snr_db", "90-day retention; 1s resolution."],
        ["MillLoadPrediction", "TimescaleDB", "timestamp, load_state (enum), load_index (float32), confidence (float32)", "1-year retention."],
        ["AdvisoryControlLog", "PostgreSQL", "log_id (uuid), timestamp, recommended_tph, executed_tph, mode, operator_id", "Permanent audit log (7 years)."],
        ["AnomalyAlarmRegistry", "PostgreSQL", "alarm_id (uuid), timestamp, severity (enum), fault_type, shell_angle, ack_by", "Permanent maintenance log."]
    ]
    tbl_data = doc.add_table(rows=1, cols=len(data_headers))
    format_black_lined_table(tbl_data, data_widths, data_headers, data_data, data_font_size=Pt(9))

    add_heading_2(doc, "4.4 External Interface Requirements & Operational Modes")
    add_body_p(
        doc,
        "AcoustiMill AI integrates with plant infrastructure via: (1) ISA-101 compliant web HMI; (2) IP67 stainless steel directional "
        "microphone arrays; (3) OPC-UA (IEC 62541) and Modbus TCP industrial protocols; and (4) TLS 1.3 encrypted fieldbus. "
        "The system executes as a Finite State Machine across six deterministic operational modes: Startup & Self-Test, Optimal Steady State, "
        "Underload Transient, Overload Transient, Manual Operator Bypass, and Emergency Trip Interlock."
    )

    # =========================================================================
    # SECTION 5: IDENTIFY ASSUMPTIONS AND CONSTRAINTS (Rubric 5: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "5. Identify Assumptions and Constraints")

    add_heading_2(doc, "5.1 Project & Technical Assumptions")
    add_body_p(
        doc,
        "System design is based on four validated engineering assumptions: (1) Direct acoustic line-of-sight to the mill toe at 2.0 to 3.5 m standoff; "
        "(2) Deterministic Industrial Ethernet network with round-trip latency < 50 ms; (3) Homogeneous ore hardness within 8-hour mining shifts; "
        "and (4) Dual-redundant 24V DC uninterruptible power supply providing > 30 minutes runtime during plant power outages."
    )

    add_heading_2(doc, "5.2 Multi-Dimensional Constraints Analysis")
    const_headers = ["Constraint Domain", "Identified Constraint", "Engineering Impact & System Mitigation Strategy"]
    const_widths = [1.6, 2.0, 3.2]
    const_data = [
        ["Technical & Compute", "Ruggedized Fanless Edge Computing", "Execution constrained to fanless IP67 edge IPC without cloud dependency. All DSP transforms and ONNX inference are optimized for local execution within < 150 ms."],
        ["Technical & Electrical", "High Electromagnetic Interference (EMI)", "Multi-megawatt VFDs create severe EMI. Audio cabling requires double-shielded twisted pairs, isolated differential signaling, and fiber-optic couplers."],
        ["Operational", "24/7 Continuous Concentrator Operation", "Grinding facilities operate 365 days a year. Containerized microservices enable zero-downtime rolling updates with memory-leak protection."],
        ["Economic", "CapEx Payback Window < 6 Months", "Hardware procurement and licensing must achieve full ROI within 6 months. Demonstrated 3-5% power savings ($350k/yr) yields payback in under 4.2 months."],
        ["Legal & Safety", "MSHA / OSHA & ATEX Zone 22", "Must meet combustible dust safety standards. Microphone enclosures and field junction boxes are certified ATEX Zone 22 explosion-proof."],
        ["Project Schedule", "72-Hour Commissioning Window", "Physical sensor installation constrained to scheduled 72-hour mill relining turnarounds. Uses pre-fabricated quick-mount brackets and plug-and-play wiring."]
    ]
    tbl_const = doc.add_table(rows=1, cols=len(const_headers))
    format_black_lined_table(tbl_const, const_widths, const_headers, const_data, data_font_size=Pt(9))

    # =========================================================================
    # SECTION 6: VALIDATE REQUIREMENT COMPLETENESS AND CONSISTENCY (Rubric: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "6. Validate Requirement Completeness and Consistency")

    add_heading_2(doc, "6.1 Requirements Traceability Matrix (RTM)")
    rtm_headers = ["Business Need / Problem Gap", "Functional Requirement", "Use Case", "Non-Functional Req.", "Verification Method"]
    rtm_widths = [1.7, 1.2, 1.1, 1.2, 1.6]
    rtm_data = [
        ["Mitigate mill chute blockages and downtime", "FR-05 (Load Class), FR-07 (Control)", "UC-03, UC-04", "NFR-01 (Inference < 150ms)", "Synthetic overload stress injection."],
        ["Prevent liner cracking during underloads", "FR-03 (FFT), FR-11 (Liner Alarm)", "UC-02, UC-07", "NFR-05 (Alarm < 100ms)", "Acoustic impact transient pulse injection."],
        ["Reduce specific energy (kWh/t) by 3-5%", "FR-05 (Load Class), FR-07 (Control)", "UC-03, UC-04", "NFR-03 (99.95% Uptime)", "30-day baseline MWh comparison."],
        ["Provide ergonomic 24/7 operator HMI", "FR-09 (ISA-101 HMI), FR-10 (Override)", "UC-06, UC-05", "NFR-05 (ISA-101 Standard)", "Operator cognitive UX walkthrough."],
        ["Ensure fail-safe deterministic disconnect", "FR-16 (Watchdog), FR-08 (Clamping)", "UC-12, UC-04", "NFR-08 (Trip < 500ms)", "Hardware watchdog dropout test."],
        ["Maintain metallurgical logs and OEE", "FR-13 (Historian), FR-14 (Reporting)", "UC-09, UC-11", "NFR-04 (AES-256 Storage)", "Automated SQL reconciliation test."]
    ]
    tbl_rtm = doc.add_table(rows=1, cols=len(rtm_headers))
    format_black_lined_table(tbl_rtm, rtm_widths, rtm_headers, rtm_data, data_font_size=Pt(9))

    add_heading_2(doc, "6.2 Requirement Defect Review & Consistency Verification")
    qa_headers = ["Defect Category", "Initial Formulation", "Identified Quality Hazard", "Remediated Engineering Specification"]
    qa_widths = [1.3, 1.8, 1.7, 2.0]
    qa_data = [
        ["Ambiguity", "'System responds quickly to overload.'", "Unquantifiable metric; untestable by developers.", "Remediated: 'System classifies load within ≤ 150 ms and issues feed cut within ≤ 1.0 s (FR-05, NFR-01).'"],
        ["Redundancy", "FR-01 & FR-03 duplicated FFT windowing.", "Wasted CPU cycles and race conditions.", "Remediated: FR-01 handles raw buffering; FR-03 exclusively executes 2048-pt FFT."],
        ["Inconsistency", "NFR-01 set 150 ms latency; FR-07 allowed 5s timeout.", "Long timeout blocks real-time audio pipeline.", "Remediated: High-frequency inference decoupled; MPC solver runs in worker thread with 500 ms hard cutoff."],
        ["Missing Edge Case", "No handling for disconnected microphone.", "Zero amplitude misinterpreted as Overload pooling.", "Remediated: Added FR-02 (Sensor Watchdog): SNR < 12 dB flags SENSOR_FAULT and inhibits false overload trips."]
    ]
    tbl_qa = doc.add_table(rows=1, cols=len(qa_headers))
    format_black_lined_table(tbl_qa, qa_widths, qa_headers, qa_data, data_font_size=Pt(9))

    add_heading_2(doc, "6.3 Strategic Quality Improvements & Future Technical Roadmap")
    add_body_p(
        doc,
        "To ensure continuous technological advancement, four strategic roadmap enhancements are established: "
        "(1) Physics-Informed Digital Twin Acoustic Modeling (FEM/DEM charge simulation for rare liner wear scenarios); "
        "(2) Multi-Site Edge Federated Learning Network (collaborative cross-concentrator model training without sharing production volume data); "
        "(3) Phased Acoustic Beamforming Microphone Arrays (16-element MEMS beamforming to isolate the toe impact quadrant); and "
        "(4) Closed-Loop Mill Variable Speed (RPM) Modulation (co-optimizing feed rate with mill rotational speed)."
    )

    # Save document
    print(f"Saving monochrome document to: {output_path}...")
    doc.save(output_path)
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Document successfully created! File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    build_monochrome_document()

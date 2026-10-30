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

def build_full_document():
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

    # Clean blank paragraphs at end of template
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
        "In modern metallurgical mineral processing facilities, comminution—the physical size reduction of raw mined ore into micrometer-scale "
        "slurry—is the single most capital- and energy-intensive stage of mineral recovery. Industrial Semi-Autogenous Grinding (SAG) and Ball mills "
        "consume between 40% and 50% of the entire processing plant's electrical power, driven by multi-megawatt variable-frequency motors ranging "
        "from 15 to 25 MW per grinding line. Inside the high-velocity rotating cylindrical shell, grinding occurs through a continuous combination of "
        "attrition (cascading ore abrasion) and high-energy impact breakage (cataracting forged steel balls dropping onto the charge toe)."
    )
    add_body_p(
        doc,
        "Dynamic variations in raw ore hardness (Bond Work Index), rock fragmentation distribution, moisture content, and mineral density cause "
        "the internal volumetric charge to fluctuate wildly across three distinct operational regimes:"
    )
    add_bullet_p(
        doc,
        "Occurs when internal volumetric charge drops below 22%. Lacking an adequate ore rock cushion, heavy 125 mm forged steel grinding "
        "balls impact directly against the shell's manganese alloy lifter bars. This generates severe mechanical stress, catastrophic liner bolt shearing, "
        "lifter cracking, steel ball fracturing, and excessive wasted electrical energy without useful rock fragmentation.",
        bold_prefix="1. Severe Underload Condition: "
    )
    add_bullet_p(
        doc,
        "The metallurgical target envelope where volumetric filling is maintained between 26% and 32% with pulp density at 70% to 75% solids. "
        "Cataracting impacts land precisely on the toe of the charge, maximizing energy transfer into rock fracture, achieving target grind sizing "
        "(P80 ~75 µm), maximizing throughput (TPH), and minimizing specific power consumption (kWh/tonne).",
        bold_prefix="2. Optimal Grinding Envelope: "
    )
    add_bullet_p(
        doc,
        "Occurs when internal volumetric filling exceeds 36%. Ground rock and water form a thick slurry pool at the bottom of the mill shell, "
        "cushioning cataracts and halting rock breakage. The mill becomes hydraulically choked; motor torque surges, trunnion bearing temperatures "
        "spike, and feed chutes back-pack with wet ore. This triggers emergency motor over-torque trips, causing plant shutdowns that take 6 to 12 hours "
        "to manually dig out, costing upwards of $100,000 to $250,000 per incident in lost production.",
        bold_prefix="3. Dangerous Overload & Slurry Pooling Condition: "
    )

    add_heading_2(doc, "1.2 Business Domain and Technical Ecosystem")
    add_body_p(
        doc,
        "The operational domain bridges Extractive Metallurgy, Industrial IoT, Acoustic Telemetry, and Operational Technology (OT) / Information "
        "Technology (IT) integration. The primary business objectives of the mining enterprise are maximizing daily metal recovery rates, reducing specific "
        "power tariffs, protecting multi-million dollar rotating assets, and mitigating hazardous manual interventions in industrial grinding bays."
    )

    add_heading_2(doc, "1.3 Key Stakeholder Identification & Responsibilities Matrix")
    stk_headers = ["Stakeholder Role", "Domain", "Key Responsibilities", "Core Operational Pain Points", "Delivered System Value"]
    stk_widths = [1.3, 1.1, 1.6, 1.7, 1.5]
    stk_data = [
        ["Control Room Operator", "Operations", "Monitors DCS console 24/7; regulates ore feed conveyors and water additions.", "Cognitive fatigue; lagging motor power; sudden chute overloads causing unpredicted trips.", "Live waterfall spectrogram; predictive load index; automated closed-loop advisory tuning."],
        ["Metallurgical Engineer", "Metallurgy", "Monitors P80 grind sizing; audits specific energy (kWh/t) and metal recovery.", "Ore hardness variability causes over/under-grinding; slurry pooling blind spots.", "Live slurry pooling index; optimal grind envelope guidance; automated shift yield audits."],
        ["Reliability Engineer", "Maintenance", "Schedules liner relining; inspects shell liners, lifters, trunnion bearings, and gears.", "Liner cracking and bolt shearing during underloads; trunnion bearing overheating.", "Continuous impact severity detection; predictive liner wear and bolt loosening tracking."],
        ["Automation Tech", "OT / I&C", "Maintains acoustic sensors, DAQ cabling, PLC fieldbuses, and edge IPC.", "Slurry dust and heavy vibration damage sensors; complex legacy DCS integration.", "Standardized OPC-UA telemetry; automated sensor SNR self-diagnostics; watchdog relay."],
        ["Safety Officer", "HSE", "Enforces mining safety standards (MSHA/OSHA), noise limits, and interlocks.", "Manual chute unblocking exposes workers to confined space and crushing hazards.", "Predictive chute blockage mitigation eliminates manual unblocking entries; fail-safe trip."],
        ["Plant General Manager", "Executive", "Governs site profitability, production quotas, and CapEx ROI.", "Grinding is highest plant power cost; quarterly downtime deficits erode margins.", "3-5% power savings ($350k/yr); 25% downtime cut; full CapEx ROI in < 6 months."]
    ]
    tbl_stk = doc.add_table(rows=1, cols=len(stk_headers))
    format_black_lined_table(tbl_stk, stk_widths, stk_headers, stk_data, data_font_size=Pt(9))

    add_heading_2(doc, "1.4 Existing Operational Challenges & Sensor Gaps")
    add_body_p(
        doc,
        "Historically, industrial mill control has relied on legacy instrumentation: motor power draw (kW), motor current (Amps), bearing hydrodynamic "
        "oil pressure, and trunnion load cells. These sensors suffer from critical sensory lag: by the time motor power decreases or bearing pressure "
        "surges, the mill has already been overloaded and slurry-pooled for 10 to 15 minutes, rendering catastrophic trips virtually unavoidable. "
        "Furthermore, internal sensors cannot survive inside the abrasive, rotating rock slurry environment, while plant ambient background noise "
        "(105–115 dBA) from slurry pumps and vibrating screens completely drowns out unconditioned audio listening."
    )

    add_heading_2(doc, "1.5 System Strategic SMART Objectives")
    smart_headers = ["Pillar", "Objective Definition", "Target Engineering Metric", "Industrial Justification"]
    smart_widths = [1.1, 1.8, 2.0, 2.3]
    smart_data = [
        ["[S] Specific", "Acoustic Telemetry & Spectral Extraction", "Ingest 4-channel 48 kHz streams; compute 2048-pt FFT every 100 ms.", "Isolates toe impact frequency (800 Hz - 2.5 kHz) from ambient plant noise."],
        ["[M] Measurable", "Load Classification & Energy Optimization", "Achieve > 95% load accuracy; reduce specific energy by 3.0% to 5.0%.", "Yields over $350,000 in annual power tariff savings per industrial mill line."],
        ["[A] Achievable", "Edge Computing & DCS Fieldbus Integration", "Deploy fanless IP67 edge IPC interfacing with DCS via OPC-UA/Modbus.", "Eliminates cloud latency dependency; guarantees local deterministic control."],
        ["[R] Relevant", "Overload & Downtime Mitigation", "Provide 10-minute predictive warning before overload; cut stops by > 25%.", "Protects multi-megawatt drive trains and eliminates dangerous chute unblocking."],
        ["[T] Time-Bound", "Edge Inference & HMI Display Latency", "Complete edge ML inference in < 150 ms; refresh operator HMI in < 500 ms.", "Enables proactive feed adjustments well before slurry pooling causes motor trips."]
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
        "organized across eight modular subsystems and prioritized using the industry-standard MoSCoW framework:"
    )

    fr_headers = ["Req ID", "Module", "Requirement Specification", "Pri", "Input Data", "Processing & System Behavior"]
    fr_widths = [0.7, 1.0, 2.3, 0.6, 1.2, 1.4]
    fr_data = [
        ["FR-01", "Ingestion", "Multi-Channel Acoustic Ingestion: Ingest continuous 48 kHz 24-bit PCM acoustic telemetry.", "Must", "Raw audio buffers (ALSA/ASIO).", "Manages ring buffers; outputs synchronized 100 ms acoustic frames."],
        ["FR-02", "Ingestion", "Sensor Health Watchdog: Monitor microphone baseline and detect disconnection/clipping.", "Must", "Acoustic power spectrum.", "Computes running SNR; flags SENSOR_FAULT if SNR < 12 dB for > 2s."],
        ["FR-03", "DSP Engine", "Real-Time FFT & Spectral Extraction: Convert audio waveforms to frequency representations.", "Must", "100 ms acoustic frames.", "Computes 2048-pt FFT; outputs centroid, flux, and 32 Mel bands."],
        ["FR-04", "DSP Engine", "Ambient Noise Suppression: Filter background slurry pump and vibrating screen noise.", "Should", "Multi-channel audio streams.", "Applies Chebyshev bandpass filter (500 Hz - 12 kHz comminution band)."],
        ["FR-05", "ML Engine", "Volumetric Load Regime Classification: Classify mill into Underload, Optimal, or Overload.", "Must", "Spectral feature vector, power.", "Evaluates Random Forest/1D-CNN; outputs Load Index (0.00-1.00)."],
        ["FR-06", "ML Engine", "Slurry Pooling Estimation: Quantify slurry pool depth damping internal mill impacts.", "Should", "Low-frequency attenuation (1-3 kHz).", "Calculates damping coefficient; outputs Slurry Pool Index (0-100%)."],
        ["FR-07", "Control", "Closed-Loop Feed Rate & Water Optimization: Generate predictive feed/water setpoints.", "Must", "Load Index, feed rate (TPH), power.", "Executes Model Predictive Control (MPC); outputs target setpoints."],
        ["FR-08", "Control", "Safety Clamping & Rate Limiting: Restrict setpoints within metallurgical safety limits.", "Must", "Raw advisory setpoints from FR-07.", "Applies rate clamps (max ±10 TPH/min); clamps within safe operating bounds."],
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

    # 4.1 Introduction
    add_heading_2(doc, "4.1 Introduction")
    add_body_p(
        doc,
        "This Software Requirement Specification (SRS) document details the complete functional, non-functional, behavioral, data, "
        "and architectural requirements for the Intelligent Mineral Ore Grinding Optimization & Real-Time Acoustic Telemetry System "
        "(AcoustiMill AI). Conforming to IEEE Std 830-1998 (Recommended Practice for Software Requirements Specifications) and ISO/IEC/IEEE "
        "29148:2018 standards, this specification establishes the binding engineering baseline between metallurgical stakeholders, control engineers, "
        "and software developers."
    )
    add_body_p(
        doc,
        "Document Conventions: Requirements are uniquely indexed using standardized alphanumeric codes: FR-XX denotes Functional Requirements, "
        "NFR-XX denotes Non-Functional Requirements, and UC-XX denotes Use Cases. Requirements are prioritized using the MoSCoW framework "
        "(Must have, Should have, Could have, Won't have this release). All mathematical formulations and spectral engineering units follow the "
        "International System of Units (SI), with acoustic pressure referenced to 20 µPa."
    )
    add_body_p(
        doc,
        "Intended Audience & Reading Suggestions: This document serves multiple specialized cross-disciplinary stakeholders: "
        "(1) Control Room Operators should review Sections 4.6 (Use Cases) and 4.8 (HMI Interfaces); (2) Metallurgical Engineers should focus on "
        "Sections 4.4 (Functional Requirements) and 4.9 (System Features); (3) Reliability & Maintenance Engineers should inspect Sections 4.4 and "
        "4.8 (Hardware Interfaces); (4) Automation Technicians and OT/IT Engineers should study Sections 4.7 (Data Requirements) and 4.8 (Protocols); "
        "and (5) Software Architects and Test Engineers must rigorously evaluate all sections for full traceability."
    )
    add_body_p(
        doc,
        "Project Background: Industrial comminution circuits are plagued by dynamic ore hardness shifts that destabilize mill filling, leading to "
        "either destructive underload liner impacts or catastrophic overload slurry pooling trips. AcoustiMill AI delivers a non-intrusive acoustic "
        "sensing and machine learning edge platform that continuously listens to mill comminution frequencies, classifies load states in real time, "
        "and calculates closed-loop advisory setpoints to maximize throughput and cut electrical consumption."
    )

    # 4.2 Problem Description
    add_heading_2(doc, "4.2 Problem Description")
    add_body_p(
        doc,
        "Comminution is the physical reduction of raw run-of-mine ore into fine particles suitable for downstream chemical flotation and mineral extraction. "
        "Semi-Autogenous Grinding (SAG) and Ball mills are massive rotating cylindrical steel drums (often 10 to 12 meters in diameter) driven by "
        "15 to 25 MW electric motors. Because mineral comminution consumes 40% to 50% of the entire processing plant's electricity, mill efficiency "
        "directly governs mine site profitability and carbon footprint."
    )
    add_body_p(
        doc,
        "Inside the rotating shell, grinding dynamics alternate between cascading (attrition) and cataracting (high-impact trajectory breakage). "
        "The operational challenges stem from extreme feed variability: changes in rock fragment distribution, moisture, and rock hardness "
        "(Bond Work Index) continuously push the mill out of its optimal grinding envelope into two catastrophic extremes:"
    )
    add_bullet_p(
        doc,
        "When volumetric charge drops below 22%, the absence of an ore rock cushion causes 125 mm forged steel balls to violently "
        "strike the mill shell's manganese lifters directly. This metal-on-metal impact shears liner bolts, cracks expensive lifters, and wastes "
        "enormous electrical energy without producing ground ore.",
        bold_prefix="Severe Underload Damage: "
    )
    add_bullet_p(
        doc,
        "When volumetric charge exceeds 36%, ground ore and water form a dense, viscous slurry pool at the shell toe. This pool "
        "cushions cataracting impacts, halting rock fracture completely. Slurry backs up into feed chutes, motor torque surges, trunnion bearing "
        "temperatures exceed critical thresholds, and the mill trips on overload. Cleaning out a choked mill requires manual rodding and confined space "
        "entry, resulting in 6 to 12 hours of total plant downtime costing over $100,000 per incident.",
        bold_prefix="Severe Overload & Chute Choking: "
    )
    add_body_p(
        doc,
        "The Blind-Spot Problem: Traditional instrumentation relies on electric motor current, motor active power (kW), and trunnion bearing lubrication "
        "pressure. These parameters exhibit an intrinsic 10 to 15 minute physical hysteresis delay. By the time motor power begins to drop or bearing "
        "oil pressure spikes, the mill is already heavily choked and tripping is unavoidable. An external acoustic telemetry platform that interprets the "
        "instantaneous acoustic resonance of the steel drum is required to detect load shifts within milliseconds."
    )

    # 4.3 Scope of the System
    add_heading_2(doc, "4.3 Scope of the System")
    add_body_p(
        doc,
        "AcoustiMill AI operates within the Purdue Enterprise Reference Architecture at Level 2/3 as an advanced supervisory control and optimization "
        "co-pilot. It acts as an intelligent decision-support layer sitting directly above existing Level 1 Distributed Control Systems (DCS) and "
        "Programmable Logic Controllers (PLCs)."
    )
    add_body_p(
        doc,
        "In-Scope System Boundaries:",
        bold_prefix="Architectural Boundary: "
    )
    add_bullet_p(
        doc,
        "Ingesting 4-channel continuous 48 kHz 24-bit acoustic streams from ruggedized directional microphones targeted at the mill toe impact zone.",
        bold_prefix="1. Acoustic Signal Acquisition: "
    )
    add_bullet_p(
        doc,
        "Executing 2048-point Fast Fourier Transforms (FFT), Mel-frequency filter banking (32 bands), spectral centroid, and spectral flux calculations "
        "every 100 ms on a fanless industrial edge IPC.",
        bold_prefix="2. Edge Digital Signal Processing: "
    )
    add_bullet_p(
        doc,
        "Classifying internal volumetric filling into Underload, Optimal, and Overload states, and quantifying slurry pool depth with > 95% accuracy.",
        bold_prefix="3. Machine Learning Inference: "
    )
    add_bullet_p(
        doc,
        "Computing Model Predictive Control (MPC) recommendations for conveyor ore feed tonnage (TPH) and cyclone feed water addition.",
        bold_prefix="4. Supervisory Setpoint Optimization: "
    )
    add_bullet_p(
        doc,
        "Delivering an ISA-101 compliant web HMI displaying live spectrogram waterfalls, polar charge trajectory dials, and predictive alarms.",
        bold_prefix="5. Operator Visualization: "
    )
    add_bullet_p(
        doc,
        "Writing supervisory setpoints to DCS via OPC-UA/Modbus TCP, backed by a hardware watchdog relay that guarantees bump-less fail-safe disconnect.",
        bold_prefix="6. Industrial DCS Interfacing: "
    )
    add_body_p(
        doc,
        "Out-of-Scope Boundaries: The system does not directly control mine blasting fragmentation, upstream primary crushers, downstream chemical "
        "flotation banks, or high-voltage switchgear breakers. Safety Instrumented Systems (SIS/Level 1 ESD emergency shutdown interlocks) remain "
        "strictly independent and retain ultimate physical trip authority over all drives."
    )

    # 4.4 Functional Requirements (Brief recap and linkage to Section 2.1)
    add_heading_2(doc, "4.4 Functional Requirements")
    add_body_p(
        doc,
        "The platform's functional baseline comprises 16 core requirements across 8 architectural subsystems as formalized in Section 2.1 of this report. "
        "These include: Multi-Channel Acoustic Ingestion (FR-01), Sensor Health Watchdog (FR-02), Real-Time FFT & Spectral Extraction (FR-03), "
        "Ambient Noise Filtering (FR-04), Volumetric Load Classification (FR-05), Slurry Pooling Estimation (FR-06), Closed-Loop Feed Optimization (FR-07), "
        "Safety Clamping & Rate Limiting (FR-08), ISA-101 Operator Dashboard (FR-09), Manual Override & Bump-less Transfer (FR-10), Liner Bolt "
        "Loosening Alarm (FR-11), Trunnion Bearing Health Engine (FR-12), High-Resolution Historian (FR-13), Shift OEE & Energy Reporting (FR-14), "
        "Role-Based Access Control (FR-15), and Automatic Hardware Watchdog Disconnect (FR-16)."
    )

    # 4.5 Non-Functional Requirements (Brief recap and linkage to Section 2.2)
    add_heading_2(doc, "4.5 Non-Functional Requirements")
    add_body_p(
        doc,
        "The system enforces strict operational quality benchmarks as detailed in Section 2.2: Hard real-time edge ML inference latency ≤ 150 ms (NFR-01); "
        "End-to-end HMI screen refresh ≤ 500 ms (NFR-02); Continuous 24/7/365 operational availability ≥ 99.95% (NFR-03); ISA/IEC 62443 cybersecurity "
        "compliance with TLS 1.3 and AES-256 encryption (NFR-04); Ergonomic ISA-101 High-Performance HMI compliance with a 2-click control hierarchy (NFR-05); "
        "Scalability across 4 concurrent grinding lines (NFR-06); Containerized Docker microservices with zero-downtime rolling updates (NFR-07); and "
        "Deterministic hardware fail-safe disconnect < 500 ms upon watchdog timeout (NFR-08)."
    )

    # 4.6 Use Case Descriptions
    add_heading_2(doc, "4.6 Use Case Descriptions")
    add_body_p(
        doc,
        "Formal behavioral specifications for key use cases governing ingestion, machine learning inference, supervisory control, "
        "manual intervention, predictive diagnostics, and safety shutdown are structured below conforming to Cockburn / IEEE standards:"
    )

    # UC-01
    add_heading_3(doc, "UC-01: Continuous Multi-Channel Acoustic Telemetry Ingestion")
    uc1_headers = ["Attribute", "Specification Details"]
    uc1_widths = [1.8, 5.0]
    uc1_data = [
        ["Use Case ID & Name", "UC-01: Continuous Multi-Channel Acoustic Telemetry Ingestion"],
        ["Primary Actor", "Acoustic Sensor Array & 24-bit DAQ Interface (System Actor)"],
        ["Secondary Actors", "Automation Technician, Edge Ingestion Service"],
        ["Preconditions", "1. IP67 directional microphones connected to DAQ; 2. Audio ALSA/ASIO driver initialized; 3. Ring buffer allocated."],
        ["Trigger", "Edge IPC daemon startup or restart of acoustic acquisition service."],
        ["Main Success Flow", "1. System configures 4 channels at 48 kHz, 24-bit PCM sampling; 2. DMA controller writes audio frames to 10-second circular ring buffer; 3. System checks buffer integrity and timestamp synchronization; 4. Signals DSP engine upon completion of each 100 ms frame (4800 samples/channel); 5. Verifies microphone baseline voltage and SNR."],
        ["Alternative Flows", "4a. Buffer overrun detected: Drops oldest 100 ms frame, logs warning, increments dropped-packet counter.\n5a. Microphone signal drops < 12 dB SNR for > 2 seconds: Raises SENSOR_FAULT alarm, flags channel as degraded, and inhibits automated ML classification."],
        ["Gherkin BDD Scenario", "GIVEN the DAQ interface is powered and 4 microphones are operational\nWHEN continuous audio streams are sampled at 48 kHz\nTHEN synchronized 100 ms PCM frames are pushed to the DSP queue with timestamp jitter < 2 ms."]
    ]
    tbl_uc1 = doc.add_table(rows=1, cols=len(uc1_headers))
    format_black_lined_table(tbl_uc1, uc1_widths, uc1_headers, uc1_data, data_font_size=Pt(9))

    # UC-03
    add_heading_3(doc, "UC-03: Real-Time Mill Load State & Slurry Pool Classification")
    uc3_headers = ["Attribute", "Specification Details"]
    uc3_widths = [1.8, 5.0]
    uc3_data = [
        ["Use Case ID & Name", "UC-03: Real-Time Acoustic Mill State & Slurry Pool Classification"],
        ["Primary Actor", "DSP / Machine Learning Inference Engine (System Actor)"],
        ["Secondary Actors", "Control Room Operator, Plant DCS / PLC"],
        ["Preconditions", "1. Raw audio stream active (UC-01); 2. 2048-pt FFT feature vector computed (FR-03); 3. ONNX model loaded."],
        ["Trigger", "Arrival of newly computed spectral feature vector in the edge queue (periodic every 100 ms)."],
        ["Main Success Flow", "1. System extracts 32 Mel-frequency bins and spectral centroid; 2. Evaluates trained Random Forest/1D-CNN; 3. Computes softmax probabilities across Underload, Optimal, and Overload; 4. Outputs continuous Load Index (0.00-1.00) and Slurry Pooling Index (0-100%); 5. Publishes load state via OPC-UA within 45 ms."],
        ["Alternative Flows", "3a. Softmax probability < 0.60: Flags state as TRANSITIONAL; retains previous verified state.\n2a. Sensor SNR < 12 dB: Halts classification; flags SENSOR_DEGRADED; alerts operator."],
        ["Gherkin BDD Scenario", "GIVEN the mill operates with steady ore feed and sensor SNR is > 20 dB\nWHEN a 100 ms acoustic window with high-frequency shell impacts (3-6 kHz) is processed\nTHEN the system outputs 'UNDERLOAD' with Load Index < 0.25 within 150 ms."]
    ]
    tbl_uc3 = doc.add_table(rows=1, cols=len(uc3_headers))
    format_black_lined_table(tbl_uc3, uc3_widths, uc3_headers, uc3_data, data_font_size=Pt(9))

    # UC-04
    add_heading_3(doc, "UC-04: Closed-Loop Feed & Water Ratio Supervisory Control")
    uc4_headers = ["Attribute", "Specification Details"]
    uc4_widths = [1.8, 5.0]
    uc4_data = [
        ["Use Case ID & Name", "UC-04: Closed-Loop Feed & Water Ratio Advisory Recommendation"],
        ["Primary Actor", "Plant Distributed Control System (DCS / PLC) & Supervisory Control Engine"],
        ["Secondary Actors", "Control Room Operator, Metallurgical Engineer"],
        ["Preconditions", "1. Valid Load Index available from UC-03; 2. Motor power (kW) and feed (TPH) received from DCS; 3. Auto/Advisory mode active."],
        ["Trigger", "Periodic 1-second supervisory control loop timer."],
        ["Main Success Flow", "1. Evaluates Model Predictive Control (MPC); 2. If Underload (< 0.30), calculates feed increase (+15 TPH); 3. If Overload (> 0.75), calculates feed reduction (-35 TPH); 4. Applies safety clamping (max ±10 TPH/min); 5. In Auto mode, writes setpoints to DCS via OPC-UA; 6. Logs event."],
        ["Alternative Flows", "4a. Setpoint exceeds bounds (300-650 TPH): Clamps strictly to limit; alerts operator.\n5a. OPC-UA write fails: Retries once; if failed, alerts operator and disengages Auto mode."],
        ["Gherkin BDD Scenario", "GIVEN the mill enters Overload with Load Index 0.88 and motor power declining\nWHEN the 1-second optimization loop executes\nTHEN system issues feed reduction of -30 TPH within 200 ms and limits reduction rate safely."]
    ]
    tbl_uc4 = doc.add_table(rows=1, cols=len(uc4_headers))
    format_black_lined_table(tbl_uc4, uc4_widths, uc4_headers, uc4_data, data_font_size=Pt(9))

    # UC-05
    add_heading_3(doc, "UC-05: Operator Manual Setpoint Override & Bump-less Transfer")
    uc5_headers = ["Attribute", "Specification Details"]
    uc5_widths = [1.8, 5.0]
    uc5_data = [
        ["Use Case ID & Name", "UC-05: Operator Manual Setpoint Override & Bump-less Transfer"],
        ["Primary Actor", "Control Room Operator (Human)"],
        ["Secondary Actors", "Plant DCS / PLC, Advisory Control Service"],
        ["Preconditions", "1. AcoustiMill AI operating in Auto Mode; 2. Operator authenticated via RBAC credentials on HMI."],
        ["Trigger", "Operator clicks 'Manual Override' toggle button on DCS or AcoustiMill AI HMI console."],
        ["Main Success Flow", "1. System intercepts operator toggle; 2. Sends handshake signal to DCS decoupling AI supervisory write channel; 3. Latches current conveyor feed rate and water valve setpoints to prevent step transients (bump-less transfer); 4. Switches system display mode to 'Advisory / Passive Tracking'; 5. Logs operator ID, override timestamp, and justification into immutable audit trail."],
        ["Alternative Flows", "2a. DCS communication handshake times out (> 1000 ms): Reverts immediately to Level 1 local DCS lock, displays COMMUNICATION_ERROR, and sounds operator console chime."],
        ["Gherkin BDD Scenario", "GIVEN the mill is running under AI Auto control at 450 TPH\nWHEN the operator presses 'Manual Override'\nTHEN AI setpoint writes halt immediately, DCS maintains steady 450 TPH without step changes, and audit log registers event."]
    ]
    tbl_uc5 = doc.add_table(rows=1, cols=len(uc5_headers))
    format_black_lined_table(tbl_uc5, uc5_widths, uc5_headers, uc5_data, data_font_size=Pt(9))

    # UC-07
    add_heading_3(doc, "UC-07: Triage Predictive Mechanical Liner Bolt Loosening Alarms")
    uc7_headers = ["Attribute", "Specification Details"]
    uc7_widths = [1.8, 5.0]
    uc7_data = [
        ["Use Case ID & Name", "UC-07: Triage Predictive Mechanical Liner Bolt Loosening Alarms"],
        ["Primary Actor", "Maintenance Engineer / Reliability Engineer (Human)"],
        ["Secondary Actors", "Acoustic Diagnostics Engine, Control Room Operator"],
        ["Preconditions", "1. High-frequency acoustic transient analyzer active (> 14 kHz); 2. Mill shell rotational resolver synced."],
        ["Trigger", "Identification of periodic high-amplitude shock pulses recurring at the same rotational shell angle."],
        ["Main Success Flow", "1. System detects repetitive > 16 kHz acoustic transient signature exceeding 85 dB threshold at specific shell angle; 2. Correlates angle with liner bolt ring sector (Row 4, Lifter 12); 3. Generates Priority 2 Maintenance Alert: 'Liner Bolt Loosening Suspected'; 4. Displays shell polar heat map on HMI; 5. Reliability engineer inspects acoustic waveform, acknowledges alert, and schedules bolt retightening during next inspection turnaround."],
        ["Alternative Flows", "1a. Transient occurs randomly without angular periodicity: Classifies as isolated tramp metal impact; logs event in historian without raising mechanical bolt loosening alarm."],
        ["Gherkin BDD Scenario", "GIVEN mill rotates at 12.4 RPM with shell angle resolver calibrated\nWHEN acoustic transients > 14 kHz repeat at angle 142° for 50 consecutive revolutions\nTHEN system issues Liner Bolt Loosening Warning specifying shell sector within 5 seconds."]
    ]
    tbl_uc7 = doc.add_table(rows=1, cols=len(uc7_headers))
    format_black_lined_table(tbl_uc7, uc7_widths, uc7_headers, uc7_data, data_font_size=Pt(9))

    # UC-12
    add_heading_3(doc, "UC-12: Execute Safety Interlock Trip & Hardware Watchdog Disconnect")
    uc12_headers = ["Attribute", "Specification Details"]
    uc12_widths = [1.8, 5.0]
    uc12_data = [
        ["Use Case ID & Name", "UC-12: Execute Safety Interlock Trip & Hardware Watchdog Disconnect"],
        ["Primary Actor", "Hardware Watchdog Relay & Safety Interlock Daemon (System Actor)"],
        ["Secondary Actors", "Plant Safety Officer, Plant DCS / PLC"],
        ["Preconditions", "1. Edge IPC running supervisory control daemon; 2. Hardware watchdog timer configured to 1000 ms."],
        ["Trigger", "Watchdog heartbeat pulse not renewed within 1000 ms due to edge software crash, OS freeze, or network fault."],
        ["Main Success Flow", "1. Hardware watchdog timer expires (t = 1000 ms); 2. Relay de-energizes, opening dry contact to DCS safety circuit; 3. DCS detects open contact within < 20 ms and immediately strips AI setpoint authority; 4. DCS reverts feed conveyors to fail-safe default baseline; 5. Flashing red alarm triggered on SCADA console: 'AI_COPILOT_WATCHDOG_TRIP'; 6. System generates post-mortem crash dump on non-volatile edge storage."],
        ["Alternative Flows", "2a. Relay fails to de-energize (welded contact): Secondary software watchdog on DCS detects stale timestamp (> 2000 ms) and forcefully revokes OPC-UA write permission."],
        ["Gherkin BDD Scenario", "GIVEN the AI supervisory co-pilot is controlling mill feed rate\nWHEN an operating system freeze prevents watchdog heartbeat for 1000 ms\nTHEN the physical watchdog relay drops out within 20 ms and DCS safely assumes manual feed control."]
    ]
    tbl_uc12 = doc.add_table(rows=1, cols=len(uc12_headers))
    format_black_lined_table(tbl_uc12, uc12_widths, uc12_headers, uc12_data, data_font_size=Pt(9))

    # 4.7 Data Requirements & Schema Dictionary
    add_heading_2(doc, "4.7 Data Requirements")
    add_body_p(
        doc,
        "AcoustiMill AI implements a multi-tiered data pipeline designed to handle extreme ingestion throughput at the edge while "
        "guaranteeing permanent auditability for enterprise metallurgical tracking. The data architecture consists of: (1) In-memory DMA circular "
        "ring buffers for 48 kHz raw audio; (2) An edge-resident TimescaleDB time-series database for 1-second spectral summaries and state predictions; "
        "and (3) A relational PostgreSQL database for operator actions, alarm records, and shift yield audits."
    )

    data_headers = ["Entity / Table Name", "Storage Engine", "Key Schema Attributes & Datatypes", "Volume & Retention SLA"]
    data_widths = [1.5, 1.3, 2.5, 1.5]
    data_data = [
        ["RawAcousticBuffer", "Edge Memory Buffer", "timestamp_ns (int64), channel_id (int8), pcm_samples (float32[4800]), snr_db (float32)", "Rolling 10s ring buffer (15.3 MB); volatile."],
        ["SpectralTelemetryLog", "TimescaleDB", "time (timestamptz), mill_id (text), centroid_hz (float32), flux (float32), mel_energies (float32[32])", "1 row/sec; 86.4k rows/day; 90-day retention."],
        ["MillLoadPrediction", "TimescaleDB", "time (timestamptz), load_state (enum), load_index (float32), pooling_idx (float32), confidence", "1 row/sec; compressed; retained 1 year."],
        ["AdvisoryControlLog", "PostgreSQL", "log_id (uuid), time (timestamptz), rec_tph (float32), dcs_tph (float32), mode (text), op_id (text)", "Permanent regulatory audit log (7 years)."],
        ["AnomalyAlarmRegistry", "PostgreSQL", "alarm_id (uuid), time (timestamptz), severity (enum), fault_type (text), shell_deg (float32), ack_by", "Permanent reliability log (10 years)."],
        ["ShiftProductionSummary", "PostgreSQL", "shift_id (text), date (date), total_tonnage (float32), mwh_consumed (float32), kwh_per_ton", "Shift aggregated metrics; permanent."]
    ]
    tbl_data = doc.add_table(rows=1, cols=len(data_headers))
    format_black_lined_table(tbl_data, data_widths, data_headers, data_data, data_font_size=Pt(9))

    add_body_p(
        doc,
        "Data Compression & Purging Policy: High-frequency spectral vectors older than 14 days are compressed using TimescaleDB chunk-based delta-of-delta "
        "compression, reducing storage footprint by 92%. Diagnostic raw audio snippets are permanently retained only when triggered by high-severity "
        "liner damage or emergency overload trips (30-second pre- and post-trip waveform snapshots)."
    )

    # 4.8 External Interface Requirements
    add_heading_2(doc, "4.8 External Interface Requirements")
    add_body_p(
        doc,
        "To ensure seamless deployment into existing brownfield and greenfield concentrators, AcoustiMill AI defines four comprehensive interface categories:"
    )
    add_bullet_p(
        doc,
        "Web-based responsive operator interface complying with ISA-101 High-Performance HMI principles. Features a dark-themed, "
        "low-contrast background to minimize operator glare in 24/7 control rooms. Features include: (a) Dynamic polar charge toe dial showing "
        "estimated cataract impact angle (0–360°); (b) Real-time acoustic spectrogram waterfall (0–24 kHz); (c) Volumetric load index bar with clear "
        "target grinding envelope boundaries (0.26–0.32); (d) Single-click manual override toggle button; and (e) ANSI/ISA-18.2 compliant alarm banner.",
        bold_prefix="1. User Interfaces (HMI / UI): "
    )
    add_bullet_p(
        doc,
        "Includes: (a) Four IP67 stainless-steel directional microphones equipped with ceramic acoustic diaphragms and integrated "
        "vortex cooling tubes; (b) Multi-channel 24-bit delta-sigma ADC DAQ unit communicating over isolated USB 3.0 / PCIe; (c) Optical encoder / "
        "inductive proximity sensor mounted on the mill trunnion for precise mill angular position synchronization; and (d) Fanless IP67 industrial "
        "edge PC powered by an Intel Core i7 / NVIDIA Jetson Orin embedded processor rated for -10°C to +55°C plant environments.",
        bold_prefix="2. Hardware Interfaces: "
    )
    add_bullet_p(
        doc,
        "Operates on Ubuntu Core / Real-Time Industrial Linux (PREEMPT_RT). Uses ONNX Runtime for optimized edge ML model inference; "
        "TimescaleDB / PostgreSQL for time-series and relational persistence; Docker container engine for microservice isolation; and NGINX "
        "reverse proxy serving HTTPS / WebSocket streams to client control room workstations.",
        bold_prefix="3. Software Interfaces: "
    )
    add_bullet_p(
        doc,
        "Implements: (a) OPC-UA (IEC 62541) binary TCP client/server interface for bidirectional communication with plant DCS "
        "(Honeywell Experion, Emerson DeltaV, ABB 800xA, Siemens PCS7); (b) Modbus TCP (Port 502) fallback protocol; (c) MQTT with Sparkplug B "
        "payload format for transmitting compressed plant KPIs to enterprise cloud historians (OSIsoft PI / Aveva); and (d) A physical dry-contact "
        "watchdog relay connected to the DCS digital input rack.",
        bold_prefix="4. Communications Interfaces: "
    )

    # 4.9 System Features
    add_heading_2(doc, "4.9 System Features")
    add_body_p(
        doc,
        "The AcoustiMill AI platform is structured around six core modular features, each delivering targeted engineering capabilities:"
    )
    add_bullet_p(
        doc,
        "Ingests 48 kHz acoustic streams, filters background screen and pump rumble using a 500 Hz high-pass filter, and computes "
        "2048-point FFTs and 32 Mel-frequency spectral energies every 100 ms to capture instantaneous rock fracture and shell ringing.",
        bold_prefix="Feature 1: Real-Time Acoustic Spectral Decomposition: "
    )
    add_bullet_p(
        doc,
        "Executes a low-latency 1D-CNN / Random Forest ensemble at the edge to calculate a normalized Load Index (0.00–1.00) "
        "and a Slurry Pooling Index (0–100%), predicting overloads 10 minutes before motor current reacts.",
        bold_prefix="Feature 2: Machine Learning Charge Dynamics & Slurry Pool Classification: "
    )
    add_bullet_p(
        doc,
        "Evaluates a multi-variable Model Predictive Controller (MPC) every 1.0 s, generating optimized ore feed rate (TPH) "
        "and water valve setpoints with strict metallurgical rate clamps (max ±10 TPH/min) to prevent thermal or mechanical shock.",
        bold_prefix="Feature 3: Closed-Loop Model Predictive Supervisory Optimization: "
    )
    add_bullet_p(
        doc,
        "Analyzes high-frequency (> 14 kHz) acoustic transient shockwaves synchronized with mill rotation angle to detect loosened "
        "liner bolts, cracked lifters, and trunnion bearing lubrication starvation before catastrophic structural failure.",
        bold_prefix="Feature 4: Predictive Mechanical Health & Liner Bolt Diagnostics: "
    )
    add_bullet_p(
        doc,
        "Renders 60 FPS HTML5 live waterfall spectrograms, load dials, and advisory cards with bump-less manual transfer, "
        "reducing operator cognitive fatigue and strictly following ISA-101 design standards.",
        bold_prefix="Feature 5: High-Performance ISA-101 Operator Console: "
    )
    add_bullet_p(
        doc,
        "Aggregates 1-second spectral summaries and process metrics, computing shift-level Overall Equipment Effectiveness (OEE) "
        "and specific energy consumption (kWh/tonne) exported directly to enterprise ERP systems (SAP / OSIsoft PI).",
        bold_prefix="Feature 6: Enterprise Historian & Shift Telemetry Auditing: "
    )

    # =========================================================================
    # SECTION 5: IDENTIFY ASSUMPTIONS AND CONSTRAINTS (Rubric 5: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "5. Identify Assumptions and Constraints")

    # 5.1 Assumptions
    add_heading_2(doc, "5.1 List of Assumptions Considered While Developing the System")
    add_body_p(
        doc,
        "The technical architecture, machine learning models, and supervisory control loops of the AcoustiMill AI system are designed "
        "based on several validated engineering and operational assumptions:"
    )
    add_bullet_p(
        doc,
        "It is assumed that the grinding mill operates as a continuous 24/7 production circuit, and that the feed conveyor belt is equipped "
        "with a functional Variable Frequency Drive (VFD) and weightometer capable of modulating ore feed tonnage across 300 to 650 TPH.",
        bold_prefix="1. Operational Steady-State Assumption: "
    )
    add_bullet_p(
        doc,
        "It is assumed that physical space allows mounting microphone brackets with an unobstructed line-of-sight to the mill toe impact quadrant "
        "(shell angle between 120° and 160°) at a standoff distance of 2.0 to 3.5 meters. Furthermore, ambient acoustic noise from neighboring flotation cells "
        "and vibrating screens is assumed to remain predominantly below 800 Hz, leaving the 1.0 to 3.5 kHz comminution band spectrally distinct.",
        bold_prefix="2. Environmental & Acoustic Path Assumption: "
    )
    add_bullet_p(
        doc,
        "It is assumed that the plant provides clean, dry instrument air (4 to 6 bar) for continuous vortex-purge jackets on microphone enclosures, "
        "preventing slurry cake and dust buildup on acoustic diaphragms. Dual-redundant 24V DC UPS power is assumed to provide at least 30 minutes of backup.",
        bold_prefix="3. Sensor & Hardware Hygiene Assumption: "
    )
    add_bullet_p(
        doc,
        "It is assumed that the industrial Ethernet switch network connecting the edge IPC to the plant DCS provides deterministic packet delivery "
        "with round-trip latency < 50 ms and packet loss < 0.01%. It is also assumed that DCS engineering permits external supervisory setpoint writes via OPC-UA.",
        bold_prefix="4. Industrial Communications Assumption: "
    )
    add_bullet_p(
        doc,
        "It is assumed that raw run-of-mine ore hardness (Bond Work Index) and fragment top-size exhibit relatively smooth statistical distributions "
        "within any single 8-hour mining shift, with abrupt hardness transitions occurring only during primary crusher blend or stockpile transitions.",
        bold_prefix="5. Metallurgical Feed Homogeneity Assumption: "
    )
    add_bullet_p(
        doc,
        "It is assumed that control room operators possess standard certified competency in grinding circuit operation, have completed ISA-101 HMI "
        "training, and that maintenance personnel strictly follow Lock-Out/Tag-Out (LOTO) protocols during any physical sensor servicing.",
        bold_prefix="6. Personnel & Safety Competence Assumption: "
    )

    # 5.2 Constraints
    add_heading_2(doc, "5.2 Multi-Dimensional Constraints Analysis")
    add_body_p(
        doc,
        "Industrial software development in mining environments is strictly bounded by harsh technical, operational, economic, legal, and time-related "
        "constraints. The following matrix and detailed breakdown delineate these constraints and the engineered mitigation strategies:"
    )

    const_headers = ["Constraint Domain", "Identified Constraint", "Engineering Impact & Operational Risk", "System Mitigation Strategy"]
    const_widths = [1.3, 1.7, 2.1, 2.1]
    const_data = [
        ["Technical (Compute)", "Ruggedized Fanless Edge Computing", "Execution restricted to fanless IP67 edge IPC; zero reliance on cloud connectivity.", "Optimized C++ DSP pipeline; 8-bit quantized ONNX inference; hard latency < 150 ms."],
        ["Technical (EMI)", "Severe Electromagnetic Interference", "15-25 MW VFDs and switchgear induce huge ground loops and RF noise in sensor cables.", "Double-shielded twisted pairs; differential audio signaling; fiber-optic DCS link."],
        ["Operational", "24/7/365 Continuous Concentrator Uptime", "Grinding circuits cannot stop for software upgrades; crashes risk choked mill overloads.", "Docker microservices with rolling updates; automated watchdog hardware trip relay."],
        ["Operational", "Non-Intrusive External Mounting Only", "Sensors cannot be mounted inside the rotating drum or drilled into pressurized bearings.", "Acoustic telemetry listens through air at 2.5m standoff; zero rotating contact."],
        ["Economic", "Strict CapEx Payback < 6 Months", "Mining executive committee requires demonstrated ROI within 180 operating days.", "3-5% power cut ($350k/yr) and downtime reduction yields full payback in 4.2 months."],
        ["Legal & Safety", "MSHA / OSHA & ATEX Combustible Dust", "Mining regulations mandate strict explosion-proof ratings in combustible sulfide dust.", "Sensors and junction boxes certified ATEX Zone 22 / NEC Class II, Div 2."],
        ["Legal & OT Safety", "Zero Direct Emergency Safety Override", "Software must never override plant Safety Instrumented System (SIS) interlocks.", "Purdue Level 2/3 advisory isolation; hardware SIS holds ultimate trip authority."],
        ["Project Schedule", "72-Hour Relining Maintenance Window", "Physical bracket mounting permitted only during scheduled mill liner replacement.", "Pre-fabricated magnetic clamp mounts and plug-and-play IP67 M12 harness wiring."]
    ]
    tbl_const = doc.add_table(rows=1, cols=len(const_headers))
    format_black_lined_table(tbl_const, const_widths, const_headers, const_data, data_font_size=Pt(8.5))

    add_body_p(
        doc,
        "Detailed Narrative of Key Constraints:",
        bold_prefix="In-Depth Constraint Examination: "
    )
    add_bullet_p(
        doc,
        "The grinding concentrator is located in remote high-altitude mining sites with unreliable satellite internet. The entire data processing, "
        "DSP filtering, machine learning inference, and closed-loop control must execute fully autonomously on the local edge computer without sending "
        "raw audio to the cloud. Model execution must finish within < 150 ms to guarantee timely advisory setpoint generation.",
        bold_prefix="Technical Edge Computing Constraint: "
    )
    add_bullet_p(
        doc,
        "Grinding concentrators represent the single largest capital investment in mineral processing plants. A 1% increase in mill availability or a "
        "3% reduction in electrical power tariffs saves between $350,000 and $750,000 annually per mill line. The total system deployment cost "
        "(hardware, sensors, software licensing, and integration) is capped at $120,000, ensuring a guaranteed payback window of less than 4.2 months.",
        bold_prefix="Economic & Payback Constraint: "
    )
    add_bullet_p(
        doc,
        "Physical installation on the grinding floor cannot disrupt production. Mill liner change-outs occur once every 4 to 6 months during a strict "
        "72-hour plant turnaround window. All physical microphone brackets, cabling runs, junction boxes, and calibration testing must be completed, "
        "commissioned, and verified within this 72-hour window.",
        bold_prefix="Time-Related Commissioning Constraint: "
    )

    # =========================================================================
    # SECTION 6: VALIDATE REQUIREMENT COMPLETENESS AND CONSISTENCY (Rubric: 10% - 5 Marks)
    # =========================================================================
    add_heading_1(doc, "6. Validate Requirement Completeness and Consistency")

    # 6.1 Stakeholder Requirement Verification
    add_heading_2(doc, "6.1 Verification of Stakeholder Requirements Coverage")
    add_body_p(
        doc,
        "To ensure that all stakeholder expectations are fully met without omission, a Requirements Traceability Matrix (RTM) was constructed. "
        "Every identified stakeholder role, operational objective, functional requirement, and non-functional quality attribute is cross-verified "
        "with concrete acceptance criteria and testing methodologies:"
    )

    rtm_headers = ["Stakeholder Role", "Operational Need & Problem Addressed", "Mapped Req ID", "Non-Functional SLA", "Verification & Acceptance Method"]
    rtm_widths = [1.3, 1.8, 1.2, 1.3, 1.6]
    rtm_data = [
        ["Control Room Operator", "Eliminate cognitive fatigue; prevent unexpected mill chute overloads.", "FR-05, FR-07, FR-09", "NFR-02 (HMI < 500ms), NFR-05 (ISA-101)", "Synthetic overload stress injection; operator usability audit."],
        ["Control Room Operator", "Seamless manual override without process bumps or conveyor surges.", "FR-10, FR-08", "NFR-08 (Bump-less transfer)", "Live bump-less transfer toggle test on running DCS simulator."],
        ["Metallurgical Engineer", "Maximize grinding throughput (TPH); maintain target P80 slurry sizing.", "FR-05, FR-06, FR-07", "NFR-01 (Inference < 150ms)", "30-day continuous metallurgical yield and sizing comparison."],
        ["Metallurgical Engineer", "Audit specific power consumption (kWh/t) across operating shifts.", "FR-13, FR-14", "NFR-03 (99.95% Availability)", "Automated SQL reconciliation test against plant energy meters."],
        ["Reliability Engineer", "Detect liner bolt loosening and cracked lifters before catastrophic shearing.", "FR-11, FR-12", "NFR-01 (High-freq sampling)", "Acoustic transient pulse injection and angular vibration audit."],
        ["Automation Technician", "Standardized fieldbus integration; robust sensor health diagnostics.", "FR-01, FR-02, FR-16", "NFR-04 (IEC 62443), NFR-08 (Watchdog)", "Acoustic cable disconnect test; watchdog relay trip drop-out."],
        ["Plant Safety Officer", "Eliminate confined-space chute unblocking entries; ensure fail-safe trip.", "FR-08, FR-16", "NFR-08 (Trip < 500ms)", "Safety interlock trip test; zero unblocking entry incident audit."],
        ["Plant General Manager", "Reduce power costs by 3-5%; achieve CapEx payback within 6 months.", "FR-07, FR-14", "NFR-03 (Continuous operation)", "Quarterly power tariff reconciliation; verified CapEx payback audit."]
    ]
    tbl_rtm = doc.add_table(rows=1, cols=len(rtm_headers))
    format_black_lined_table(tbl_rtm, rtm_widths, rtm_headers, rtm_data, data_font_size=Pt(8.5))

    add_body_p(
        doc,
        "Traceability Audit Conclusion: The matrix demonstrates 100% requirements closure. No stakeholder operational requirement is left orphaned, "
        "and every functional requirement is directly tied to a measurable non-functional constraint and empirical verification procedure."
    )

    # 6.2 Check for Ambiguity, Redundancy, Inconsistency, and Missing Requirements
    add_heading_2(doc, "6.2 Requirement Defect Review & Consistency Verification")
    add_body_p(
        doc,
        "A rigorous requirements quality audit was conducted to identify and remediate potential defects in requirement formulation across "
        "four primary defect classes: ambiguity, redundancy, inconsistency, and missing requirements:"
    )

    qa_headers = ["Defect Category", "Initial Defective Formulation", "Identified Quality Hazard", "Remediated Engineering Specification"]
    qa_widths = [1.2, 1.8, 1.8, 2.4]
    qa_data = [
        ["Ambiguity", "'The system shall detect mill overloads quickly and warn operators.'", "Subjective word 'quickly' is untestable; lacks defined threshold, latency, and alarm protocol.", "Remediated in FR-05 & NFR-01: 'The system shall classify volumetric mill load every 100 ms with edge inference latency ≤ 150 ms and issue visual/audible alarms within ≤ 500 ms when Load Index exceeds 0.75.'"],
        ["Ambiguity", "'The acoustic sensors must withstand normal plant conditions.'", "Undefined environmental parameters; risks hardware failure in harsh mining bays.", "Remediated in NFR-03 & Section 4.8: 'Sensors shall feature IP67 ingress protection, operate across -10°C to +55°C, and withstand ambient noise levels up to 115 dBA.'"],
        ["Redundancy", "FR-01 (Ingestion) and FR-03 (DSP) both specified independent Fast Fourier Transforms.", "Duplicating 2048-pt FFT across two modules causes CPU resource contention and race conditions.", "Remediated: FR-01 exclusively manages DMA circular buffering; FR-03 centralizes all spectral transforms, publishing shared vectors via zero-copy shared memory."],
        ["Redundancy", "Dual logging of alarm events in both SCADA local files and TimescaleDB.", "Wastes disk I/O and creates split-brain discrepancies during maintenance audits.", "Remediated: Consolidated all alarm persistence into PostgreSQL AnomalyAlarmRegistry with automated asynchronous replication to enterprise PIMS."],
        ["Inconsistency", "NFR-01 mandated 150 ms inference, while FR-07 allowed a 5000 ms solver timeout for MPC.", "A 5-second control timeout blocks real-time audio threads, causing acoustic buffer overflows.", "Remediated: Decoupled high-frequency DSP/ML thread (100 ms periodic) from the MPC supervisory solver thread (1.0 s periodic) with non-blocking queues."],
        ["Inconsistency", "FR-08 specified setpoint clamps of 300-650 TPH, while DCS driver allowed 0-800 TPH.", "Mismatched boundary conditions could cause DCS write rejections or uncontrolled conveyor surge.", "Remediated: Synchronized boundary configuration across edge IPC and DCS tag limits with strict clamping at 300 TPH minimum and 650 TPH maximum."],
        ["Missing Edge Case", "No specification for handling broken or disconnected microphone cables.", "Zero signal amplitude would be misclassified by ML as extreme slurry pooling, causing false trips.", "Remediated: Added FR-02 (Sensor Health Watchdog): Signal power below 12 dB SNR for > 2s triggers SENSOR_FAULT, inhibits auto-tuning, and reverts to DCS baseline."],
        ["Missing Edge Case", "No mechanism specified for smooth manual-to-auto mode transitions.", "Sudden step setpoint changes during mode transfer cause conveyor motor trips and belt spills.", "Remediated: Added FR-10 (Bump-less Transfer): Supervisory controller pre-loads running DCS setpoints before engaging, applying a ramp rate limiter (max ±10 TPH/min)."]
    ]
    tbl_qa = doc.add_table(rows=1, cols=len(qa_headers))
    format_black_lined_table(tbl_qa, qa_widths, qa_headers, qa_data, data_font_size=Pt(8.5))

    # 6.3 Suggest Improvements to Enhance Quality and Completeness
    add_heading_2(doc, "6.3 Strategic Quality Improvements & Future Technical Roadmap")
    add_body_p(
        doc,
        "To ensure continuous improvement, architectural robustness, and long-term technological competitiveness, the following strategic "
        "enhancements are recommended for inclusion in future iterations of the specification:"
    )
    add_bullet_p(
        doc,
        "Couple Discrete Element Method (DEM) rock-ball dynamic simulations with Finite Element Method (FEM) acoustic radiation modeling. "
        "This co-simulation generates high-fidelity synthetic acoustic waveforms for extreme comminution states (such as rare liner bolt shears and severe "
        "choked overloads), substantially reducing the duration of physical data collection required to train edge ML models.",
        bold_prefix="1. Physics-Informed Digital Twin Acoustic Co-Simulation: "
    )
    add_bullet_p(
        doc,
        "Upgrade single-point directional microphones to a 16-element MEMS phased microphone array. Employing delay-and-sum beamforming algorithms "
        "allows the software to spatially focus acoustic listening exclusively onto the mill shell toe impact zone (angular quadrant 120°–160°), "
        "spatially rejecting high-amplitude noise originating from neighboring slurry discharge pumps, trunnion lubrication units, and secondary ball mills.",
        bold_prefix="2. Phased Acoustic Beamforming Microphone Arrays: "
    )
    add_bullet_p(
        doc,
        "Implement a privacy-preserving federated edge learning framework across multiple mining operations. This allows localized edge IPCs to train "
        "improved neural network weights on unique ore hardness regimes and share model weight gradients with a centralized repository without exposing "
        "confidential site-specific production volumes or ore grade data.",
        bold_prefix="3. Multi-Site Cross-Concentrator Federated Edge Learning: "
    )
    add_bullet_p(
        doc,
        "Expand the Model Predictive Control (MPC) boundary beyond conveyor feed tonnage to simultaneously modulate mill rotational speed "
        "(Variable Speed Drive RPM) and pulp density (water addition). Co-optimizing mill rotational speed with feed tonnage expands the optimal grinding "
        "window, capturing an additional 2.0% to 3.5% reduction in specific electrical power consumption.",
        bold_prefix="4. Coordinated Multi-Variable Speed (RPM) and Water-Solids Optimization: "
    )
    add_bullet_p(
        doc,
        "Integrate a calibrated piezoelectric acoustic emitter mounted adjacent to the microphone bracket. Emitting an automated 5 kHz synthetic pulse "
        "once per shift verifies acoustic path transmission, diaphragm cleanliness, and frequency response without requiring physical entry by technicians "
        "into the hazardous grinding area.",
        bold_prefix="5. Automated Closed-Loop Acoustic Calibration via Synthetic Sound Pulse: "
    )

    # Save document
    print(f"Saving comprehensive document to: {output_path}...")
    doc.save(output_path)
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Document successfully created! File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    build_full_document()

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle

def create_architecture_diagram(output_path="assessment&activity/CO2-AT2/media/architecture_diagram.png"):
    fig, ax = plt.subplots(figsize=(22, 16), dpi=300)
    ax.set_xlim(-1, 23)
    ax.set_ylim(-1, 17)
    ax.axis('off')

    # Background canvas
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # =========================================================================
    # HEADER BANNER
    # =========================================================================
    hdr_box = FancyBboxPatch((0.5, 15.3), 21.0, 1.3,
                             boxstyle="round,pad=0.1,rounding_size=0.15",
                             fc="#0F172A", ec="#020617", lw=1.5, zorder=5)
    ax.add_patch(hdr_box)
    ax.text(11.0, 16.15, "SOFTWARE ARCHITECTURE DIAGRAM: ACOUSTIMILL AI PLATFORM",
            ha='center', va='center', fontsize=16, fontweight='bold', color="#FFFFFF")
    ax.text(11.0, 15.65, "Multi-Tier Edge-Computing & Event-Driven Hybrid Architecture for Real-Time Mineral Grinding Optimization (ISA-95 Aligned)",
            ha='center', va='center', fontsize=11, color="#94A3B8")

    # =========================================================================
    # HELPER FUNCTIONS FOR BOXES & CONNECTORS
    # =========================================================================
    def draw_subsystem_box(x, y, w, h, title, subtitle, items, bg_col, border_col, title_col="#0F172A"):
        box = FancyBboxPatch((x, y), w, h,
                             boxstyle="round,pad=0.08,rounding_size=0.12",
                             fc=bg_col, ec=border_col, lw=1.8, zorder=3)
        ax.add_patch(box)
        # Header bar inside box
        hdr_bar = FancyBboxPatch((x, y + h - 0.55), w, 0.55,
                                 boxstyle="round,pad=0.04,rounding_size=0.08",
                                 fc=border_col, ec=border_col, lw=1, zorder=4)
        ax.add_patch(hdr_bar)
        ax.text(x + w / 2, y + h - 0.28, title, ha='center', va='center',
                fontsize=10.5, fontweight='bold', color="#FFFFFF", zorder=5)
        
        # Subtitle / Protocol line
        if subtitle:
            ax.text(x + w / 2, y + h - 0.82, subtitle, ha='center', va='center',
                    fontsize=8.5, fontweight='bold', color=title_col, zorder=5)
            start_y = y + h - 1.15
        else:
            start_y = y + h - 0.85

        # Items list
        curr_y = start_y
        for itm in items:
            ax.text(x + 0.2, curr_y, f"• {itm}", ha='left', va='center',
                    fontsize=8.0, color="#1E293B", zorder=5)
            curr_y -= 0.32

    def draw_layer_container(x, y, w, h, tier_code, tier_title, standard_tag, bg_col, border_col):
        container = FancyBboxPatch((x, y), w, h,
                                   boxstyle="round,pad=0.12,rounding_size=0.2",
                                   fc=bg_col, ec=border_col, lw=2.2, linestyle='--', zorder=1)
        ax.add_patch(container)
        # Tier Title Tag
        tag_box = FancyBboxPatch((x + 0.3, y + h - 0.45), 6.5, 0.65,
                                 boxstyle="round,pad=0.05,rounding_size=0.08",
                                 fc=border_col, ec=border_col, lw=1, zorder=2)
        ax.add_patch(tag_box)
        ax.text(x + 0.5, y + h - 0.15, tier_code, ha='left', va='center',
                fontsize=9.5, fontweight='bold', color="#FFFFFF", zorder=3)
        ax.text(x + 2.4, y + h - 0.15, f"| {tier_title}", ha='left', va='center',
                fontsize=9.0, fontweight='bold', color="#F1F5F9", zorder=3)
        ax.text(x + w - 0.4, y + h - 0.2, standard_tag, ha='right', va='center',
                fontsize=8.5, fontstyle='italic', fontweight='bold', color=border_col, zorder=2)

    # =========================================================================
    # TIER 4: ENTERPRISE IT & CLOUD ANALYTICS LAYER (Purdue Level 4/5)
    # y range: 11.4 to 14.9 (height: 3.5)
    # =========================================================================
    draw_layer_container(0.5, 11.5, 21.0, 3.4,
                         "TIER 4: ENTERPRISE & CLOUD",
                         "Enterprise Cloud & Fleet Analytics Tier",
                         "ISA-95 Level 4/5  |  Off-Premises Multi-Region Cloud / IT Backbone",
                         "#F8FAFC", "#4338CA")

    # Cloud Subsystems (4 boxes)
    draw_subsystem_box(1.0, 11.8, 4.6, 2.5,
                       "Enterprise API & Security Gateway",
                       "OAuth2 / OIDC | TLS 1.3 | WAF",
                       ["Kong / Envoy API Gateway Proxy",
                        "Role-Based Access Control (RBAC)",
                        "mTLS Certificate Validation",
                        "Audit Log & Tamper-Proof Vault"],
                       "#EEF2FF", "#4338CA")

    draw_subsystem_box(6.0, 11.8, 4.6, 2.5,
                       "Continuous MLOps Retraining",
                       "PyTorch | MLflow | ONNX Registry",
                       ["Active Learning Drift Detector",
                        "Acoustic Audio Signature Clustering",
                        "Automated Model Validation CI/CD",
                        "Over-The-Air (OTA) Edge Model Push"],
                       "#EEF2FF", "#4338CA")

    draw_subsystem_box(11.0, 11.8, 4.6, 2.5,
                       "Acoustic Digital Twin & Diagnostics",
                       "Physics-Informed ML | Ray / Spark",
                       ["3D Grinding Shell FEM Dynamic Twin",
                        "Liner Wear Rate & Lifter Erosion Model",
                        "Trunnion Bearing Fatigue Life Estimator",
                        "Fleet-Wide Benchmarking Analytics"],
                       "#EEF2FF", "#4338CA")

    draw_subsystem_box(16.0, 11.8, 5.0, 2.5,
                       "Enterprise ERP & PIMS Bridge",
                       "SAP S/4HANA | OSIsoft PI | REST",
                       ["Shift Energy Tariff Tracker (MWh/t)",
                        "Metal Recovery & Tonnage Reconciliation",
                        "Plant Historian Re-Sync Connector",
                        "Autonomous Relining Work Order Trigger"],
                       "#EEF2FF", "#4338CA")

    # =========================================================================
    # TIER 3: PLANT OPERATIONS & SUPERVISORY CONTROL (Purdue Level 3)
    # y range: 7.7 to 11.1 (height: 3.4)
    # =========================================================================
    draw_layer_container(0.5, 7.7, 21.0, 3.4,
                         "TIER 3: PLANT OPERATIONS",
                         "Supervisory SCADA & Plant Historian Tier",
                         "ISA-95 Level 3  |  Plant Control Room OT Network (1 Gbps Isolated LAN)",
                         "#F0FDFA", "#0F766E")

    draw_subsystem_box(1.0, 8.0, 4.6, 2.5,
                       "Plant Distributed Control System",
                       "Siemens PCS7 / ControlLogix / DeltaV",
                       ["Deterministic Plant Master Logic",
                        "Conveyor Feed & Water PID Controllers",
                        "Watchdog Interlock De-energize Trip",
                        "Native Fallback Setpoint Table"],
                       "#CCFBF1", "#0F766E")

    draw_subsystem_box(6.0, 8.0, 4.6, 2.5,
                       "High-Performance Operator HMI",
                       "ISA-101 Ergonomic | WebSockets 60 FPS",
                       ["Live Acoustic Spectrogram Waterfall",
                        "Volumetric Load Index Dial (0-100%)",
                        "Bumpless Auto / Advisory / Manual Mode",
                        "Critical Mill Overload Early Warning"],
                       "#CCFBF1", "#0F766E")

    draw_subsystem_box(11.0, 8.0, 4.6, 2.5,
                       "Plant Message & Event Streaming",
                       "Apache Kafka / MQTT | Avro Schema",
                       ["Telemetry Topic: mill.telemetry.raw",
                        "Control Topic: mill.setpoints.advisory",
                        "Alarm Topic: mill.alarms.critical",
                        "MirrorMaker 2.0 to Enterprise Cloud"],
                       "#CCFBF1", "#0F766E")

    draw_subsystem_box(16.0, 8.0, 5.0, 2.5,
                       "Plant Operational Historian",
                       "TimescaleDB / InfluxDB Cluster",
                       ["Continuous 1-Second Telemetry Ingest",
                        "Multi-Gigabyte Daily Acoustic Rollups",
                        "90-Day Rolling On-Site Retention",
                        "Shift OEE & Specific Energy (kWh/t) DB"],
                       "#CCFBF1", "#0F766E")

    # =========================================================================
    # TIER 2: REAL-TIME EDGE COMPUTING & CLOSED-LOOP CONTROL (Purdue Level 2)
    # y range: 3.9 to 7.3 (height: 3.4)
    # =========================================================================
    draw_layer_container(0.5, 3.9, 21.0, 3.4,
                         "TIER 2: REAL-TIME DETERMINISTIC EDGE",
                         "Autonomous Edge IPC Tier (Sub-150ms Deterministic Execution)",
                         "ISA-95 Level 2  |  Fanless IP67 Dual-Redundant Edge Controller",
                         "#EFF6FF", "#1D4ED8")

    draw_subsystem_box(1.0, 4.2, 3.8, 2.5,
                       "Acoustic Ingestion & Ring Buffer",
                       "ALSA / ASIO DMA | C++ Shared Memory",
                       ["48 kHz 24-bit Multi-Channel Audio",
                        "Zero-Copy Circular POSIX Ring Buffers",
                        "Acoustic Clipping & Drift Watchdog",
                        "Sensor Health & SNR Validator"],
                       "#DBEAFE", "#1D4ED8")

    draw_subsystem_box(5.2, 4.2, 3.8, 2.5,
                       "Real-Time DSP Spectral Engine",
                       "FFTW3 | Chebyshev Bandpass 0.5-12 kHz",
                       ["2048-pt FFT Spectral Decomposition",
                        "Toe Impact Resonance Isolator",
                        "Mel-Frequency Filterbank Extraction",
                        "Wavelet Transient Impact Detector"],
                       "#DBEAFE", "#1D4ED8")

    draw_subsystem_box(9.4, 4.2, 4.0, 2.5,
                       "Real-Time Edge ML Inference",
                       "ONNX Runtime | TensorRT Accelerated",
                       ["1D-CNN + LightGBM Ensemble",
                        "Load Regime: Under / Optimal / Overload",
                        "Slurry Pool Depth Estimator (0-100%)",
                        "Liner Impact Severity & Wear Scorer"],
                       "#DBEAFE", "#1D4ED8")

    draw_subsystem_box(13.8, 4.2, 3.8, 2.5,
                       "Model Predictive Control (MPC)",
                       "Constrained QP Optimizer | C++ Core",
                       ["Optimal Feed Rate (TPH) Generator",
                        "Dynamic Water Ratio Calculator",
                        "Metallurgical Safety Clamping (±10 TPH)",
                        "Anti-Windup & Slurry Slump Avoidance"],
                       "#DBEAFE", "#1D4ED8")

    draw_subsystem_box(18.0, 4.2, 3.0, 2.5,
                       "Edge Gateway & Cache",
                       "Redis | OPC-UA Server",
                       ["In-Memory Live State Cache",
                        "Local SQLite 72h Retention",
                        "OPC-UA / Modbus TCP Server",
                        "Heartbeat Pulse (1000ms)"],
                       "#DBEAFE", "#1D4ED8")

    # =========================================================================
    # TIER 1: FIELD INSTRUMENTATION & PHYSICAL ACTUATION (Purdue Level 0/1)
    # y range: 0.1 to 3.5 (height: 3.4)
    # =========================================================================
    draw_layer_container(0.5, 0.1, 21.0, 3.4,
                         "TIER 1: PHYSICAL FIELD INSTRUMENTATION",
                         "Sensors, Grinding Machinery & Physical Actuators",
                         "ISA-95 Level 0/1  |  Physical Plant Grinding Floor & Slurry Circuit",
                         "#FFF7ED", "#C2410C")

    draw_subsystem_box(1.0, 0.4, 4.6, 2.5,
                       "Acoustic Sensor Microphone Array",
                       "IP67 Directional Piezo / Condenser Mics",
                       ["Sensor 1: Shell Toe Impact Zone (Heavy Breakage)",
                        "Sensor 2: Shoulder Cataracting Zone (Ball Flight)",
                        "Sensor 3: Slurry Discharge Pool (Low Freq Damper)",
                        "High-SPL Armored Cabling with 24-bit ADC DAQ"],
                       "#FFEDD5", "#C2410C")

    draw_subsystem_box(6.0, 0.4, 4.6, 2.5,
                       "Mill Machinery & Auxiliary Telemetry",
                       "Vibration Accelerometers & RTD Probes",
                       ["Drive Motor Current Sensors (CTs, Amperes)",
                        "Trunnion Bearing Temperature RTD Probes",
                        "Bearing Vibration Accelerometers (4-20mA)",
                        "Ore Weightometer Load Cells on Feed Conveyor"],
                       "#FFEDD5", "#C2410C")

    draw_subsystem_box(11.0, 0.4, 4.6, 2.5,
                       "Physical Mill Actuators & Drives",
                       "VFD Drives & Electro-Pneumatic Valves",
                       ["Variable Speed Rock Feed Conveyor Motor (VFD)",
                        "Slurry Water Injection Control Valve (4-20mA)",
                        "Grinding Circuit Cyclone Feed Slurry Pump",
                        "Mill Variable Speed Ring Gear Drive (RPM)"],
                       "#FFEDD5", "#C2410C")

    draw_subsystem_box(16.0, 0.4, 5.0, 2.5,
                       "Fail-Safe Hardware Interlock Watchdog",
                       "Electromechanical De-Energize Relay",
                       ["Series Interlock in DCS Conveyor Permissive Circuit",
                        "De-energizes within <200ms if Heartbeat Lost",
                        "Guarantees Autonomous Bumpless DCS Revert",
                        "Zero Software Overrule for Plant Personnel Safety"],
                       "#FFEDD5", "#C2410C")

    # =========================================================================
    # VERTICAL DATA FLOW ARROWS & CALLOUT LABELS
    # =========================================================================
    # Arrow 1: Tier 1 to Tier 2 (Acoustic Ingestion)
    ax.annotate('', xy=(2.8, 4.2), xytext=(2.8, 2.9),
                arrowprops=dict(arrowstyle="-|>", color="#1D4ED8", lw=2.5, mutation_scale=15),
                zorder=10)
    ax.text(3.0, 3.55, "48 kHz 24-bit Audio\n(ALSA DMA Streaming)",
            ha='left', va='center', fontsize=8.0, fontweight='bold', color="#1D4ED8",
            bbox=dict(boxstyle="square,pad=0.2", fc="#FFFFFF", ec="#1D4ED8", lw=1))

    # Arrow 2: Tier 1 to Tier 2 / 3 (Auxiliary Sensor Telemetry)
    ax.annotate('', xy=(8.3, 4.2), xytext=(8.3, 2.9),
                arrowprops=dict(arrowstyle="-|>", color="#0F766E", lw=2.5, mutation_scale=15),
                zorder=10)
    ax.text(8.5, 3.55, "Current, Temp & Weight\n(Modbus TCP / 4-20mA)",
            ha='left', va='center', fontsize=8.0, fontweight='bold', color="#0F766E",
            bbox=dict(boxstyle="square,pad=0.2", fc="#FFFFFF", ec="#0F766E", lw=1))

    # Horizontal Flow inside Tier 2 (Deterministic Pipeline)
    # Ingestion -> DSP
    ax.annotate('', xy=(5.2, 5.45), xytext=(4.8, 5.45),
                arrowprops=dict(arrowstyle="-|>", color="#1D4ED8", lw=2.0, mutation_scale=12),
                zorder=10)
    # DSP -> ML
    ax.annotate('', xy=(9.4, 5.45), xytext=(9.0, 5.45),
                arrowprops=dict(arrowstyle="-|>", color="#1D4ED8", lw=2.0, mutation_scale=12),
                zorder=10)
    # ML -> MPC
    ax.annotate('', xy=(13.8, 5.45), xytext=(13.4, 5.45),
                arrowprops=dict(arrowstyle="-|>", color="#1D4ED8", lw=2.0, mutation_scale=12),
                zorder=10)
    # MPC -> Gateway
    ax.annotate('', xy=(18.0, 5.45), xytext=(17.6, 5.45),
                arrowprops=dict(arrowstyle="-|>", color="#1D4ED8", lw=2.0, mutation_scale=12),
                zorder=10)

    # Arrow 3: Closed-Loop Control from Tier 2 MPC to Tier 3 DCS
    ax.annotate('', xy=(3.3, 8.0), xytext=(15.7, 6.7),
                arrowprops=dict(arrowstyle="-|>", color="#DC2626", lw=2.8, linestyle='-', mutation_scale=18),
                zorder=10)
    ax.text(9.5, 7.5, "Closed-Loop Advisory Setpoints: Feed (TPH) & Water Ratio (OPC-UA Client/Server, <100ms)",
            ha='center', va='center', fontsize=8.5, fontweight='bold', color="#DC2626",
            bbox=dict(boxstyle="round,pad=0.3", fc="#FEF2F2", ec="#DC2626", lw=1.5), zorder=11)

    # Arrow 4: Tier 3 DCS to Tier 1 Actuators (Physical Actuation)
    ax.annotate('', xy=(13.3, 2.9), xytext=(3.3, 8.0),
                arrowprops=dict(arrowstyle="-|>", color="#DC2626", lw=2.5, linestyle='-', mutation_scale=15),
                zorder=10)
    ax.text(6.8, 2.7, "VFD Conveyor Speed & Water Valve Signals (4-20mA / Fieldbus)",
            ha='center', va='center', fontsize=8.0, fontweight='bold', color="#B91C1C",
            bbox=dict(boxstyle="square,pad=0.2", fc="#FFFFFF", ec="#B91C1C", lw=1), zorder=11)

    # Arrow 5: Watchdog Heartbeat pulse from Edge to Tier 1 Relay
    ax.annotate('', xy=(18.5, 2.9), xytext=(19.5, 4.2),
                arrowprops=dict(arrowstyle="-|>", color="#D97706", lw=2.5, linestyle='--', mutation_scale=15),
                zorder=10)
    ax.text(20.3, 3.55, "1000ms Heartbeat\n(Fail-Safe Pulse)",
            ha='center', va='center', fontsize=8.0, fontweight='bold', color="#D97706",
            bbox=dict(boxstyle="square,pad=0.2", fc="#FFFFFF", ec="#D97706", lw=1))

    # Arrow 6: Tier 2 Edge Gateway to Tier 3 Message Broker / Historian
    ax.annotate('', xy=(13.3, 8.0), xytext=(19.0, 6.7),
                arrowprops=dict(arrowstyle="-|>", color="#0F766E", lw=2.5, mutation_scale=15),
                zorder=10)
    ax.text(16.5, 7.35, "1s Telemetry & FFT Spectra (Kafka / MQTT)",
            ha='center', va='center', fontsize=8.0, fontweight='bold', color="#0F766E",
            bbox=dict(boxstyle="square,pad=0.2", fc="#FFFFFF", ec="#0F766E", lw=1), zorder=11)

    # Arrow 7: Tier 3 Message Broker to Tier 3 SCADA HMI
    ax.annotate('', xy=(8.3, 8.0), xytext=(11.0, 9.2),
                arrowprops=dict(arrowstyle="-|>", color="#0F766E", lw=2.2, mutation_scale=14),
                zorder=10)
    ax.text(9.5, 8.6, "WebSockets / WSS (60 FPS)",
            ha='center', va='center', fontsize=8.0, fontweight='bold', color="#0F766E",
            bbox=dict(boxstyle="square,pad=0.2", fc="#FFFFFF", ec="#0F766E", lw=1), zorder=11)

    # Arrow 8: Tier 3 to Tier 4 Enterprise (MirrorMaker / HTTPS IPSec VPN)
    ax.annotate('', xy=(3.3, 11.8), xytext=(13.3, 10.5),
                arrowprops=dict(arrowstyle="-|>", color="#4338CA", lw=2.5, mutation_scale=16),
                zorder=10)
    ax.text(8.3, 11.3, "Encrypted Telemetry Replication (IPSec VPN | TLS 1.3 Kafka MirrorMaker / REST)",
            ha='center', va='center', fontsize=8.5, fontweight='bold', color="#4338CA",
            bbox=dict(boxstyle="round,pad=0.3", fc="#EEF2FF", ec="#4338CA", lw=1.2), zorder=11)

    # Arrow 9: Tier 4 MLOps down to Tier 2 Edge (Model Distribution)
    ax.annotate('', xy=(11.4, 6.7), xytext=(8.3, 11.8),
                arrowprops=dict(arrowstyle="-|>", color="#7C3AED", lw=2.5, linestyle='-.', mutation_scale=16),
                zorder=10)
    ax.text(9.8, 10.0, "OTA Validated ONNX Model Updates (Signed gRPC / TLS, Shift Intervals)",
            ha='center', va='center', fontsize=8.0, fontweight='bold', color="#7C3AED",
            bbox=dict(boxstyle="round,pad=0.2", fc="#F5F3FF", ec="#7C3AED", lw=1), zorder=11)

    # =========================================================================
    # ARCHITECTURE LEGEND BOX
    # =========================================================================
    leg_box = FancyBboxPatch((0.5, -0.9), 21.0, 0.85,
                             boxstyle="round,pad=0.08,rounding_size=0.1",
                             fc="#0F172A", ec="#020617", lw=1.2, zorder=5)
    ax.add_patch(leg_box)
    ax.text(1.2, -0.48, "LEGEND & PROTOCOL CALLOUTS:",
            ha='left', va='center', fontsize=9.0, fontweight='bold', color="#F8FAFC")

    # Legend Item 1: Closed-Loop Control Path
    ax.plot([4.8, 5.5], [-0.48, -0.48], color="#DC2626", lw=3.0, zorder=6)
    ax.text(5.7, -0.48, "Closed-Loop Control (OPC-UA / 4-20mA)",
            ha='left', va='center', fontsize=8.0, color="#F1F5F9", zorder=6)

    # Legend Item 2: Real-Time Telemetry Stream
    ax.plot([9.5, 10.2], [-0.48, -0.48], color="#1D4ED8", lw=3.0, zorder=6)
    ax.text(10.4, -0.48, "High-Speed Acoustic Telemetry (ALSA / IPC)",
            ha='left', va='center', fontsize=8.0, color="#F1F5F9", zorder=6)

    # Legend Item 3: Operational Event Bus
    ax.plot([14.5, 15.2], [-0.48, -0.48], color="#0F766E", lw=3.0, zorder=6)
    ax.text(15.4, -0.48, "Event Broker (Kafka / MQTT / WSS)",
            ha='left', va='center', fontsize=8.0, color="#F1F5F9", zorder=6)

    # Legend Item 4: Fail-Safe Safety Circuit
    ax.plot([18.8, 19.5], [-0.48, -0.48], color="#D97706", lw=2.5, linestyle='--', zorder=6)
    ax.text(19.7, -0.48, "Fail-Safe Heartbeat Interlock",
            ha='left', va='center', fontsize=8.0, color="#F1F5F9", zorder=6)

    plt.tight_layout()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='#FFFFFF')
    plt.close()
    print(f"Architecture diagram generated successfully at: {output_path}")

if __name__ == '__main__':
    create_architecture_diagram()

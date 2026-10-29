import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Ellipse
import numpy as np

def draw_stick_figure(ax, x, y, label, role_type="human", color="#1E3A8A"):
    """Draw a professional UML actor stick figure or hardware node."""
    if role_type == "human":
        # Head
        head = plt.Circle((x, y + 0.35), 0.12, fill=True, color=color, ec=color, lw=1.5, zorder=5)
        ax.add_patch(head)
        # Body
        ax.plot([x, x], [y + 0.23, y - 0.12], color=color, lw=2, zorder=5)
        # Arms
        ax.plot([x - 0.22, x + 0.22], [y + 0.12, y + 0.12], color=color, lw=2, zorder=5)
        # Legs
        ax.plot([x, x - 0.18], [y - 0.12, y - 0.42], color=color, lw=2, zorder=5)
        ax.plot([x, x + 0.18], [y - 0.12, y - 0.42], color=color, lw=2, zorder=5)
        # Label
        ax.text(x, y - 0.62, label, ha='center', va='top', fontsize=9, fontweight='bold',
                color="#0F172A", wrap=True, zorder=6)
    else:
        # Hardware / External System Box
        box = FancyBboxPatch((x - 0.45, y - 0.28), 0.9, 0.56,
                             boxstyle="round,pad=0.08,rounding_size=0.08",
                             fc="#F8FAFC", ec=color, lw=2, zorder=5)
        ax.add_patch(box)
        # Stereotype
        ax.text(x, y + 0.12, "«system»", ha='center', va='center', fontsize=7.5,
                fontstyle='italic', color="#64748B", zorder=6)
        # Label inside box
        ax.text(x, y - 0.08, label, ha='center', va='center', fontsize=8.5, fontweight='bold',
                color="#0F172A", wrap=True, zorder=6)

def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(19, 13), dpi=300)
    ax.set_xlim(-2.5, 17.5)
    ax.set_ylim(-1.5, 12.5)
    ax.axis('off')

    # Background canvas
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # Title Banner
    title_box = FancyBboxPatch((2.2, 11.2), 10.6, 0.9,
                               boxstyle="round,pad=0.1,rounding_size=0.15",
                               fc="#0F2B48", ec="#0B2036", lw=1.5, zorder=4)
    ax.add_patch(title_box)
    ax.text(7.5, 11.65, "UML USE CASE DIAGRAM: ACOUSTIMILL AI PLATFORM",
            ha='center', va='center', fontsize=14, fontweight='bold', color="#FFFFFF")
    ax.text(7.5, 11.35, "Intelligent Mineral Ore Grinding Optimization & Real-Time Acoustic Telemetry System",
            ha='center', va='center', fontsize=9.5, color="#94A3B8")

    # System Boundary (Platform Box)
    sys_box = FancyBboxPatch((1.6, -0.6), 11.8, 11.4,
                             boxstyle="round,pad=0.15,rounding_size=0.25",
                             fc="#F8FAFC", ec="#2563EB", lw=2.2, linestyle='-', zorder=1)
    ax.add_patch(sys_box)
    
    # Boundary Label Header
    ax.text(2.0, 10.45, "System Boundary: AcoustiMill AI Optimization Platform",
            fontsize=11.5, fontweight='bold', color="#1E40AF", zorder=2)

    # Human Actors on Left (x = -1.0)
    actors_left = [
        {"y": 9.8, "name": "Plant Control\nRoom Operator", "type": "human", "color": "#1E3A8A"},
        {"y": 7.8, "name": "Metallurgical /\nProcess Engineer", "type": "human", "color": "#1E3A8A"},
        {"y": 5.8, "name": "Asset Reliability\n& Maintenance Eng.", "type": "human", "color": "#1E3A8A"},
        {"y": 3.8, "name": "Automation &\nInstrumentation Tech", "type": "human", "color": "#1E3A8A"},
        {"y": 1.8, "name": "Plant Safety &\nCompliance Officer", "type": "human", "color": "#1E3A8A"},
        {"y": 0.0, "name": "System\nAdministrator", "type": "human", "color": "#1E3A8A"}
    ]

    for act in actors_left:
        draw_stick_figure(ax, -1.0, act["y"], act["name"], role_type=act["type"], color=act["color"])

    # System / External Actors on Right (x = 15.6)
    actors_right = [
        {"y": 9.2, "name": "Acoustic Sensor\nArray & Edge DAQ", "type": "system", "color": "#0D9488"},
        {"y": 5.8, "name": "Plant DCS / PLC\nAutomation Unit", "type": "system", "color": "#0D9488"},
        {"y": 2.2, "name": "Enterprise ERP /\nPlant PIMS", "type": "system", "color": "#0D9488"}
    ]

    for act in actors_right:
        draw_stick_figure(ax, 15.6, act["y"], act["name"], role_type=act["type"], color=act["color"])

    # Use Cases (Ellipses) inside boundary
    # Format: id: (x, y, width, height, label, color)
    use_cases = {
        "UC-01": (4.5, 9.4, 2.7, 0.95, "UC-01: Ingest Multi-Channel\nAcoustic Telemetry", "#EFF6FF", "#2563EB"),
        "UC-02": (8.8, 9.4, 2.7, 0.95, "UC-02: Preprocess Audio &\nExtract Spectral FFT", "#EFF6FF", "#2563EB"),
        "UC-03": (6.7, 8.0, 2.8, 0.95, "UC-03: Classify Mill Load State\n(Under / Normal / Over)", "#EFF6FF", "#2563EB"),
        "UC-04": (6.7, 6.4, 2.8, 0.95, "UC-04: Calculate Optimal Feed\n& Water Setpoints", "#FEF3C7", "#D97706"),
        "UC-05": (10.6, 6.4, 2.6, 0.92, "UC-05: Manual Feed / Water\nSetpoint Override", "#FEF3C7", "#D97706"),
        "UC-06": (4.2, 7.3, 2.6, 0.92, "UC-06: Monitor Live Mill\nTelemetry & Power Draw", "#EFF6FF", "#2563EB"),
        "UC-07": (4.2, 5.2, 2.6, 0.92, "UC-07: Acknowledge & Triage\nAcoustic Anomaly Alarms", "#FEE2E2", "#DC2626"),
        "UC-08": (9.6, 4.8, 2.7, 0.92, "UC-08: Calibrate Sensor &\nAcoustic Baseline", "#F0FDF4", "#16A34A"),
        "UC-09": (9.8, 2.2, 2.7, 0.92, "UC-09: Generate Metallurgical\nOEE & Energy Reports", "#F1F5F9", "#475569"),
        "UC-10": (9.6, 3.5, 2.7, 0.92, "UC-10: Retrain & Validate\nMill State ML Models", "#EFF6FF", "#2563EB"),
        "UC-11": (5.0, 0.5, 2.7, 0.92, "UC-11: Manage User Access\n& RBAC Permissions", "#F1F5F9", "#475569"),
        "UC-12": (5.0, 3.6, 2.7, 0.95, "UC-12: Execute Safety Interlock\n& Trip Notification", "#FEE2E2", "#DC2626")
    }

    # Draw Use Case Ellipses
    for ucid, (ux, uy, uw, uh, ulabel, ubg, uborder) in use_cases.items():
        ellipse = Ellipse((ux, uy), uw, uh, facecolor=ubg, edgecolor=uborder, lw=1.8, zorder=3)
        ax.add_patch(ellipse)
        ax.text(ux, uy, ulabel, ha='center', va='center', fontsize=8.2, fontweight='bold',
                color="#0F172A", zorder=4)

    # Actor Associations (Solid Lines)
    # Human Left Associations:
    def connect_actor_uc(x1, y1, x2, y2, color="#334155", lw=1.1, ls='-'):
        ax.plot([x1, x2], [y1, y2], color=color, lw=lw, linestyle=ls, zorder=2)

    # Control Room Operator (-0.8, 9.8) -> UC-06, UC-05, UC-07
    connect_actor_uc(-0.7, 9.8, 3.0, 7.5)  # to UC-06
    connect_actor_uc(-0.7, 9.8, 9.3, 6.7)  # to UC-05
    connect_actor_uc(-0.7, 9.8, 2.9, 5.4)  # to UC-07

    # Metallurgical Engineer (-0.7, 7.8) -> UC-06, UC-04, UC-09, UC-10
    connect_actor_uc(-0.7, 7.8, 2.9, 7.4)  # to UC-06
    connect_actor_uc(-0.7, 7.8, 5.3, 6.5)  # to UC-04
    connect_actor_uc(-0.7, 7.8, 8.5, 2.4)  # to UC-09
    connect_actor_uc(-0.7, 7.8, 8.3, 3.6)  # to UC-10

    # Maintenance Engineer (-0.7, 5.8) -> UC-06, UC-07, UC-08
    connect_actor_uc(-0.7, 5.8, 3.0, 7.2)  # to UC-06
    connect_actor_uc(-0.7, 5.8, 2.9, 5.3)  # to UC-07
    connect_actor_uc(-0.7, 5.8, 8.3, 4.9)  # to UC-08

    # Automation Specialist (-0.7, 3.8) -> UC-01, UC-08, UC-12
    connect_actor_uc(-0.7, 3.8, 3.2, 9.2)  # to UC-01
    connect_actor_uc(-0.7, 3.8, 8.3, 4.7)  # to UC-08
    connect_actor_uc(-0.7, 3.8, 3.7, 3.7)  # to UC-12

    # Safety Officer (-0.7, 1.8) -> UC-07, UC-12
    connect_actor_uc(-0.7, 1.8, 3.0, 5.0)  # to UC-07
    connect_actor_uc(-0.7, 1.8, 3.7, 3.5)  # to UC-12

    # Administrator (-0.7, 0.0) -> UC-11
    connect_actor_uc(-0.7, 0.0, 3.7, 0.5)  # to UC-11

    # Right Side Actor Connections:
    # Acoustic Sensor Array (15.1, 9.2) -> UC-01
    connect_actor_uc(15.1, 9.2, 5.8, 9.4, color="#0D9488", lw=1.3)

    # Plant DCS / PLC (15.1, 5.8) -> UC-04, UC-12, UC-06
    connect_actor_uc(15.1, 5.8, 8.1, 6.4, color="#0D9488", lw=1.3)
    connect_actor_uc(15.1, 5.8, 6.3, 3.6, color="#0D9488", lw=1.3)
    connect_actor_uc(15.1, 5.8, 5.5, 7.2, color="#0D9488", lw=1.3)

    # Enterprise ERP (15.1, 2.2) -> UC-09
    connect_actor_uc(15.1, 2.2, 11.1, 2.2, color="#0D9488", lw=1.3)

    # UML Relationships («include» and «extend»)
    def draw_uml_relation(ax, x1, y1, x2, y2, rel_type="«include»", text_offset=(0, 0.15)):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#475569", lw=1.4, linestyle="--"),
                    zorder=3)
        mid_x = (x1 + x2) / 2 + text_offset[0]
        mid_y = (y1 + y2) / 2 + text_offset[1]
        ax.text(mid_x, mid_y, rel_type, fontsize=7.5, fontstyle='italic', ha='center',
                va='center', color="#334155", bbox=dict(boxstyle="square,pad=0.1", fc="#FFFFFF", ec="none", alpha=0.9), zorder=5)

    # UC-01 «include» UC-02 (Telemetry ingestion includes preprocessing)
    draw_uml_relation(ax, 5.85, 9.4, 7.45, 9.4, "«include»", (0, 0.18))

    # UC-03 «include» UC-02 (Load classification includes preprocessed features)
    draw_uml_relation(ax, 7.4, 8.4, 8.2, 9.0, "«include»", (0.1, 0.12))

    # UC-04 «include» UC-03 (Optimal setpoints calculation includes load classification)
    draw_uml_relation(ax, 6.7, 6.9, 6.7, 7.5, "«include»", (0.28, 0))

    # UC-05 «extend» UC-04 (Manual override extends automated setpoint calculation)
    draw_uml_relation(ax, 9.3, 6.4, 8.1, 6.4, "«extend»", (0, 0.18))

    # UC-12 «include» UC-04 (Emergency trip directly overrides and clamps setpoints)
    draw_uml_relation(ax, 5.6, 4.1, 6.3, 5.9, "«include»", (-0.35, 0.1))

    # UC-06 «include» UC-07 (Live monitoring includes anomaly alarm notification)
    draw_uml_relation(ax, 4.2, 6.8, 4.2, 5.7, "«include»", (0.35, 0))

    # Legend / Key
    legend_box = FancyBboxPatch((1.9, 0.0), 2.5, 1.2,
                                boxstyle="round,pad=0.08,rounding_size=0.1",
                                fc="#FFFFFF", ec="#94A3B8", lw=1, zorder=4)
    ax.add_patch(legend_box)
    ax.text(2.0, 1.05, "UML Legend:", fontsize=7.5, fontweight='bold', color="#0F172A", zorder=5)
    ax.plot([2.0, 2.5], [0.85, 0.85], color="#334155", lw=1.2, zorder=5)
    ax.text(2.6, 0.85, "Actor Association", fontsize=7, va='center', zorder=5)
    ax.plot([2.0, 2.5], [0.55, 0.55], color="#475569", lw=1.2, linestyle="--", zorder=5)
    ax.text(2.6, 0.55, "«include» / «extend»", fontsize=7, va='center', zorder=5)
    ax.plot([2.0, 2.5], [0.25, 0.25], color="#0D9488", lw=1.3, zorder=5)
    ax.text(2.6, 0.25, "External Interface", fontsize=7, va='center', zorder=5)

    plt.tight_layout()
    output_path = 'assessment&activity/CO2-AT1/media/use_case_diagram.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='#FFFFFF')
    plt.close()
    print(f"Use case diagram successfully generated at: {output_path}")

if __name__ == "__main__":
    create_use_case_diagram()

from typing import List
from shared.models.telemetry import TelemetryTick, TeamState

def generate_valorant_telemetry(match_id: str = "VALORANT-MATCH", title: str = "VCT Champions Grand Finals - Ascent") -> List[TelemetryTick]:
    """
    Generates a 24-round VALORANT competitive match telemetry dataset on Ascent
    between Sentinels (Blue/Defenders) and Fnatic (Red/Attackers).
    Synchronized with sequential CUSUM, PELT, and BOCPD change-point detection algorithms.
    """
    # Round-by-round trajectory parameters:
    # (sen_score, fnc_score, sen_credits, fnc_credits, sen_kills, fnc_kills, sen_sites, fnc_sites, sen_fb, fnc_fb, sen_clutches)
    round_data = [
        # Baseline start (Round 0 / Warmup: 0-0 equal balance)
        (0, 0, 2500, 2500, 0, 0, 0, 0, 0, 0, 0),
        # Pistol Phase (Rounds 1-3)
        (1, 0, 3200, 3050, 0, 0, 0, 0, 0, 0, 0),
        (2, 0, 4200, 4150, 0, 0, 0, 0, 0, 0, 0),
        (2, 1, 5600, 5200, 1, 0, 0, 0, 0, 0, 0),  # First Blood pick in Mid
        # Early Gun Rounds & B-Site Retake (Rounds 4-7)
        (3, 1, 7100, 6900, 1, 1, 0, 0, 0, 0, 0),
        (4, 1, 8800, 8300, 2, 1, 0, 1, 0, 0, 0),  # B-Site Spike plant & retake
        (5, 1, 10500, 9950, 2, 1, 0, 1, 0, 0, 0),
        (5, 2, 12300, 11800, 3, 2, 0, 1, 0, 0, 0),
        # Mid Domination & Operator Duels (Rounds 8-11)
        (6, 2, 14200, 13400, 3, 2, 1, 1, 0, 0, 0),  # TenZ Operator pick on Mid
        (7, 2, 16200, 15200, 4, 2, 1, 1, 0, 0, 0),
        (7, 3, 18200, 17400, 4, 3, 1, 1, 0, 0, 0),
        (7, 4, 20400, 19500, 5, 3, 1, 1, 0, 0, 0),
        # Halftime Side Swap (Round 12 - Macro Regime Change)
        (8, 4, 23200, 21100, 8, 3, 2, 2, 0, 0, 0),  # 8-4 lead at Halftime!
        # Second Half Pistol & Retakes (Rounds 13-17)
        (9, 4, 25800, 23200, 9, 4, 3, 2, 0, 0, 0),
        (9, 5, 28400, 25400, 10, 4, 3, 2, 0, 0, 0),
        (10, 5, 31000, 27800, 11, 5, 4, 2, 0, 1, 0),
        (10, 6, 33600, 29900, 12, 5, 4, 3, 0, 1, 0),
        (10, 7, 36100, 32200, 13, 6, 5, 3, 0, 1, 0),
        # Round 18: Critical Turning Point (TenZ 1v3 Clutch & Defuse - BOCPD)
        (11, 7, 41200, 33900, 17, 6, 7, 3, 1, 1, 1),  # TenZ 1v3 Jett Clutch!
        # Late-Game Snowball (Rounds 19-24)
        (12, 7, 44500, 35500, 18, 6, 8, 3, 1, 1, 1),
        (12, 8, 47900, 37200, 20, 6, 9, 3, 1, 1, 1),
        (13, 8, 50800, 39000, 21, 7, 10, 4, 1, 1, 1),  # Match Point!
        (13, 8, 53900, 40500, 23, 7, 10, 4, 1, 1, 1),
        (13, 8, 57200, 42000, 25, 7, 11, 4, 1, 1, 1),  # Victory celebration!
    ]

    ticks: List[TelemetryTick] = []
    for seq, data in enumerate(round_data):
        sen_score, fnc_score, sen_creds, fnc_creds, sen_kills, fnc_kills, sen_sites, fnc_sites, sen_fb, fnc_fb, sen_clutches = data
        
        blue_team = TeamState(
            team_name="SEN",
            total_gold=sen_creds,
            total_kills=sen_kills,
            total_deaths=fnc_kills,
            turrets_destroyed=min(11, sen_sites),
            dragons=min(7, sen_fb),
            barons=min(5, sen_clutches),
            vision_score=float(sen_score * 5.5 + seq * 2.0)
        )
        red_team = TeamState(
            team_name="FNC",
            total_gold=fnc_creds,
            total_kills=fnc_kills,
            total_deaths=sen_kills,
            turrets_destroyed=min(11, fnc_sites),
            dragons=min(7, fnc_fb),
            barons=0,
            vision_score=float(fnc_score * 4.8 + seq * 1.8)
        )
        
        tick = TelemetryTick(
            match_id=match_id,
            sequence_id=seq,
            game_time_seconds=float(seq * 60.0),
            blue_team=blue_team,
            red_team=red_team
        )
        ticks.append(tick)

    return ticks

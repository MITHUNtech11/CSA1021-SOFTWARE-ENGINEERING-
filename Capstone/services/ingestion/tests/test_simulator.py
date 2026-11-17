import pytest
from services.ingestion.app.simulator import MatchSimulator
from shared.models.telemetry import TelemetryTick, TeamState

@pytest.fixture
def dummy_match_ticks():
    ticks = []
    for i in range(10):
        ticks.append(TelemetryTick(
            match_id="SIM-TEST-01",
            sequence_id=i,
            game_time_seconds=float(i * 60),
            blue_team=TeamState(team_name="T1", total_gold=2000 + i*500, total_kills=i, total_deaths=max(0, i-1)),
            red_team=TeamState(team_name="WBG", total_gold=2000 + i*400, total_kills=max(0, i-1), total_deaths=i)
        ))
    return ticks

def test_simulator_step_and_seek(dummy_match_ticks):
    sim = MatchSimulator(ticks=dummy_match_ticks)
    assert sim.total_ticks == 10
    assert sim.current_index == 0
    
    # Step 1 tick
    tick = sim.step()
    assert tick is not None
    assert tick.sequence_id == 0
    assert sim.current_index == 1

    # Seek to tick 5
    seek_tick = sim.seek(5)
    assert seek_tick is not None
    assert seek_tick.sequence_id == 5
    assert sim.current_index == 6

def test_simulator_reset(dummy_match_ticks):
    sim = MatchSimulator(ticks=dummy_match_ticks)
    sim.seek(8)
    sim.reset()
    assert sim.current_index == 0
    assert sim.is_playing is False

def test_simulator_load_from_real_file():
    from pathlib import Path
    sample_file = Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample_matches" / "match_t1_vs_wbg_worlds_finals.json"
    sim = MatchSimulator.load_from_file(sample_file)
    assert sim.total_ticks == 24
    assert sim.ticks[0].match_id == "MATCH-2023-WORLDS-FINALS-G1"
    assert sim.ticks[18].blue_team.barons == 1


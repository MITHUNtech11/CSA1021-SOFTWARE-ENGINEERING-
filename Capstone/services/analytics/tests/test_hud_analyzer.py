import pytest
import numpy as np
from PIL import Image, ImageDraw
from services.analytics.app.vision.hud_analyzer import ValorantHUDAnalyzer, ValorantHUDState

@pytest.fixture
def analyzer():
    return ValorantHUDAnalyzer()

def create_synthetic_vct_frame(
    width=1920,
    height=1080,
    alive_blue=5,
    alive_red=5,
    spike_planted=False,
    blue_score=8,
    red_score=5
):
    """
    Creates a synthetic 1080p VCT broadcast frame with exact ROI color patterns.
    """
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Dark slate broadcast background
    draw = ImageDraw.Draw(img)

    # 1. Draw Blue Team Roster (5 agents)
    blue_x_coords = [
        int(80 * width / 1920 + i * 65 * width / 1920) for i in range(5)
    ]
    for i, x in enumerate(blue_x_coords):
        box_w = int(50 * width / 1920)
        box_h = int(45 * height / 1080)
        y = int(20 * height / 1080)
        if i < alive_blue:
            # Alive agent: vibrant cyan/teal colors (e.g. Jett/Viper)
            draw.rectangle([x, y, x + box_w, y + box_h], fill=(30 + i * 20, 160 + i * 15, 220))
        else:
            # Dead agent: dark desaturated gray with red cross
            draw.rectangle([x, y, x + box_w, y + box_h], fill=(35, 38, 45))
            draw.line([x, y, x + box_w, y + box_h], fill=(180, 40, 40), width=2)

    # 2. Draw Red Team Roster (5 agents)
    red_x_coords = [
        int(1520 * width / 1920 + i * 65 * width / 1920) for i in range(5)
    ]
    for i, x in enumerate(red_x_coords):
        box_w = int(50 * width / 1920)
        box_h = int(45 * height / 1080)
        y = int(20 * height / 1080)
        if i < alive_red:
            # Alive agent: vibrant amber/orange/red colors (e.g. Raze/Phoenix)
            draw.rectangle([x, y, x + box_w, y + box_h], fill=(230, 90 + i * 20, 40))
        else:
            # Dead agent: dark desaturated gray
            draw.rectangle([x, y, x + box_w, y + box_h], fill=(35, 38, 45))
            draw.line([x, y, x + box_w, y + box_h], fill=(180, 40, 40), width=2)

    # 3. Center Objective / Clock ROI
    center_x = int(935 * width / 1920)
    center_y = int(22 * height / 1080)
    center_w = int(50 * width / 1920)
    center_h = int(42 * height / 1080)

    if spike_planted:
        # Red pulsing Spike Diamond
        draw.rectangle([center_x, center_y, center_x + center_w, center_y + center_h], fill=(220, 20, 30))
    else:
        # Regular countdown clock (neutral dark slate background with white text)
        draw.rectangle([center_x, center_y, center_x + center_w, center_y + center_h], fill=(20, 25, 35))

    return np.array(img)

def test_hud_analyzer_detects_5v5_baseline(analyzer):
    frame = create_synthetic_vct_frame(alive_blue=5, alive_red=5, spike_planted=False)
    state = analyzer.analyze_frame(frame)
    
    assert isinstance(state, ValorantHUDState)
    assert state.alive_blue == 5
    assert state.alive_red == 5
    assert state.spike_planted is False
    assert state.alive_diff == 0

def test_hud_analyzer_detects_man_advantage_4v2(analyzer):
    frame = create_synthetic_vct_frame(alive_blue=4, alive_red=2, spike_planted=False)
    state = analyzer.analyze_frame(frame)
    
    assert state.alive_blue == 4
    assert state.alive_red == 2
    assert state.alive_diff == 2  # Blue has +2 advantage

def test_hud_analyzer_detects_spike_planted(analyzer):
    frame = create_synthetic_vct_frame(alive_blue=3, alive_red=3, spike_planted=True)
    state = analyzer.analyze_frame(frame)
    
    assert state.spike_planted is True
    assert state.alive_blue == 3
    assert state.alive_red == 3

def test_hud_analyzer_detects_1v3_clutch_state(analyzer):
    frame = create_synthetic_vct_frame(alive_blue=1, alive_red=3, spike_planted=True)
    state = analyzer.analyze_frame(frame)
    
    assert state.alive_blue == 1
    assert state.alive_red == 3
    assert state.is_clutch_scenario is True
    assert state.clutch_player_side == "BLUE"

def test_hud_analyzer_scales_to_720p(analyzer):
    frame_720p = create_synthetic_vct_frame(width=1280, height=720, alive_blue=5, alive_red=4, spike_planted=False)
    state = analyzer.analyze_frame(frame_720p)
    
    assert state.alive_blue == 5
    assert state.alive_red == 4

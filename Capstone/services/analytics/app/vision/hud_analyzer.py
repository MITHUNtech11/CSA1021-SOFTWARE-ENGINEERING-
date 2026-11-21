from datetime import datetime, timezone
from typing import Optional, Any, Tuple
import numpy as np
from PIL import Image
from pydantic import BaseModel, Field

class ValorantHUDState(BaseModel):
    """
    Structured real-time in-game state extracted from VALORANT broadcast HUD.
    """
    alive_blue: int = Field(5, ge=0, le=5, description="Active living players on Blue (Defenders)")
    alive_red: int = Field(5, ge=0, le=5, description="Active living players on Red (Attackers)")
    alive_diff: int = Field(0, description="alive_blue minus alive_red")
    spike_planted: bool = Field(False, description="True if Spike is active/planted")
    is_clutch_scenario: bool = Field(False, description="True if a 1vX clutch situation is active")
    clutch_player_side: Optional[str] = Field(None, description="'BLUE' or 'RED' if in 1vX scenario")
    blue_score: int = Field(0, ge=0, description="Blue team round score")
    red_score: int = Field(0, ge=0, description="Red team round score")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Detection confidence")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def model_post_init(self, __context):
        # Auto-compute alive_diff and clutch state if not explicitly specified
        object.__setattr__(self, 'alive_diff', self.alive_blue - self.alive_red)
        if self.alive_blue == 1 and self.alive_red >= 2:
            object.__setattr__(self, 'is_clutch_scenario', True)
            object.__setattr__(self, 'clutch_player_side', "BLUE")
        elif self.alive_red == 1 and self.alive_blue >= 2:
            object.__setattr__(self, 'is_clutch_scenario', True)
            object.__setattr__(self, 'clutch_player_side', "RED")

class ValorantHUDAnalyzer:
    """
    Computer Vision & HUD parser extracting real-time tactical game state
    from 1080p broadcast video frames.
    """
    # 1080p Normalized ROIs (x1, y1, x2, y2)
    BLUE_AGENT_ROIS = [
        ((80 + i * 65) / 1920.0, 18 / 1080.0, (130 + i * 65) / 1920.0, 65 / 1080.0)
        for i in range(5)
    ]
    RED_AGENT_ROIS = [
        ((1520 + i * 65) / 1920.0, 18 / 1080.0, (1570 + i * 65) / 1920.0, 65 / 1080.0)
        for i in range(5)
    ]
    SPIKE_CENTER_ROI = (935 / 1920.0, 20 / 1080.0, 985 / 1920.0, 64 / 1080.0)

    def __init__(self):
        pass

    def _is_agent_crop_alive(self, crop: np.ndarray) -> bool:
        """
        Determines if an agent portrait is alive (vibrant/saturated) or dead (grayed out).
        """
        if crop.size == 0:
            return False

        r = crop[:, :, 0].astype(np.float32)
        g = crop[:, :, 1].astype(np.float32)
        b = crop[:, :, 2].astype(np.float32)

        mean_lum = float(np.mean(0.299 * r + 0.587 * g + 0.114 * b))
        
        # Dead portraits in VCT are desaturated gray (low variance across RGB channels)
        max_c = np.maximum(np.maximum(r, g), b)
        min_c = np.minimum(np.minimum(r, g), b)
        denom = np.where(max_c == 0, 1.0, max_c)
        saturation = np.mean((max_c - min_c) / denom)

        # Standard deviation across channels
        channel_std = float(np.std([np.mean(r), np.mean(g), np.mean(b)]))

        # In VCT broadcast overlays, active living portraits have high luminance (> 65)
        # while eliminated agent boxes are dimmed to dark gray (mean luminance < 55)
        if mean_lum < 58.0:
            return False
        
        return bool(saturation > 0.20 or channel_std > 22.0)

    def _is_spike_planted(self, crop: np.ndarray) -> bool:
        """
        Detects if the center clock area has turned into the red pulsing Spike diamond.
        """
        if crop.size == 0:
            return False

        r = crop[:, :, 0].astype(np.float32)
        g = crop[:, :, 1].astype(np.float32)
        b = crop[:, :, 2].astype(np.float32)

        mean_r = float(np.mean(r))
        mean_g = float(np.mean(g))
        mean_b = float(np.mean(b))

        # Red dominance ratio
        other_channels = max(1.0, (mean_g + mean_b) / 2.0)
        red_ratio = mean_r / other_channels

        return bool(mean_r > 130.0 and red_ratio > 1.45)

    def analyze_frame(self, frame: Any) -> ValorantHUDState:
        """
        Analyzes a single video frame (Pillow Image or NumPy RGB array).
        """
        if isinstance(frame, Image.Image):
            arr = np.array(frame)
        elif isinstance(frame, np.ndarray):
            arr = frame
        else:
            raise ValueError(f"Unsupported frame type: {type(frame)}")

        h, w, c = arr.shape

        # Helper to extract ROI by normalized coords
        def get_roi(roi: Tuple[float, float, float, float]) -> np.ndarray:
            x1, y1, x2, y2 = roi
            px1, py1 = int(x1 * w), int(y1 * h)
            px2, py2 = int(x2 * w), int(y2 * h)
            return arr[py1:py2, px1:px2]

        # 1. Evaluate Blue Team alive count
        alive_blue = 0
        for roi in self.BLUE_AGENT_ROIS:
            crop = get_roi(roi)
            if self._is_agent_crop_alive(crop):
                alive_blue += 1

        # 2. Evaluate Red Team alive count
        alive_red = 0
        for roi in self.RED_AGENT_ROIS:
            crop = get_roi(roi)
            if self._is_agent_crop_alive(crop):
                alive_red += 1

        # 3. Evaluate Spike status
        spike_crop = get_roi(self.SPIKE_CENTER_ROI)
        spike_planted = self._is_spike_planted(spike_crop)

        # 4. Evaluate Clutch scenario
        is_clutch = False
        clutch_side = None
        if alive_blue == 1 and alive_red >= 2:
            is_clutch = True
            clutch_side = "BLUE"
        elif alive_red == 1 and alive_blue >= 2:
            is_clutch = True
            clutch_side = "RED"

        return ValorantHUDState(
            alive_blue=alive_blue,
            alive_red=alive_red,
            alive_diff=alive_blue - alive_red,
            spike_planted=spike_planted,
            is_clutch_scenario=is_clutch,
            clutch_player_side=clutch_side,
            confidence=0.96
        )

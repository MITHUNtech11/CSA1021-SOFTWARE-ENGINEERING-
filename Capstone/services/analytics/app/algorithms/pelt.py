import numpy as np
from typing import List

class PELTDetector:
    """
    Pruned Exact Linear Time (PELT) change-point detection algorithm.
    Partitions time-series into optimal stationary macro-regimes in expected linear O(n) time.
    """
    def __init__(self, penalty: float = 10.0, min_size: int = 3):
        self.penalty = penalty
        self.min_size = min_size

    def _segment_cost(self, signal: np.ndarray, s: int, t: int) -> float:
        segment = signal[s:t]
        n = len(segment)
        if n <= 1:
            return 0.0
        mean = np.mean(segment)
        return float(np.sum((segment - mean) ** 2))

    def segment(self, data: np.ndarray) -> List[int]:
        n = len(data)
        if n < 2 * self.min_size:
            return []

        # F[t] is the optimal penalised cost for data[0:t]
        F = np.zeros(n + 1)
        F[0] = -self.penalty
        
        # cp[t] records the optimal last change point before t
        cp = {0: 0}
        
        # R is the set of active candidate change points
        R = [0]

        for t in range(self.min_size, n + 1):
            candidates = [s for s in R if t - s >= self.min_size]
            non_candidates = [s for s in R if t - s < self.min_size]

            if not candidates:
                F[t] = F[t - 1]
                cp[t] = cp.get(t - 1, 0)
                continue

            costs = [F[s] + self._segment_cost(data, s, t) + self.penalty for s in candidates]
            best_idx = int(np.argmin(costs))
            F[t] = costs[best_idx]
            best_tau = candidates[best_idx]
            cp[t] = best_tau

            # Pruning step: retain candidate s if F[s] + cost(s, t) <= F[t]
            pruned_candidates = [
                s for s in candidates 
                if (F[s] + self._segment_cost(data, s, t) <= F[t])
            ]
            R = non_candidates + pruned_candidates + [t]

        # Backtrack to reconstruct the optimal change point indices
        change_points = []
        curr = cp.get(n, 0)
        while curr > 0:
            change_points.append(curr)
            curr = cp.get(curr, 0)

        change_points.reverse()
        return change_points

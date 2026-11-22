import numpy as np


class PELTDetector:
    """Penalized least-squares change-point detection with minimum segment length."""

    def __init__(self, penalty: float = 10.0, min_size: int = 3):
        if min_size < 1 or not np.isfinite(penalty) or penalty < 0:
            raise ValueError("Expected positive min_size and a finite, nonnegative penalty")
        self.penalty = penalty
        self.min_size = min_size

    def segment(self, data: np.ndarray) -> list[int]:
        n = len(data)
        if n < 2 * self.min_size:
            return []

        centered = np.asarray(data, dtype=float) - float(np.mean(data))
        sums = np.concatenate(([0.0], np.cumsum(centered)))
        squares = np.concatenate(([0.0], np.cumsum(centered ** 2)))
        costs = np.full(n + 1, np.inf)
        costs[0] = -self.penalty
        previous = np.zeros(n + 1, dtype=int)
        candidates: dict[int, int] = {}

        for end in range(self.min_size, n + 1):
            start = end - self.min_size
            if np.isfinite(costs[start]):
                candidates[start] = n + 1
            candidates = {start: expires for start, expires in candidates.items() if expires > end}
            starts = np.fromiter(candidates, dtype=int)
            segment_costs = squares[end] - squares[starts] - (sums[end] - sums[starts]) ** 2 / (end - starts)
            unpenalized = costs[starts] + np.maximum(0, segment_costs)
            best = int(np.argmin(unpenalized))
            costs[end] = unpenalized[best] + self.penalty
            previous[end] = starts[best]

            # The dominating boundary is only feasible after another full segment.
            for start in starts[unpenalized > costs[end] + 1e-9]:
                candidates[start] = min(candidates[start], end + self.min_size)

        boundaries = []
        end = int(previous[n])
        while end:
            boundaries.append(end)
            end = int(previous[end])
        return boundaries[::-1]

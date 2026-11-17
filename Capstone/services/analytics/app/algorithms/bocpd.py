import numpy as np
from typing import Tuple

class BayesianOnlineCPD:
    """
    Bayesian Online Change-Point Detection (BOCPD) based on Adams & MacKay (2007).
    Maintains a recursive posterior distribution over run lengths r_t.
    """
    def __init__(
        self,
        hazard_rate: float = 50.0,
        mu0: float = 0.0,
        var0: float = 25.0,
        obs_var: float = 1.0,
        threshold: float = 0.35
    ):
        self.hazard_rate = hazard_rate
        self.mu0 = mu0
        self.var0 = var0
        self.obs_var = obs_var
        self.threshold = threshold
        
        # P(r_0 = 0) = 1.0
        self.R = np.array([1.0])
        self.means = np.array([mu0])
        self.vars = np.array([var0])
        self.counts = np.array([0])
        self.t = 0

    def _gaussian_pdf(self, x: float, mean: np.ndarray, var: np.ndarray) -> np.ndarray:
        denom = np.sqrt(2.0 * np.pi * var)
        diff = x - mean
        exponent = - (diff ** 2) / (2.0 * var)
        pdf = np.exp(np.clip(exponent, -50.0, 0.0)) / denom
        return np.maximum(pdf, 1e-12)

    def update(self, x: float) -> Tuple[bool, float]:
        self.t += 1
        
        # 1. Predictive variance for each active run length
        pred_var = self.vars + self.obs_var
        pred_probs = self._gaussian_pdf(x, self.means, pred_var)
        
        # Prior predictive probability for a new change-point (r_t = 0)
        prior_pred = float(self._gaussian_pdf(x, np.array([self.mu0]), np.array([self.var0 + self.obs_var]))[0])

        # 2. Growth and changepoint probabilities
        H = 1.0 / self.hazard_rate
        growth_probs = self.R * pred_probs * (1.0 - H)
        cp_prob = np.sum(self.R) * prior_pred * H

        # 3. New run length distribution
        R_new = np.empty(len(self.R) + 1)
        R_new[0] = cp_prob
        R_new[1:] = growth_probs
        
        total = np.sum(R_new)
        if total > 0:
            R_new = R_new / total
        else:
            R_new = np.zeros_like(R_new)
            R_new[0] = 1.0
        self.R = R_new

        # 4. Update Gaussian running statistics
        # Online recursive update for each run length
        new_counts = self.counts + 1
        new_means = self.means + (x - self.means) / new_counts
        new_vars = np.maximum(0.1, self.obs_var / new_counts)

        self.counts = np.append([0], new_counts)
        self.means = np.append([self.mu0], new_means)
        self.vars = np.append([self.var0], new_vars)

        # Truncate insignificant run lengths to keep computation light
        if len(self.R) > 80:
            keep = self.R > 1e-4
            keep[0] = True
            self.R = self.R[keep]
            self.R = self.R / np.sum(self.R)
            self.counts = self.counts[keep]
            self.means = self.means[keep]
            self.vars = self.vars[keep]

        cp_confidence = float(self.R[0])
        is_change_point = bool(cp_confidence >= self.threshold)
        return is_change_point, cp_confidence

"""
MandiSetu — Matching Service (Module 5)
Computes a composite match score for buyer-farmer pairs.
"""


def compute_match_score(
    offered_price: float,
    min_price: float,
    buyer_reliability: float,
    quantity_match_ratio: float,
) -> float:
    """
    Composite score (0–100):
      - Price premium over floor: 40 pts
      - Buyer reliability: 30 pts
      - Quantity match:  30 pts
    """
    if min_price <= 0:
        price_score = 40.0
    else:
        premium_ratio = (offered_price - min_price) / min_price
        price_score = min(40.0, max(0.0, 40.0 * (1 + premium_ratio)))

    reliability_score = min(30.0, (buyer_reliability / 100.0) * 30.0)
    quantity_score = quantity_match_ratio * 30.0

    return round(price_score + reliability_score + quantity_score, 2)

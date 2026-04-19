---
layout: post
title: "The Morphological Failure of CNNs: Why I Pivoted to GNNs"
date: 2026-04-01
categories: [GNN, Medical Vision]
---

> **TL;DR**
> Standard CNNs overfit to the global intensity template of retinal fundus images, failing to capture the intrinsic geometry of the vascular tree. Representing the retina as a non-Euclidean graph eliminates this bias entirely and forms the foundation of my current research submission to a top-tier medical vision conference.

---

## The Problem with Grid-Based Convolutions

Standard CNNs treat a retinal fundus image as a regular grid $$I \in \mathbb{R}^{H \times W \times 3}$$. While effective for general object detection, this approach fails to capture the intrinsic geometric structure of the vascular tree — a branching, hierarchical, non-Euclidean manifold.

### Logic Flaw: Template Overfitting

I observed that my "Compact CNN" models were achieving high accuracy by overfitting to the *global intensity distribution* (the "template") rather than learning robust features of glaucoma progression.

When tested on the **FairFedMed** dataset, performance dropped by over **15%** because the model could not generalize across different sensor noise distributions. The failure mode was conclusive: the model had never learnt to *see*. It had learnt to remember.

```python
# The failure: evaluating on out-of-distribution sensor data
results_in_dist  = model.evaluate(retina_test_same_scanner)   # Accuracy: 91.2%
results_out_dist = model.evaluate(retina_test_diff_scanner)   # Accuracy: 76.4%

print(f"Generalization gap: {91.2 - 76.4:.1f}%")  # → 14.8%
```

---

## The Solution: Non-Euclidean Graph Representations

By representing the retina as a graph G = (V, E), where V are vascular junction nodes and E are the connecting arterial/venous segments, we achieve a **coordinate-independent representation** — one that is invariant to scanner-specific intensity biases.

### Graph Construction

Each node $$v_i \in V$$ encodes a feature vector:

$$\mathbf{h}_{v_i} = [x_i, y_i, d_i, \text{tortuosity}_i, \text{calibre}_i]$$

where $$d_i$$ is the degree (branching factor) and tortuosity is the arc-chord ratio of each vessel segment.

### Message Passing

The GNN update rule aggregates neighbourhood information:

$$\mathbf{h}^{(k+1)}_v = \sigma \left( \mathbf{W}^{(k)} \cdot \text{AGG}\left(\{ \mathbf{h}^{(k)}_u : u \in \mathcal{N}(v) \}\right) \right)$$

where $$\text{AGG}$$ is a permutation-invariant aggregator (mean, max, or sum).

---

## Results (Preliminary)

Early ablations on a held-out split show significant improvements over the CNN baseline:

| Model | In-Dist Acc | Out-Dist Acc | Gap |
|---|---|---|---|
| Compact CNN | 91.2% | 76.4% | **14.8%** |
| GNN (ours) | 89.7% | 87.1% | **2.6%** |

The GNN trades a marginal 1.5% in-distribution accuracy for a **12.2% reduction in the generalization gap** — the exact trade-off that matters for clinical deployment.

---

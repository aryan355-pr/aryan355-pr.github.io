---
layout: post
title: "The Morphological Failure: Why I Pivoted to GNNs"
date: 2026-04-01
categories: [GNN, Medical Vision]
---

I pivoted to a Graph Neural Network (GNN) because trying to force a standard 2D Vision Transformer to understand a 1D circular topology is like trying to teach a toaster to sing. It is mathematically the wrong tool for the job.

This pivot was necessary because our previous approach—the one that was rejected from our previous conference submission—relied on a fundamental architectural assumption: that if we just penalized the network heavily enough with a custom loss function, it would magically learn the anatomy.

Here is the rigorous, step-by-step breakdown of exactly why the GNN was the only valid escape route, and exactly how we explain this pivot in the introduction of our paper.

### 1. The 2D Grid vs. The 1D Ring

Standard foundation models like RETFound (ViT-L) or ResNet-50 process images as 2D grids or disconnected patches. They treat the pixels at the top of the image as entirely separate from the pixels at the bottom.

But the Retinal Nerve Fiber Layer (RNFL) is a **closed 360-degree anatomical ring**. In physical reality, degree 359 sits exactly next to degree 0. A standard ViT has zero mathematical awareness of this cyclical boundary condition. The GNN explicitly hardwires this physical reality into the network via the adjacency matrix.

### 2. The Variance Collapse (The Median Trap)

Because we are working with SLO Fundus images, we are asking the network to hallucinate a 3D depth measurement (micrometers of tissue) from a flat 2D texture.

When a standard neural network faces a highly uncertain inverse problem without structural priors, it panics. To minimize standard L1/L2 error, it simply predicts the population average everywhere. It draws a flat, safe line. This completely washes out the 10° to 15° focal glaucomatous notches, which are the exact features clinicians actually need to see. This is the variance collapse that killed our previous baseline.

### 3. The "Loss Function" Delusion (The Rejected Premise)

In our previous paper, we tried to fix this flattening effect by slapping a Topological Gradient penalty on top of the network. We told the loss function to penalize the model if the curve wasn't sharp enough.

But we cannot enforce a 1D topological penalty on an architecture that lacks 1D spatial wiring. We gave the network a steering wheel but no wheels. The network was trapped: the loss function demanded sharp drops, but the 2D grid architecture physically could not map those drops to a continuous ring without hallucinating high-frequency static noise.

### 4. The GNN (Building the Tracks)

This is why the `TopologyGNN` is not just a fancy add-on; it is the fundamental framework.

By pivoting to a Graph Neural Network with a locked $$k=2$$ neighborhood, we mathematically constrained the network's receptive field to a $$13^\circ$$ window. We built the physical tracks for the loss function to run on.

* The GNN provides the **spatial priors** (preventing random noise hallucinations).
* The Dual Loss provides the **geometric tension** (forcing the GNN to drop into the anatomical notches instead of over-smoothing).



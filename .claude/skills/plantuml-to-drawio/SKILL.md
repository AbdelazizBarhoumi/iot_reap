---
name: plantuml-to-drawio
description: Convert PlantUML sequence diagrams (.txt or .puml) into draw.io-compatible XML files (.xml) following UML 2.5 conventions. Use when the user provides a PlantUML file and wants a draw.io XML output.
---

# PlantUML → draw.io XML Conversion Skill

## Goal
Parse a PlantUML sequence diagram and emit a draw.io `mxGraphModel` XML file that renders correctly in draw.io / diagrams.net, using UML 2.5 shapes.

---

## Output Format

The output is a single `.xml` file using the `mxGraphModel` schema:

```xml
<mxGraphModel dx="2575" dy="1355" grid="1" gridSize="10" guides="1"
              tooltips="1" connect="1" arrows="1" fold="1" page="1"
              pageScale="1" pageWidth="1900" pageHeight="2000"
              background="none" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <!-- elements here -->
  </root>
</mxGraphModel>
```

---

## UML 2.5 Shape Reference

| Element | draw.io style |
|---|---|
| Actor | `shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=none;strokeWidth=2;fontSize=11;` |
| Lifeline | `shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;` |
| Activation bar | `html=1;points=[[0,0,0,0,5],[0,1,0,0,-5],[1,0,0,0,5],[1,1,0,0,-5]];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;` |
| Sync message (→) | `html=1;endArrow=block;endFill=1;edgeStyle=orthogonalEdgeStyle;exitX=1;exitY=0.5;entryX=0;entryY=0.5;` |
| Return message (-->) | `html=1;endArrow=open;endFill=0;dashed=1;edgeStyle=orthogonalEdgeStyle;exitX=0;exitY=0.5;entryX=1;entryY=0.5;` |
| Self-call | `html=1;endArrow=block;endFill=1;edgeStyle=orthogonalEdgeStyle;exitX=1;exitY=0.5;entryX=1;entryY=0.5;` |
| Combined fragment / group box | `text;html=1;strokeColor=#000000;fillColor=#f5f5f5;align=left;verticalAlign=top;spacingLeft=4;fontColor=#333333;` |
| Database participant | Use lifeline shape; optionally prefix label with a cylinder icon via `shape=mxgraph.flowchart.database` for the header cell |
| Section label (== ... ==) | `text;html=1;align=left;verticalAlign=middle;fontSize=11;fontStyle=1;strokeColor=#666666;fillColor=#f5f5f5;` |

---

## Layout Rules

- **Page size**: 1900 × 2000 (increase height for long diagrams).
- **Title**: Placed at `x=100, y=10`, width spanning participants, height=30.
- **Actor**: `width=30, height=45`, placed at `y=60`.
- **Lifelines**: Start at `y=50`, height=1850 (or taller). Space participants **180 px** apart (narrower participants 100–120 px wide, wider ones up to 140 px).
- **Activation bars**: `width=10`. Start y offset is relative to the lifeline container. Align bar start to the incoming message y position.
- **Messages**: y positions increment by ~40 px per step. Leave ~80 px between section groups.
- **Section banners** (`== Label ==`): Full-width rectangle with light grey fill, placed between message rows.
- All cells use `parent="1"` unless they are activation bars, which use `parent="<lifeline_id>"`.

---

## Parsing Rules (PlantUML → XML)

| PlantUML syntax | XML mapping |
|---|---|
| `actor Name` | `shape=umlActor` cell + lifeline for its column |
| `participant "Label\nLine2" as Alias` | Lifeline with `&#xa;` for newlines in value |
| `database "Label" as Alias` | Lifeline (same shape; label convention only) |
| `A -> B: message` | Sync arrow from A activation bar to B activation bar |
| `B --> A: message` | Dashed return arrow |
| `A -> A: message` | Self-call loop arrow |
| `== Section ==` | Section banner rectangle + label |
| `note over A: text` | Sticky-note box near A's lifeline |

---

## Step-by-Step Procedure

1. **Parse participants** — collect all `actor`, `participant`, `database` declarations in order.
2. **Assign x positions** — space them 180 px apart starting at x=70.
3. **Parse messages** — walk the body line by line, tracking current y (start at ~150 after header rows).
4. **Emit XML** — write each element in document order: title → actors → lifelines → activation bars → section banners → message arrows.
5. **Validate** — every `source` and `target` attribute must reference a valid `id`. Activation bar ids follow the pattern `act_<alias>_<section>`.

---

## Minimal Working Example

For a two-participant diagram:
```
A -> B: request
B --> A: response
```

```xml
<mxGraphModel ...>
  <root>
    <mxCell id="0" /><mxCell id="1" parent="0" />

    <mxCell id="ll_a" parent="1"
      style="shape=umlLifeline;..." value="A" vertex="1">
      <mxGeometry x="150" y="50" width="100" height="400" as="geometry" />
    </mxCell>
    <mxCell id="ll_b" parent="1"
      style="shape=umlLifeline;..." value="B" vertex="1">
      <mxGeometry x="330" y="50" width="100" height="400" as="geometry" />
    </mxCell>

    <mxCell id="act_a" parent="ll_a" style="..." value="" vertex="1">
      <mxGeometry x="45" y="100" width="10" height="80" as="geometry" />
    </mxCell>
    <mxCell id="act_b" parent="ll_b" style="..." value="" vertex="1">
      <mxGeometry x="45" y="120" width="10" height="60" as="geometry" />
    </mxCell>

    <!-- request -->
    <mxCell id="msg1" parent="1"
      style="html=1;endArrow=block;endFill=1;edgeStyle=orthogonalEdgeStyle;..."
      value="request" edge="1" source="act_a" target="act_b">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>

    <!-- response -->
    <mxCell id="msg2" parent="1"
      style="html=1;endArrow=open;endFill=0;dashed=1;edgeStyle=orthogonalEdgeStyle;..."
      value="response" edge="1" source="act_b" target="act_a">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>
```

---

## Output Instructions

- Output **only** the `.xml` file content — no markdown fences, no explanation inline.
- Save to `/mnt/user-data/outputs/<diagram-name>.xml`.
- Use the PlantUML `title` directive (if present) as the diagram title cell value.
- Escape special characters in labels: `&` → `&amp;`, `<` → `&lt;`, newlines → `&#xa;`.
- All numeric geometry values must be integers.
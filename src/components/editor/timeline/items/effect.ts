import { Control, Resizable, ResizableProps } from "@openvideo/timeline";
import { editorFont } from "@/components/editor/constants";
import { createResizeControls } from "../controls";
import {
  TIMELINE_SELECTED_BORDER_COLOR,
  TIMELINE_BORDER_WIDTH,
  TIMELINE_ITEM_BORDER_RADIUS,
} from "../../constants/constants";

interface EffectProps extends ResizableProps {
  name: string;
  effect: {
    key: string;
    name: string;
  };
}

class Effect extends Resizable {
  static type = "Effect";
  public name: string;
  public effect: { key: string; name: string };
  static createControls(): { controls: Record<string, Control> } {
    return { controls: createResizeControls() };
  }

  constructor(props: EffectProps) {
    super(props);
    console.log("Effect props", props);
    this.id = props.id;
    this.rx = TIMELINE_ITEM_BORDER_RADIUS;
    this.ry = TIMELINE_ITEM_BORDER_RADIUS;
    this.display = props.display;
    this.tScale = props.tScale;
    this.name = props.name;
    this.effect = props.effect;
    this.fill = "#40836e";
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawIdentity(ctx);
    this.updateSelected(ctx);
  }

  public drawIdentity(ctx: CanvasRenderingContext2D) {
    const svgPath = new Path2D(
      "M0 5.83333C3.22166 5.83333 5.83333 3.22166 5.83333 0H7C7 3.22166 9.6117 5.83333 12.8333 5.83333V7C9.6117 7 7 9.6117 7 12.8333H5.83333C5.83333 9.6117 3.22166 7 0 7V5.83333ZM2.802 6.41667C4.41522 7.12209 5.71124 8.41808 6.41667 10.0314C7.12209 8.41808 8.41808 7.12209 10.0314 6.41667C8.41808 5.71124 7.12209 4.41522 6.41667 2.802C5.71124 4.41522 4.41522 5.71124 2.802 6.41667Z",
    );
    ctx.save();
    ctx.clip();
    ctx.translate(-this.width / 2, -this.height / 2);

    // 1. Draw SVG Path first (icon)
    ctx.save();
    ctx.translate(10, (this.height - 15.4) / 2);
    ctx.scale(1.2, 1.2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill(svgPath);
    ctx.restore();

    // 2. Draw text second
    ctx.font = `600 11px ${editorFont.fontFamily}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.name, 30, this.height / 2);
    ctx.restore();
  }

  public updateSelected(ctx: CanvasRenderingContext2D) {
    if (!this.isSelected) return;

    const borderColor = TIMELINE_SELECTED_BORDER_COLOR;
    const borderWidth = TIMELINE_BORDER_WIDTH;
    const borderRadius = TIMELINE_ITEM_BORDER_RADIUS;

    ctx.save();
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, borderRadius);
    ctx.roundRect(
      -this.width / 2 + borderWidth,
      -this.height / 2 + borderWidth,
      this.width - borderWidth * 2,
      this.height - borderWidth * 2,
      Math.max(0, borderRadius - borderWidth),
    );
    ctx.fill("evenodd");
    ctx.restore();
  }
}

export default Effect;

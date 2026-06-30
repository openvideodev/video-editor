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

class Backdrop extends Resizable {
  static type = "Backdrop";
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
    this.fill = "#6d70b8";
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawIdentity(ctx);
    this.updateSelected(ctx);
  }

  public drawIdentity(ctx: CanvasRenderingContext2D) {
    const svgPath = new Path2D(
      "M5.83322 0L2.33333 5.83333H9.33333L5.83322 0ZM5.83322 2.26759L7.27277 4.66667H4.39385L5.83322 2.26759ZM2.77083 11.0833C1.88488 11.0833 1.16667 10.3651 1.16667 9.47917C1.16667 8.5932 1.88488 7.875 2.77083 7.875C3.65679 7.875 4.375 8.5932 4.375 9.47917C4.375 10.3651 3.65679 11.0833 2.77083 11.0833ZM2.77083 12.25C4.30112 12.25 5.54167 11.0095 5.54167 9.47917C5.54167 7.94885 4.30112 6.70833 2.77083 6.70833C1.24055 6.70833 0 7.94885 0 9.47917C0 11.0095 1.24055 12.25 2.77083 12.25ZM7.58333 8.45833V10.7917H9.91667V8.45833H7.58333ZM6.41667 11.9583V7.29167H11.0833V11.9583H6.41667Z",
    );

    ctx.save();
    ctx.clip();
    ctx.translate(-this.width / 2, -this.height / 2);

    // 1. Draw SVG Path first (icon)
    ctx.save();
    ctx.translate(10, (this.height - 14.7) / 2);
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

export default Backdrop;

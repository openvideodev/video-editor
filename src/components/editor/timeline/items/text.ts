import { Control, Resizable, ResizableProps } from "@openvideo/timeline";
import { IDisplay } from "@openvideo/timeline";
import { createResizeControls } from "../controls";
import {
  SECONDARY_FONT,
  TIMELINE_SELECTED_BORDER_COLOR,
  TIMELINE_UNSELECTED_BORDER_COLOR,
  TIMELINE_BORDER_WIDTH,
  TIMELINE_ITEM_BORDER_RADIUS,
} from "../../constants/constants";

interface TextProps extends ResizableProps {
  text: string;
  tScale: number;
  display: IDisplay;
}
class Text extends Resizable {
  static type = "Text";
  declare id: string;
  declare text: string;
  static createControls(): { controls: Record<string, Control> } {
    return { controls: createResizeControls() };
  }

  constructor(props: TextProps) {
    super(props);
    this.fill = "#0081ae";
    this.id = props.id;
    this.borderColor = "transparent";
    this.stroke = "transparent";
    this.text = props.text;
    this.rx = TIMELINE_ITEM_BORDER_RADIUS;
    this.ry = TIMELINE_ITEM_BORDER_RADIUS;
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawTextIdentity(ctx);
    this.updateSelected(ctx);
  }

  public drawTextIdentity(ctx: CanvasRenderingContext2D) {
    const textPath = new Path2D("M5.33333 1.33333V11.3333H4V1.33333H0V0H9.33333V1.33333H5.33333Z");
    ctx.save();
    ctx.clip();
    ctx.translate(-this.width / 2, -this.height / 2);

    // 1. Draw SVG Path first (icon)
    ctx.save();
    ctx.translate(12, (this.height - 11.3333) / 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fill(textPath);
    ctx.restore();

    // 2. Draw text second
    ctx.font = `400 12px ${SECONDARY_FONT}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, 30, this.height / 2);
    ctx.restore();
  }

  public updateSelected(ctx: CanvasRenderingContext2D) {
    const borderColor = this.isSelected
      ? TIMELINE_SELECTED_BORDER_COLOR
      : TIMELINE_UNSELECTED_BORDER_COLOR;
    const borderWidth = TIMELINE_BORDER_WIDTH;
    const borderRadius = TIMELINE_ITEM_BORDER_RADIUS;

    ctx.save();
    ctx.fillStyle = borderColor;

    // Create a path for the outer rectangle with rounded corners
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, borderRadius);

    // Create a path for the inner rectangle with rounded corners (the hole)
    ctx.roundRect(
      -this.width / 2 + borderWidth,
      -this.height / 2 + borderWidth,
      this.width - borderWidth * 2,
      this.height - borderWidth * 2,
      Math.max(0, borderRadius - borderWidth),
    );

    // Use even-odd fill rule to create the border effect
    ctx.fill("evenodd");
    ctx.restore();
  }
}

export default Text;

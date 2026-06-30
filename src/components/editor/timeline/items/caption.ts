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

interface CaptionsProps extends ResizableProps {
  tScale: number;
  display: IDisplay;
  text: string;
}

class Caption extends Resizable {
  static type = "Caption";
  public text: string;

  static createControls(): { controls: Record<string, Control> } {
    return { controls: createResizeControls() };
  }

  constructor(props: CaptionsProps) {
    super(props);
    this.fill = "#00849a";
    this.tScale = props.tScale;
    this.display = props.display;
    this.text = props.text;
    this.rx = TIMELINE_ITEM_BORDER_RADIUS;
    this.ry = TIMELINE_ITEM_BORDER_RADIUS;

    this.borderColor = "transparent";
    this.stroke = "transparent";
    this.strokeWidth = 0;
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawTextIdentity(ctx);
    this.updateSelected(ctx);
  }

  public drawTextIdentity(ctx: CanvasRenderingContext2D) {
    const textPath = new Path2D(
      "M12.6667 0C13.0349 0 13.3333 0.29848 13.3333 0.666667V11.3333C13.3333 11.7015 13.0349 12 12.6667 12H0.666667C0.29848 12 0 11.7015 0 11.3333V0.666667C0 0.29848 0.29848 0 0.666667 0H12.6667ZM12 1.33333H1.33333V10.6667H12V1.33333ZM4.66667 3.33333C5.403 3.33333 6.06993 3.63227 6.55267 4.11533L5.6102 5.05773C5.36893 4.81607 5.03533 4.66667 4.66667 4.66667C3.93 4.66667 3.33333 5.26333 3.33333 6C3.33333 6.73667 3.93 7.33333 4.66667 7.33333C5.035 7.33333 5.36833 7.18413 5.6096 6.94293L6.552 7.88533C6.06933 8.368 5.40267 8.66667 4.66667 8.66667C3.19467 8.66667 2 7.472 2 6C2 4.528 3.19467 3.33333 4.66667 3.33333ZM9.33333 3.33333C10.0697 3.33333 10.7366 3.63227 11.2193 4.11533L10.2769 5.05773C10.0356 4.81607 9.702 4.66667 9.33333 4.66667C8.59667 4.66667 8 5.26333 8 6C8 6.73667 8.59667 7.33333 9.33333 7.33333C9.70167 7.33333 10.035 7.18413 10.2763 6.94293L11.2187 7.88533C10.736 8.368 10.0693 8.66667 9.33333 8.66667C7.86133 8.66667 6.66667 7.472 6.66667 6C6.66667 4.528 7.86133 3.33333 9.33333 3.33333Z",
    );
    ctx.save();
    ctx.clip();
    ctx.translate(-this.width / 2, -this.height / 2);

    // 1. Draw SVG Path first (icon)
    ctx.save();
    ctx.translate(12, (this.height - 12) / 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fill(textPath);
    ctx.restore();

    // 2. Set font and measure/truncate text
    ctx.font = `400 12px ${SECONDARY_FONT}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const iconSpace = 30; // space for the icon (labels start at 30)
    const rightPadding = 5; // 5px padding before ellipsis
    const availableWidth = this.width - iconSpace - rightPadding;

    let displayText = this.text;
    const textWidth = ctx.measureText(this.text).width;

    if (textWidth > availableWidth) {
      let currentText = this.text;
      while (
        ctx.measureText(`${currentText}...`).width > availableWidth &&
        currentText.length > 0
      ) {
        currentText = currentText.slice(0, -1);
      }
      displayText = `${currentText}...`;
    }

    // 3. Draw text second
    ctx.fillText(displayText, 30, this.height / 2);
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

export default Caption;

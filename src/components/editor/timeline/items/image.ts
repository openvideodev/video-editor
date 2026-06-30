import { Resizable, ResizableProps, Pattern, util, Control } from "@openvideo/timeline";
import { createResizeControls } from "../controls";
import {
  TIMELINE_SELECTED_BORDER_COLOR,
  TIMELINE_UNSELECTED_BORDER_COLOR,
  TIMELINE_BORDER_WIDTH,
  TIMELINE_ITEM_BORDER_RADIUS,
} from "../../constants/constants";

interface ImageProps extends ResizableProps {
  src: string;
}

class Image extends Resizable {
  static type = "Image";
  public src: string;
  public hasSrc = true;

  static createControls(): { controls: Record<string, Control> } {
    return { controls: createResizeControls() };
  }

  constructor(props: ImageProps) {
    super(props);
    this.id = props.id;
    this.src = props.src;
    this.display = props.display;
    this.tScale = props.tScale;
    this.rx = TIMELINE_ITEM_BORDER_RADIUS;
    this.ry = TIMELINE_ITEM_BORDER_RADIUS;
    this.loadImage();
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.updateSelected(ctx);
  }

  public loadImage() {
    util.loadImage(this.src).then((img) => {
      const imgHeight = img.height;
      const rectHeight = this.height;
      const scaleY = rectHeight / imgHeight;
      const pattern = new Pattern({
        source: img,
        repeat: "repeat-x",
        patternTransform: [scaleY, 0, 0, scaleY, 0, 0],
      });
      this.set("fill", pattern);
      this.canvas?.requestRenderAll();
    });
  }

  public setSrc(src: string) {
    this.src = src;
    this.loadImage();
    this.canvas?.requestRenderAll();
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

export default Image;

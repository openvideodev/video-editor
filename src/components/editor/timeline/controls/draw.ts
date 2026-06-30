import { FabricObject, util } from "@openvideo/timeline";

export function drawVerticalLine(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _: {},
  fabricObject: FabricObject,
) {
  const cSize = 12;
  const cSizeBy2 = cSize / 2;

  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(util.degreesToRadians(90 + fabricObject.angle));

  // Draw the yellow outline
  ctx.lineWidth = 6; // Total width for the outline (4 + 2)
  ctx.lineCap = "round";
  ctx.strokeStyle = "white"; // Yellow color for the outline
  ctx.beginPath();
  ctx.moveTo(-cSizeBy2, 0);
  ctx.lineTo(cSizeBy2, 0);
  ctx.stroke();

  // Draw the main line
  ctx.lineWidth = 4; // Width of the main line
  ctx.strokeStyle = "black"; // Color of the main line
  ctx.beginPath();
  ctx.moveTo(-cSizeBy2, 0);
  ctx.lineTo(cSizeBy2, 0);
  ctx.stroke();

  ctx.restore();
}

export function drawVerticalLeftIcon(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: FabricObject,
) {
  ctx.save();
  // draw handle
  ctx.restore();
}

export function drawVerticalRightIcon(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: FabricObject,
) {
  ctx.save();
  // draw handle
  ctx.restore();
}

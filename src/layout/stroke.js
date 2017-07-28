import rafThrottle from 'raf-throttle';

const devicePixelRatio = window.devicePixelRatio || 1;

/**
 * @param {HTMLElement} parent - The parent node.
 * @param {Document} options - Options.
 * @param {Document} [options.doc=document] - The root document. Mostly useful for testing purposes.
 * @param {number} options.lineWidth - The width of the stroke.
 * @param {string} options.lineColor - CSS representation of the stroke color.
 * @param {number} [options.startPointRadius=0] - The radius of the start point.
 * @param {number} [options.startPointColor=options.lineColor] - CSS representation of the start
 *                                                               point color.
 * @return {{ clear, setStroke, remove }} The canvas methods.
 */
export default (
  parent,
  {
    doc = document,
    lineWidth,
    lineColor,
    pointRadius = 0,
    pointColor = lineColor
  }
) => {
  // Create the canvas.
  const { width, height } = parent.getBoundingClientRect();
  const canvas = doc.createElement('canvas');
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  Object.assign(canvas.style, {
    position: 'absolute',
    left: 0,
    top: 0,
    width: `${width}px`,
    height: `${height}px`,
    'pointer-events': 'none'
  });
  parent.appendChild(canvas);

  // Get the canvas' context and set it up
  const ctx = canvas.getContext('2d');
  // Scale to the device pixel ratio.
  ctx.scale(devicePixelRatio, devicePixelRatio);

  /**
   * @param {number[]} point - Position of the point to draw.
   * @return {undefined}
   */
  const drawPoint = ([x, y]) => {
    ctx.save();
    ctx.strokeStyle = 'none';
    ctx.fillStyle = pointColor;
    ctx.beginPath();
    ctx.moveTo(x + pointRadius, y);
    ctx.arc(x, y, pointRadius, 0, 360);
    ctx.fill();
    ctx.restore();
  };

  /**
   * Clear the canvas.
   *
   * @return {undefined}
   */
  const clear = () => {
    ctx.clearRect(0, 0, width, height);
  };

  /**
   * Draw the stroke.
   *
   * @param {List<number[]>} stroke - The new stroke.
   * @return {undefined}
   */
  const drawStroke = rafThrottle(stroke => {
    ctx.save();
    ctx.fillStyle = 'none';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    stroke.forEach((point, i) => {
      if (i === 0) ctx.moveTo(...point);
      else ctx.lineTo(...point);
    });
    ctx.stroke();
    ctx.restore();
  });

  /**
   * Destroy the canvas.
   * @return {undefined}
   */
  const remove = () => {
    canvas.remove();
  };

  return { clear, drawStroke, drawPoint, remove };
};
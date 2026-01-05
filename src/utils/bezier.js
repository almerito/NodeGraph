/**
 * Calculate Bezier curve path between two points
 * @param {object} start - Start point {x, y}
 * @param {object} end - End point {x, y}
 * @param {string} startOrientation - 'horizontal' or 'vertical'
 * @param {string} endOrientation - 'horizontal' or 'vertical'
 * @returns {string} SVG path d attribute
 */
export function calculateBezierPath(start, end, startOrientation = 'horizontal', endOrientation = 'horizontal') {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    let cp1x, cp1y, cp2x, cp2y;

    // Calculate control points based on orientation
    const curvature = Math.min(Math.abs(dx) / 2, Math.abs(dy) / 2, 100);
    const minCurvature = 50;
    const offset = Math.max(curvature, minCurvature);

    if (startOrientation === 'horizontal') {
        cp1x = start.x + offset;
        cp1y = start.y;
    } else {
        cp1x = start.x;
        cp1y = start.y + offset;
    }

    if (endOrientation === 'horizontal') {
        cp2x = end.x - offset;
        cp2y = end.y;
    } else {
        cp2x = end.x;
        cp2y = end.y - offset;
    }

    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
}

/**
 * Calculate the midpoint of a Bezier curve
 * @param {object} start - Start point {x, y}
 * @param {object} end - End point {x, y}
 * @returns {object} Midpoint {x, y}
 */
export function getBezierMidpoint(start, end) {
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    };
}

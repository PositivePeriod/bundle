function range(n) {
    return [...Array(n).keys()];
}

function Array2D(width, height, fill = () => null) {
    return Array.from(Array(width), () => new Array(height).fill(fill()));
}

module.exports = { range, Array2D };

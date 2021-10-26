/* eslint-disable max-len */
const fs = require("fs");

const write = (name, content) => { fs.writeFile(`code\\static\\assets\\prac\\${name}.svg`, content, () => { console.log(`Update SVG file ${name}`); }); };
const svg = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}"><g stroke-linecap="round" stroke-width="15" stroke-linejoin="round" stroke="#000000">${content}</g></svg>`;
const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
const rect = (x, y, width, height) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#FFFFFF"></rect>`;
const trans = (x, y, scx, scy, width, height) => [Math.round(width * 0.5 + (x - width * 0.5) * scx), Math.round(height * 0.5 + (y - height * 0.5) * scy)];

function make(name, points, ratio) {
    const [width, height] = [600, 600];
    let content = "";
    // content += rect(0, 0, width, height);
    for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        const [trx1, try1] = trans(x1, y1, ratio, ratio, width, height);
        const [trx2, try2] = trans(x2, y2, ratio, ratio, width, height);
        content += line(trx1, try1, trx2, try2);
    }
    const fileContent = svg(width, height, content);
    write(name, fileContent);
}

function svg1() {
    const points = [
        [300, 0], [200, 200], [0, 300], [200, 400],
        [300, 600], [400, 400], [600, 300], [400, 200],
    ];
    const ratio = 0.8;
    make("OrthogonalPawn", points, ratio);
}

function svg2() {
    const points = [
        [300, 100], [0, 0], [100, 300], [0, 600],
        [300, 500], [600, 600], [500, 300], [600, 0]];
    const ratio = 0.6;
    make("DiagonalPawn", points, ratio);
}

function svg3() {
    const points = [
        [300, 0], [240, 160], [120, 120], [160, 240],
        [0, 300], [160, 360], [120, 480], [240, 440],
        [300, 600], [360, 440], [480, 480], [440, 360],
        [600, 300], [440, 240], [480, 120], [360, 160],
    ];
    const ratio = 0.8;
    make("AllPawn", points, ratio);
}

function svg4() {
    const points = [
        [300, 0], [200, 200], [0, 300], [300, 400], [600, 300], [400, 200],
    ];
    const ratio = 0.8;
    make("UpPawn", points, ratio);
}

svg1();
svg2();
svg3();
svg4();

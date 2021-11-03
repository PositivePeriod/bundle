"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* eslint-disable max-classes-per-file */
var BasePiece = require("./piece").BasePiece;
var Pawn = /** @class */ (function (_super) {
    __extends(Pawn, _super);
    function Pawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pawn.prototype.move = function () {
        var _this = this;
        var dir = Object.getPrototypeOf(this).constructor.dir;
        return __spreadArray([], dir, true).map(function (_a) {
            var dx = _a[0], dy = _a[1];
            return ({ from: [_this.x, _this.y], to: [_this.x + dx, _this.y + dy] });
        });
    };
    return Pawn;
}(BasePiece));
var UpPawn = /** @class */ (function (_super) {
    __extends(UpPawn, _super);
    function UpPawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UpPawn.dir = new Set([[-1, 0], [1, 0], [0, 1]]);
    return UpPawn;
}(Pawn));
var DownPawn = /** @class */ (function (_super) {
    __extends(DownPawn, _super);
    function DownPawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DownPawn.dir = new Set([[-1, 0], [1, 0], [0, -1]]);
    return DownPawn;
}(Pawn));
var OrthogonalPawn = /** @class */ (function (_super) {
    __extends(OrthogonalPawn, _super);
    function OrthogonalPawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OrthogonalPawn.dir = new Set([[-1, 0], [1, 0], [0, -1], [0, 1]]);
    return OrthogonalPawn;
}(Pawn));
var DiagonalPawn = /** @class */ (function (_super) {
    __extends(DiagonalPawn, _super);
    function DiagonalPawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DiagonalPawn.dir = new Set([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    return DiagonalPawn;
}(Pawn));
var AllPawn = /** @class */ (function (_super) {
    __extends(AllPawn, _super);
    function AllPawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AllPawn.dir = new Set([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]);
    return AllPawn;
}(Pawn));
module.exports = { Pawn: Pawn, UpPawn: UpPawn, DownPawn: DownPawn, OrthogonalPawn: OrthogonalPawn, DiagonalPawn: DiagonalPawn, AllPawn: AllPawn };

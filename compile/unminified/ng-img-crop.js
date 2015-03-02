/*!
 * ngImgCrop v0.3.1
 * https://github.com/alexk111/ngImgCrop
 *
 * Copyright (c) 2015 Alex Kaul
 * License: MIT
 *
 * Generated at Monday, March 2nd, 2015, 2:33:47 PM
 */
(function() {
'use strict';

var crop = angular.module('ngImgCrop', []);

crop.factory('cropAreaCircle', ['cropArea', function(CropArea) {
  var CropAreaCircle = function() {
    CropArea.apply(this, arguments);

    this._boxResizeBaseSize = 20;
    this._boxResizeNormalRatio = 0.9;
    this._boxResizeHoverRatio = 1.2;
    this._iconMoveNormalRatio = 0.9;
    this._iconMoveHoverRatio = 1.2;

    this._boxResizeNormalSize = this._boxResizeBaseSize*this._boxResizeNormalRatio;
    this._boxResizeHoverSize = this._boxResizeBaseSize*this._boxResizeHoverRatio;

    this._posDragStartX=0;
    this._posDragStartY=0;
    this._posResizeStartX=0;
    this._posResizeStartY=0;
    this._posResizeStartSize=0;

    this._boxResizeIsHover = false;
    this._areaIsHover = false;
    this._boxResizeIsDragging = false;
    this._areaIsDragging = false;
  };

  CropAreaCircle.prototype = new CropArea();

  CropAreaCircle.prototype._calcCirclePerimeterCoords=function(angleDegrees) {
    var hSize=this._size/2;
    var angleRadians=angleDegrees * (Math.PI / 180),
        circlePerimeterX=this._x + hSize * Math.cos(angleRadians),
        circlePerimeterY=this._y + hSize * Math.sin(angleRadians);
    return [circlePerimeterX, circlePerimeterY];
  };

  CropAreaCircle.prototype._calcResizeIconCenterCoords=function() {
    return this._calcCirclePerimeterCoords(-45);
  };

  CropAreaCircle.prototype._isCoordWithinArea=function(coord) {
    return Math.sqrt((coord[0]-this._x)*(coord[0]-this._x) + (coord[1]-this._y)*(coord[1]-this._y)) < this._size/2;
  };
  CropAreaCircle.prototype._isCoordWithinBoxResize=function(coord) {
    var resizeIconCenterCoords=this._calcResizeIconCenterCoords();
    var hSize=this._boxResizeHoverSize/2;
    return(coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
           coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
  };

  CropAreaCircle.prototype._drawArea=function(ctx,centerCoords,size){
    ctx.arc(centerCoords[0],centerCoords[1],size/2,0,2*Math.PI);
  };

  CropAreaCircle.prototype.draw=function() {
    CropArea.prototype.draw.apply(this, arguments);

    // draw move icon
    this._cropCanvas.drawIconMove([this._x,this._y], this._areaIsHover?this._iconMoveHoverRatio:this._iconMoveNormalRatio);

    // draw resize cubes
    this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover?this._boxResizeHoverRatio:this._boxResizeNormalRatio);
  };

  CropAreaCircle.prototype.processMouseMove=function(mouseCurX, mouseCurY) {
    var cursor='default';
    var res=false;

    this._boxResizeIsHover = false;
    this._areaIsHover = false;

    if (this._areaIsDragging) {
      this._x = mouseCurX - this._posDragStartX;
      this._y = mouseCurY - this._posDragStartY;
      this._areaIsHover = true;
      cursor='move';
      res=true;
      this._events.trigger('area-move');
    } else if (this._boxResizeIsDragging) {
        cursor = 'nesw-resize';
        var iFR, iFX, iFY;
        iFX = mouseCurX - this._posResizeStartX;
        iFY = this._posResizeStartY - mouseCurY;
        if(iFX>iFY) {
          iFR = this._posResizeStartSize + iFY*2;
        } else {
          iFR = this._posResizeStartSize + iFX*2;
        }

        this._size = Math.max(this._minSize, iFR);
        this._boxResizeIsHover = true;
        res=true;
        this._events.trigger('area-resize');
    } else if (this._isCoordWithinBoxResize([mouseCurX,mouseCurY])) {
        cursor = 'nesw-resize';
        this._areaIsHover = false;
        this._boxResizeIsHover = true;
        res=true;
    } else if(this._isCoordWithinArea([mouseCurX,mouseCurY])) {
        cursor = 'move';
        this._areaIsHover = true;
        res=true;
    }

    this._dontDragOutside();
    angular.element(this._ctx.canvas).css({'cursor': cursor});

    return res;
  };

  CropAreaCircle.prototype.processMouseDown=function(mouseDownX, mouseDownY) {
    if (this._isCoordWithinBoxResize([mouseDownX,mouseDownY])) {
      this._areaIsDragging = false;
      this._areaIsHover = false;
      this._boxResizeIsDragging = true;
      this._boxResizeIsHover = true;
      this._posResizeStartX=mouseDownX;
      this._posResizeStartY=mouseDownY;
      this._posResizeStartSize = this._size;
      this._events.trigger('area-resize-start');
    } else if (this._isCoordWithinArea([mouseDownX,mouseDownY])) {
      this._areaIsDragging = true;
      this._areaIsHover = true;
      this._boxResizeIsDragging = false;
      this._boxResizeIsHover = false;
      this._posDragStartX = mouseDownX - this._x;
      this._posDragStartY = mouseDownY - this._y;
      this._events.trigger('area-move-start');
    }
  };

  CropAreaCircle.prototype.processMouseUp=function(/*mouseUpX, mouseUpY*/) {
    if(this._areaIsDragging) {
      this._areaIsDragging = false;
      this._events.trigger('area-move-end');
    }
    if(this._boxResizeIsDragging) {
      this._boxResizeIsDragging = false;
      this._events.trigger('area-resize-end');
    }
    this._areaIsHover = false;
    this._boxResizeIsHover = false;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
  };

  return CropAreaCircle;
}]);



crop.factory('cropAreaRectangle', ['cropArea', function (CropArea) {
    var CropAreaRectangle = function () {
        CropArea.apply(this, arguments);

        this._resizeCtrlBaseRadius = 10;
        this._resizeCtrlNormalRatio = 0.75;
        this._resizeCtrlHoverRatio = 1;
        this._iconMoveNormalRatio = 0.9;
        this._iconMoveHoverRatio = 1.2;

        this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius * this._resizeCtrlNormalRatio;
        this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius * this._resizeCtrlHoverRatio;

        this._posDragStartX = 0;
        this._posDragStartY = 0;
        this._posResizeStartX = 0;
        this._posResizeStartY = 0;
        this._posResizeStartSize = {w: 0, h: 0};

        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;
        this._resizeCtrlIsDragging = -1;
        this._areaIsDragging = false;
    };

    CropAreaRectangle.prototype = new CropArea();

    // return a type string
    CropAreaRectangle.prototype.getType = function () {
        return 'rectangle';
    };

    CropAreaRectangle.prototype._calcRectangleCorners = function () {
        var size = this.getSize();
        var se = this.getSouthEastBound();
        return [
            [size.x, size.y], //northwest
            [se.x, size.y], //northeast
            [size.x, se.y], //southwest
            [se.x, se.y] //southeast
        ];
    };

    CropAreaRectangle.prototype._calcRectangleDimensions = function () {
        var size = this.getSize();
        var se = this.getSouthEastBound();
        return {
            left: size.x,
            top: size.y,
            right: se.x,
            bottom: se.y
        };
    };

    CropAreaRectangle.prototype._isCoordWithinArea = function (coord) {
        var rectangleDimensions = this._calcRectangleDimensions();
        return (coord[0] >= rectangleDimensions.left && coord[0] <= rectangleDimensions.right && coord[1] >= rectangleDimensions.top && coord[1] <= rectangleDimensions.bottom);
    };

    CropAreaRectangle.prototype._isCoordWithinResizeCtrl = function (coord) {
        var resizeIconsCenterCoords = this._calcRectangleCorners();
        var res = -1;
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
                coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
                res = i;
                break;
            }
        }
        return res;
    };

    CropAreaRectangle.prototype._drawArea = function (ctx, center, size) {
        ctx.rect(size.x, size.y, size.w, size.h);
    };

    CropAreaRectangle.prototype.draw = function () {
        CropArea.prototype.draw.apply(this, arguments);

        var center = this.getCenterPoint();
        // draw move icon
        this._cropCanvas.drawIconMove([center.x, center.y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

        // draw resize thumbs
        var resizeIconsCenterCoords = this._calcRectangleCorners();
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
        }
    };

    CropArea.prototype.setAspectRatio = function (ratio) {
        this._aspectRatio = ratio;
        this._minSize = this._processSize(this._minSize);
        this.setSize(this._minSize);
    };

    CropAreaRectangle.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
        var cursor = 'default';
        var res = false;

        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;

        if (this._areaIsDragging) {
            this.setCenterPoint({x: mouseCurX - this._posDragStartX,
                y: mouseCurY - this._posDragStartY});
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        } else if (this._resizeCtrlIsDragging > -1) {
            var s = this.getSize();
            var se = this.getSouthEastBound();
            var h = se.y - s.y;
            var w = se.x - s.x;

            switch (this._resizeCtrlIsDragging) {
                case 0: // Top Left
                    if (mouseCurY > s.y && h <= this._minSize.h) {
                        //moving down and at min
                        mouseCurY = s.y;
                    }
                    if (mouseCurX < 0) {
                        mouseCurX = 0;
                    }
                    if (mouseCurX > s.x && w <= this._minSize.w) {
                        //moving right and at min
                        mouseCurX = s.x;
                    }

                    if (this._aspectRatio !== null) {
                        h = (se.x - mouseCurX) / this._aspectRatio;
                        mouseCurY = se.y - h;
                    }
                    ;

                    this.setSizeByCorners({x: mouseCurX, y: mouseCurY}, {x: se.x, y: se.y});
                    cursor = 'nwse-resize';
                    break;
                case 1: // Top Right
                    if (mouseCurY > s.y && h <= this._minSize.h) {
                        //moving down and at min
                        mouseCurY = s.y;
                    }
                    if (mouseCurX > this._ctx.canvas.width) {
                        mouseCurX = this._ctx.canvas.width;
                    }
                    if (mouseCurX < se.x && w <= this._minSize.w) {
                        //moving left and at min
                        mouseCurX = se.x;
                    }
                    if (this._aspectRatio !== null) {
                        h = (mouseCurX - s.x) / this._aspectRatio;
                        mouseCurY = se.y - h;
                    }
                    this.setSizeByCorners({x: s.x, y: mouseCurY}, {x: mouseCurX, y: se.y});
                    cursor = 'nesw-resize';
                    break;
                case 2: // Bottom Left
                    if (mouseCurY < se.y && h <= this._minSize.h) {
                        //moving up and at min
                        mouseCurY = se.y;
                    }
                    if (mouseCurX < 0) {
                        mouseCurX = 0;
                    }
                    if (mouseCurX > s.x && w <= this._minSize.w) {
                        //moving right and at min
                        mouseCurX = s.x;
                    }
                    if (this._aspectRatio !== null) {
                        h = (se.x - mouseCurX) / this._aspectRatio;
                        mouseCurY = s.y + h;
                    }

                    this.setSizeByCorners({x: mouseCurX, y: s.y}, {x: se.x, y: mouseCurY});
                    cursor = 'nesw-resize';
                    break;
                case 3: // Bottom Right
                    if (mouseCurY < se.y && h <= this._minSize.h) {
                        //moving up and at min
                        mouseCurY = se.y;
                    }
                    if (mouseCurX > this._ctx.canvas.width) {
                        mouseCurX = this._ctx.canvas.width;
                    }
                    if (mouseCurX < se.x && w <= this._minSize.w) {
                        //moving left and at min
                        mouseCurX = se.x;
                    }
                    if (this._aspectRatio !== null) {
                        h = (mouseCurX - s.x) / this._aspectRatio;
                        mouseCurY = se.y - h;
                    }
                    this.setSizeByCorners({x: s.x, y: s.y}, {x: mouseCurX, y: mouseCurY});
                    cursor = 'nwse-resize';
                    break;
            }

            this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
            res = true;
            this._events.trigger('area-resize');
        } else {
            var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
            if (hoveredResizeBox > -1) {
                switch (hoveredResizeBox) {
                    case 0:
                        cursor = 'nwse-resize';
                        break;
                    case 1:
                        cursor = 'nesw-resize';
                        break;
                    case 2:
                        cursor = 'nesw-resize';
                        break;
                    case 3:
                        cursor = 'nwse-resize';
                        break;
                }
                this._areaIsHover = false;
                this._resizeCtrlIsHover = hoveredResizeBox;
                res = true;
            } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res = true;
            }
        }

        angular.element(this._ctx.canvas).css({'cursor': cursor});

        return res;
    };

    CropAreaRectangle.prototype.processMouseDown = function (mouseDownX, mouseDownY) {
        var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
        if (isWithinResizeCtrl > -1) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._resizeCtrlIsDragging = isWithinResizeCtrl;
            this._resizeCtrlIsHover = isWithinResizeCtrl;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._resizeCtrlIsDragging = -1;
            this._resizeCtrlIsHover = -1;
            var center = this.getCenterPoint();
            this._posDragStartX = mouseDownX - center.x;
            this._posDragStartY = mouseDownY - center.y;
            this._events.trigger('area-move-start');
        }
    };

    CropAreaRectangle.prototype.processMouseUp = function (/*mouseUpX, mouseUpY*/) {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._resizeCtrlIsDragging > -1) {
            this._resizeCtrlIsDragging = -1;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = -1;

        this._posDragStartX = 0;
        this._posDragStartY = 0;
    };

    return CropAreaRectangle;
}]);


crop.factory('cropAreaSquare', ['cropArea', 'cropAreaRectangle', function (CropArea, CropAreaRectangle) {
    var CropAreaSquare = function () {
        CropAreaRectangle.apply(this, arguments);
    };

    CropAreaSquare.prototype = new CropAreaRectangle();

    // return a type string
    CropAreaSquare.prototype.getType = function () {
        return 'square';
    }

    // override rectangle's mouse move method
    CropAreaSquare.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
        var cursor = 'default';
        var res = false;

        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;

        if (this._areaIsDragging) {
            this.setCenterPoint({x: mouseCurX - this._posDragStartX,
                y: mouseCurY - this._posDragStartY});
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        } else if (this._resizeCtrlIsDragging > -1) {
            var xMulti, yMulti;
            switch (this._resizeCtrlIsDragging) {
                case 0: // Top Left
                    xMulti = -1;
                    yMulti = -1;
                    cursor = 'nwse-resize';
                    break;
                case 1: // Top Right
                    xMulti = 1;
                    yMulti = -1;
                    cursor = 'nesw-resize';
                    break;
                case 2: // Bottom Left
                    xMulti = -1;
                    yMulti = 1;
                    cursor = 'nesw-resize';
                    break;
                case 3: // Bottom Right
                    xMulti = 1;
                    yMulti = 1;
                    cursor = 'nwse-resize';
                    break;
            }
            var iFX = (mouseCurX - this._posResizeStartX) * xMulti;
            var iFY = (mouseCurY - this._posResizeStartY) * yMulti;
            var iFR;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize.w + iFY;
            } else {
                iFR = this._posResizeStartSize.h + iFX;
            }
            var prevCenter = this.getCenterPoint();

            this.setSize(Math.max(this._minSize.w, iFR));

            //recenter
            this.setCenterPoint(prevCenter);
            this._resizeCtrlIsHover = this._resizeCtrlIsDragging;

            res = true;
            this._events.trigger('area-resize');
        } else {
            var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
            if (hoveredResizeBox > -1) {
                switch (hoveredResizeBox) {
                    case 0:
                        cursor = 'nwse-resize';
                        break;
                    case 1:
                        cursor = 'nesw-resize';
                        break;
                    case 2:
                        cursor = 'nesw-resize';
                        break;
                    case 3:
                        cursor = 'nwse-resize';
                        break;
                }
                this._areaIsHover = false;
                this._resizeCtrlIsHover = hoveredResizeBox;
                res = true;
            } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res = true;
            }
        }

//    this._dontDragOutside();
        angular.element(this._ctx.canvas).css({'cursor': cursor});

        return res;
    };

    return CropAreaSquare;
}]);

crop.factory('cropArea', ['cropCanvas', function (CropCanvas) {
    var CropArea = function (ctx, events) {
        this._ctx = ctx;
        this._events = events;

        this._aspectRatio = null;
        this._minSize = {x: 0, y: 0, w: 80, h: 80};

        this._cropCanvas = new CropCanvas(ctx);

        this._image = new Image();
        this._x = 0;
        this._y = 0;
        this._size = {x: 0, y: 0, w: 200, h: 200};
    };

    /* GETTERS/SETTERS */

    CropArea.prototype.getImage = function () {
        return this._image;
    };
    CropArea.prototype.setImage = function (image) {
        this._image = image;
    };

    CropArea.prototype.getSize = function () {
        return this._size;
    };

    CropArea.prototype.getX = function () {
        return this._x;
    };
    CropArea.prototype.setX = function (x) {
        this._x = x;
        //this._dontDragOutside();
    };

    CropArea.prototype.getY = function () {
        return this._y;
    };
    CropArea.prototype.setY = function (y) {
        this._y = y;
        //this._dontDragOutside();
    };

    CropArea.prototype.getSize = function () {
        return this._size;
    };
    CropArea.prototype.setSize = function (size) {
        size = this._processSize(size);
        if(this._aspectRatio) {
            size.h = size.w / this._aspectRatio;
        }
        this._size = this._preventBoundaryCollision(size);
    };

    CropArea.prototype.setSizeByCorners = function (northWestCorner, southEastCorner) {

        var size = {x: northWestCorner.x,
            y: northWestCorner.y,
            w: southEastCorner.x - northWestCorner.x,
            h: southEastCorner.y - northWestCorner.y};
        this.setSize(size);
    };

    CropArea.prototype.getSouthEastBound = function () {
        return this._southEastBound(this.getSize());
    };

    CropArea.prototype.getPosition = function () {
        return this._size;
    };

    CropArea.prototype.getMinSize = function () {
        return this._minSize;
    };

    CropArea.prototype.getCenterPoint = function () {
        var s = this.getSize();
        return {x: s.x + (s.w / 2),
            y: s.y + (s.h / 2) };
    };

    CropArea.prototype.setCenterPoint = function (point) {
        var s = this.getSize();
        this.setSize({x: point.x - s.w / 2, y: point.y - s.h / 2, w: s.w, h: s.h});
        this._events.trigger('area-resize');
        this._events.trigger('area-move');
    };

    CropArea.prototype.setMinSize = function (size) {
        this._minSize = this._processSize(size);
        this.setSize(this._minSize);
        //not sure we need to set this?
//        this._dontDragOutside();
    };

    /* FUNCTIONS */
    CropArea.prototype._dontDragOutside = function () {
        var h = this._ctx.canvas.height,
            w = this._ctx.canvas.width;
        if (this._size > w) {
            this._size = w;
        }
        if (this._size > h) {
            this._size = h;
        }
        if (this._x < this._size / 2) {
            this._x = this._size / 2;
        }
        if (this._x > w - this._size / 2) {
            this._x = w - this._size / 2;
        }
        if (this._y < this._size / 2) {
            this._y = this._size / 2;
        }
        if (this._y > h - this._size / 2) {
            this._y = h - this._size / 2;
        }
    };

    CropArea.prototype._preventBoundaryCollision = function (size) {
        var canvasH = this._ctx.canvas.height,
            canvasW = this._ctx.canvas.width;

        if (this._areaIsDragging) {
            if (size.x < 0) size.x = 0;
            if (size.y < 0) size.y = 0;
            if (size.x + size.w > canvasW) size.x = canvasW - size.w;
            if (size.y + size.h > canvasH) size.y = canvasH - size.h;
            return size;
        }

        var nw = {x: size.x, y: size.y};
        var se = this._southEastBound(size);

        // check northwest corner
        if (nw.x < 0) {
            nw.x = 0;
        }
        if (nw.y < 0) {
            nw.y = 0;
        }

        // check southeast corner
        if (se.x > canvasW) {
            se.x = canvasW
        }
        if (se.y > canvasH) {
            se.y = canvasH
        }

        var newSize = {x: nw.x,
            y: nw.y,
            w: se.x - nw.x,
            h: se.y - nw.y};

        //finally, enforce 1:1 aspect ratio for square-like selections
        var areaType = this.getType();
        if (areaType === "circle" || areaType === "square") {
            newSize = {x: newSize.x,
                y: newSize.y,
                w: Math.min(newSize.w, newSize.h),
                h: Math.min(newSize.w, newSize.h)};
        }
        //allow to set a user-defined aspect ratio for rectangles
        else if (areaType === "rectangle" && this._aspectRatio !== null) {
            var heightWithRatio = newSize.w / this._aspectRatio;
            if (heightWithRatio < canvasH && se.y < canvasH) {
            }
            else {
                if ((newSize.h * this._aspectRatio) <= canvasW) {
                    newSize.w = newSize.h * this._aspectRatio;
                }
                else {
                    newSize.h = newSize.w / this._aspectRatio;
                }
            }
        }

        return newSize;
    };

    CropArea.prototype._drawArea = function () {
    };

    CropArea.prototype._processSize = function (size) {
        // make this polymorphic to accept a single floating point number
        // for square-like sizes (including circle)
        if (typeof size == "number") {
            size = {
                w: size,
                h: size
            };
        }

        return {
            x: size.x || this._minSize.x,
            y: size.y || this._minSize.y,
            w: size.w || this._minSize.w,
            h: size.h || this._minSize.h
        };
    };

    CropArea.prototype._southEastBound = function (size) {
        return {x: size.x + size.w, y: size.y + size.h};
    };

    CropArea.prototype.draw = function () {
        // draw crop area
        this._cropCanvas.drawCropArea(this._image, this.getCenterPoint(), this._size, this._drawArea);
    };

    CropArea.prototype.processMouseMove = function () {
    };

    CropArea.prototype.processMouseDown = function () {
    };

    CropArea.prototype.processMouseUp = function () {
    };

    return CropArea;
}]);

crop.factory('cropCanvas', [function() {
  // Shape = Array of [x,y]; [0, 0] - center
  var shapeArrowNW=[[-0.5,-2],[-3,-4.5],[-0.5,-7],[-7,-7],[-7,-0.5],[-4.5,-3],[-2,-0.5]];
  var shapeArrowNE=[[0.5,-2],[3,-4.5],[0.5,-7],[7,-7],[7,-0.5],[4.5,-3],[2,-0.5]];
  var shapeArrowSW=[[-0.5,2],[-3,4.5],[-0.5,7],[-7,7],[-7,0.5],[-4.5,3],[-2,0.5]];
  var shapeArrowSE=[[0.5,2],[3,4.5],[0.5,7],[7,7],[7,0.5],[4.5,3],[2,0.5]];
  var shapeArrowN=[[-1.5,-2.5],[-1.5,-6],[-5,-6],[0,-11],[5,-6],[1.5,-6],[1.5,-2.5]];
  var shapeArrowW=[[-2.5,-1.5],[-6,-1.5],[-6,-5],[-11,0],[-6,5],[-6,1.5],[-2.5,1.5]];
  var shapeArrowS=[[-1.5,2.5],[-1.5,6],[-5,6],[0,11],[5,6],[1.5,6],[1.5,2.5]];
  var shapeArrowE=[[2.5,-1.5],[6,-1.5],[6,-5],[11,0],[6,5],[6,1.5],[2.5,1.5]];

  // Colors
  var colors={
    areaOutline: '#fff',
    resizeBoxStroke: '#fff',
    resizeBoxFill: '#444',
    resizeBoxArrowFill: '#fff',
    resizeCircleStroke: '#fff',
    resizeCircleFill: '#444',
    moveIconFill: '#fff'
  };

  return function(ctx){

    /* Base functions */

    // Calculate Point
    var calcPoint=function(point,offset,scale) {
        return [scale*point[0]+offset[0], scale*point[1]+offset[1]];
    };

    // Draw Filled Polygon
    var drawFilledPolygon=function(shape,fillStyle,centerCoords,scale) {
        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        var pc, pc0=calcPoint(shape[0],centerCoords,scale);
        ctx.moveTo(pc0[0],pc0[1]);

        for(var p in shape) {
            if (p > 0) {
                pc=calcPoint(shape[p],centerCoords,scale);
                ctx.lineTo(pc[0],pc[1]);
            }
        }

        ctx.lineTo(pc0[0],pc0[1]);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    };

    /* Icons */

    this.drawIconMove=function(centerCoords, scale) {
      drawFilledPolygon(shapeArrowN, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowW, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowS, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowE, colors.moveIconFill, centerCoords, scale);
    };

    this.drawIconResizeCircle=function(centerCoords, circleRadius, scale) {
      var scaledCircleRadius=circleRadius*scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeCircleStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeCircleFill;
      ctx.beginPath();
      ctx.arc(centerCoords[0],centerCoords[1],scaledCircleRadius,0,2*Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    this.drawIconResizeBoxBase=function(centerCoords, boxSize, scale) {
      var scaledBoxSize=boxSize*scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeBoxStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeBoxFill;
      ctx.fillRect(centerCoords[0] - scaledBoxSize/2, centerCoords[1] - scaledBoxSize/2, scaledBoxSize, scaledBoxSize);
      ctx.strokeRect(centerCoords[0] - scaledBoxSize/2, centerCoords[1] - scaledBoxSize/2, scaledBoxSize, scaledBoxSize);
      ctx.restore();
    };
    this.drawIconResizeBoxNESW=function(centerCoords, boxSize, scale) {
      this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
      drawFilledPolygon(shapeArrowNE, colors.resizeBoxArrowFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowSW, colors.resizeBoxArrowFill, centerCoords, scale);
    };
    this.drawIconResizeBoxNWSE=function(centerCoords, boxSize, scale) {
      this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
      drawFilledPolygon(shapeArrowNW, colors.resizeBoxArrowFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowSE, colors.resizeBoxArrowFill, centerCoords, scale);
    };

    /* Crop Area */

    this.drawCropArea=function(image, centerCoords, size, fnDrawClipPath) {
      var xRatio=image.width/ctx.canvas.width,
          yRatio=image.height/ctx.canvas.height,
          xLeft=size.x,
          yTop=size.y;

      ctx.save();
      ctx.strokeStyle = colors.areaOutline;
      ctx.lineWidth = 2;
      ctx.beginPath();
      fnDrawClipPath(ctx, centerCoords, size);
      ctx.stroke();
      ctx.clip();

      // draw part of original image
      if (size.w > 0 && size.w > 0) {
          ctx.drawImage(image, xLeft*xRatio, yTop*yRatio, size.w*xRatio, size.h*yRatio, xLeft, yTop, size.w, size.h);
      }

      ctx.beginPath();
      fnDrawClipPath(ctx, centerCoords, size);
      ctx.stroke();
      ctx.clip();

      ctx.restore();
    };

  };
}]);

crop.factory('cropHost', ['$document', 'cropAreaCircle', 'cropAreaSquare', 'cropAreaRectangle', function ($document, CropAreaCircle, CropAreaSquare, CropAreaRectangle) {
    /* STATIC FUNCTIONS */

    // Get Element's Offset
    var getElementOffset = function (elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) };
    };

    return function (elCanvas, opts, events) {
        /* PRIVATE VARIABLES */

        // Object Pointers
        var ctx = null,
            image = null,
            theArea = null,
            self = this;

        // Dimensions
        var minCanvasDims = [100, 100],
            maxCanvasDims = [300, 300];

        // Result Image size
        var resImgSize = {w: 200, h: 200};

        // Result Image type
        var resImgFormat = 'image/png';

        // Result Image quality
        var resImgQuality = null;

        /* PRIVATE FUNCTIONS */

        // Draw Scene
        function drawScene() {
            // clear canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            if (image !== null) {
                // draw source image
                ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.save();

                // and make it darker
                ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.restore();

                // draw Area
                theArea.draw();
            }
        }

        // Resets CropHost
        var resetCropHost = function () {
            if (image !== null) {
                theArea.setImage(image);
                var imageDims = [image.width, image.height],
                    imageRatio = image.width / image.height,
                    canvasDims = imageDims;

                if (canvasDims[0] > maxCanvasDims[0]) {
                    canvasDims[0] = maxCanvasDims[0];
                    canvasDims[1] = canvasDims[0] / imageRatio;
                } else if (canvasDims[0] < minCanvasDims[0]) {
                    canvasDims[0] = minCanvasDims[0];
                    canvasDims[1] = canvasDims[0] / imageRatio;
                }
                if (canvasDims[1] > maxCanvasDims[1]) {
                    canvasDims[1] = maxCanvasDims[1];
                    canvasDims[0] = canvasDims[1] * imageRatio;
                } else if (canvasDims[1] < minCanvasDims[1]) {
                    canvasDims[1] = minCanvasDims[1];
                    canvasDims[0] = canvasDims[1] * imageRatio;
                }
                elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({'margin-left': -canvasDims[0] / 2 + 'px', 'margin-top': -canvasDims[1] / 2 + 'px'});

                var cw = ctx.canvas.width;
                var ch = ctx.canvas.height;

                var areaType = self.getAreaType();
                // enforce 1:1 aspect ratio for square-like selections
                if ((areaType === 'circle') || (areaType === 'square')) {
                    cw = ch = Math.min(cw, ch);
                }
                //allow to set a user-defined aspect ratio for rectangles
                else if (areaType === "rectangle" && theArea._aspectRatio !== null) {
                    ch = cw / theArea._aspectRatio;
                }

                theArea.setSize({ w: Math.min(200, cw / 2), h: Math.min(200, ch / 2)});
                //TODO: set top left corner point
                theArea.setCenterPoint({x: ctx.canvas.width / 2, y: ctx.canvas.height / 2});

            } else {
                elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
            }

            drawScene();
        };

        /**
         * Returns event.changedTouches directly if event is a TouchEvent.
         * If event is a jQuery event, return changedTouches of event.originalEvent
         */
        var getChangedTouches = function (event) {
            if (angular.isDefined(event.changedTouches)) {
                return event.changedTouches;
            } else {
                return event.originalEvent.changedTouches;
            }
        };

        var onMouseMove = function (e) {
            if (image !== null) {
                var offset = getElementOffset(ctx.canvas),
                    pageX, pageY;
                if (e.type === 'touchmove') {
                    pageX = getChangedTouches(e)[0].pageX;
                    pageY = getChangedTouches(e)[0].pageY;
                } else {
                    pageX = e.pageX;
                    pageY = e.pageY;
                }
                theArea.processMouseMove(pageX - offset.left, pageY - offset.top);
                drawScene();
            }
        };

        var onMouseDown = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (image !== null) {
                var offset = getElementOffset(ctx.canvas),
                    pageX, pageY;
                if (e.type === 'touchstart') {
                    pageX = getChangedTouches(e)[0].pageX;
                    pageY = getChangedTouches(e)[0].pageY;
                } else {
                    pageX = e.pageX;
                    pageY = e.pageY;
                }
                theArea.processMouseDown(pageX - offset.left, pageY - offset.top);
                drawScene();
            }
        };

        var onMouseUp = function (e) {
            if (image !== null) {
                var offset = getElementOffset(ctx.canvas),
                    pageX, pageY;
                if (e.type === 'touchend') {
                    pageX = getChangedTouches(e)[0].pageX;
                    pageY = getChangedTouches(e)[0].pageY;
                } else {
                    pageX = e.pageX;
                    pageY = e.pageY;
                }
                theArea.processMouseUp(pageX - offset.left, pageY - offset.top);
                drawScene();
            }
        };

        this.getResultImageDataURI = function () {
            var temp_ctx, temp_canvas;
            temp_canvas = angular.element('<canvas></canvas>')[0];
            temp_ctx = temp_canvas.getContext('2d');
            var ris = this.getResultImageSize();
            temp_canvas.width = ris.w;
            temp_canvas.height = ris.h;
            var center = theArea.getCenterPoint();
            if (image !== null) {
                temp_ctx.drawImage(image, (center.x - theArea.getSize().w / 2) * (image.width / ctx.canvas.width), (center.y - theArea.getSize().h / 2) * (image.height / ctx.canvas.height), theArea.getSize().w * (image.width / ctx.canvas.width), theArea.getSize().h * (image.height / ctx.canvas.height), 0, 0, ris.w, ris.h);
            }
            if (resImgQuality !== null) {
                return temp_canvas.toDataURL(resImgFormat, resImgQuality);
            }
            return temp_canvas.toDataURL(resImgFormat);
        };

        this.getAreaCoords = function () {
            return theArea.getPosition()
        };

        this.setNewImageSource = function (imageSource) {
            image = null;
            resetCropHost();
            events.trigger('image-updated');
            if (!!imageSource) {
                var newImage = new Image();
                if (imageSource.substring(0, 4).toLowerCase() === 'http') {
                    newImage.crossOrigin = 'anonymous';
                }
                newImage.onload = function () {
                    events.trigger('load-done');
                    image = newImage;
                    resetCropHost();
                    events.trigger('image-updated');
                };
                newImage.onerror = function () {
                    events.trigger('load-error');
                };
                events.trigger('load-start');
                newImage.src = imageSource;
            }
        };

        this.setMaxDimensions = function (width, height) {
            maxCanvasDims = [width, height];

            if (image !== null) {
                var curWidth = ctx.canvas.width,
                    curHeight = ctx.canvas.height;

                var imageDims = [image.width, image.height],
                    imageRatio = image.width / image.height,
                    canvasDims = imageDims;

                if (canvasDims[0] > maxCanvasDims[0]) {
                    canvasDims[0] = maxCanvasDims[0];
                    canvasDims[1] = canvasDims[0] / imageRatio;
                } else if (canvasDims[0] < minCanvasDims[0]) {
                    canvasDims[0] = minCanvasDims[0];
                    canvasDims[1] = canvasDims[0] / imageRatio;
                }
                if (canvasDims[1] > maxCanvasDims[1]) {
                    canvasDims[1] = maxCanvasDims[1];
                    canvasDims[0] = canvasDims[1] * imageRatio;
                } else if (canvasDims[1] < minCanvasDims[1]) {
                    canvasDims[1] = minCanvasDims[1];
                    canvasDims[0] = canvasDims[1] * imageRatio;
                }
                elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({'margin-left': -canvasDims[0] / 2 + 'px', 'margin-top': -canvasDims[1] / 2 + 'px'});

                var ratioNewCurWidth = ctx.canvas.width / curWidth,
                    ratioNewCurHeight = ctx.canvas.height / curHeight,
                    ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);

                var center = theArea.getCenterPoint();
                theArea.setSize({w: theArea.getSize().w * ratioNewCurWidth, h: theArea.getSize().h * ratioNewCurHeight});
                theArea.setCenterPoint({x: center.x * ratioNewCurWidth, y: center.y * ratioNewCurHeight});
            } else {
                elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
            }

            drawScene();
        };

        this.setAspectRatio = function (ratio) {
            ratio = parseFloat(ratio);
            if (!isNaN(ratio)) {
                theArea.setAspectRatio(ratio);
            } else {
                theArea.setAspectRatio(null);
            }
            drawScene();
        };

        this.setCanvasSize = function (dimensions) {
            maxCanvasDims = dimensions;
            minCanvasDims = dimensions;
            resetCropHost();
        };

        this.setAreaMinSize = function (size) {
            if (angular.isUndefined(size)) {
                return;
            }
            size = {w: parseInt(size.w, 10),
                h: parseInt(size.h, 10)};
            if (!isNaN(size.w) && !isNaN(size.h)) {
            }
        };

        this.getResultImageSize = function () {
            if (resImgSize == "selection") {
                return theArea.getSize();
            }
            return resImgSize;
        };

        this.setResultImageSize = function (size) {
            if (angular.isUndefined(size)) {
                return;
            }

            //allow setting of size to "selection" for mirroring selection's dimensions
            if (angular.isString(size) && isNaN(parseFloat(size))) {
                resImgSize = size;
                return;
            }

            //allow scalar values for square-like selection shapes
            var parsedSize = parseInt(size, 10);
            if (!isNaN(parsedSize)) {
                size = {w: parsedSize,
                    h: parsedSize};
            } else {
                size = {w: parseInt(size.w, 10),
                    h: parseInt(size.h, 10)};
            }

            if (!isNaN(size.w) && !isNaN(size.h)) {
                resImgSize = size;
                drawScene();
            }
        };

        // returns a string of the selection area's type
        this.getAreaType = function () {
            return theArea.getType();
        };

        this.setResultImageFormat = function (format) {
            resImgFormat = format;
        };

        this.setResultImageQuality = function (quality) {
            quality = parseFloat(quality);
            if (!isNaN(quality) && quality >= 0 && quality <= 1) {
                resImgQuality = quality;
            }
        };

        this.setAreaType = function (type) {
            var center = theArea.getCenterPoint();
            var curSize = theArea.getSize(),
                curMinSize = theArea.getMinSize(),
                curX = center.x,
                curY = center.y;

            var AreaClass = CropAreaCircle;
            if (type === 'square') {
                AreaClass = CropAreaSquare;
            } else if (type === 'rectangle') {
                AreaClass = CropAreaRectangle;
            }
            theArea = new AreaClass(ctx, events);
            theArea.setMinSize(curMinSize);
            theArea.setSize(curSize);

            //TODO: use top left point
            theArea.setCenterPoint({x: curX, y: curY});

            // resetCropHost();
            if (image !== null) {
                theArea.setImage(image);
            }

            drawScene();
        };

        /* Life Cycle begins */

        // Init Context var
        ctx = elCanvas[0].getContext('2d');

        // Init CropArea
        theArea = new CropAreaCircle(ctx, events);

        // Init Mouse Event Listeners
        $document.on('mousemove', onMouseMove);
        elCanvas.on('mousedown', onMouseDown);
        $document.on('mouseup', onMouseUp);

        // Init Touch Event Listeners
        $document.on('touchmove', onMouseMove);
        elCanvas.on('touchstart', onMouseDown);
        $document.on('touchend', onMouseUp);

        // CropHost Destructor
        this.destroy = function () {
            $document.off('mousemove', onMouseMove);
            elCanvas.off('mousedown', onMouseDown);
            $document.off('mouseup', onMouseMove);

            $document.off('touchmove', onMouseMove);
            elCanvas.off('touchstart', onMouseDown);
            $document.off('touchend', onMouseMove);

            elCanvas.remove();
        };
    };

}]);


crop.factory('cropPubSub', [function() {
  return function() {
    var events = {};
    // Subscribe
    this.on = function(names, handler) {
      names.split(' ').forEach(function(name) {
        if (!events[name]) {
          events[name] = [];
        }
        events[name].push(handler);
      });
      return this;
    };
    // Publish
    this.trigger = function(name, args) {
      angular.forEach(events[name], function(handler) {
        handler.call(null, args);
      });
      return this;
    };
  };
}]);

crop.directive('imgCrop', ['$timeout', 'cropHost', 'cropPubSub', function ($timeout, CropHost, CropPubSub) {
    return {
        restrict: 'E',
        scope: {
            image: '=',
            resultImage: '=',

            changeOnFly: '=',
            areaCoords: '=',
            areaType: '@',
            aspectRatio: '=',
            areaMinSize: '=',
            resultImageSize: '=',
            resultImageFormat: '@',
            resultImageQuality: '=',
            canvasSize: '=',
            onChange: '&',
            onLoadBegin: '&',
            onLoadDone: '&',
            onLoadError: '&'
        },
        template: '<canvas></canvas>',
        controller: ['$scope', function ($scope) {
            $scope.events = new CropPubSub();
        }],
        link: function (scope, element/*, attrs*/) {
            // Init Events Manager
            var events = scope.events;

            // Init Crop Host
            var cropHost = new CropHost(element.find('canvas'), {}, events);

            // Store Result Image to check if it's changed
            var storedResultImage;

            var updateResultImage = function (scope) {
                updateAreaCoords(scope);
                var resultImage = cropHost.getResultImageDataURI();
                if (storedResultImage !== resultImage) {
                    storedResultImage = resultImage;
                    if (angular.isDefined(scope.resultImage)) {
                        scope.resultImage = resultImage;
                    }
                    scope.onChange({$dataURI: scope.resultImage});
                }
            };

            var updateAreaCoords = function (scope) {
                if (typeof scope.areaCoords != 'undefined') {
                    var areaCoords = cropHost.getAreaCoords();
                    scope.areaCoords = areaCoords;
                }
            };

            // Wrapper to safely exec functions within $apply on a running $digest cycle
            var fnSafeApply = function (fn) {
                return function () {
                    $timeout(function () {
                        scope.$apply(function (scope) {
                            fn(scope);
                        });
                    });
                };
            };

            // Setup CropHost Event Handlers
            events
                .on('load-start', fnSafeApply(function (scope) {
                    scope.onLoadBegin({});
                }))
                .on('load-done', fnSafeApply(function (scope) {
                    scope.onLoadDone({});
                }))
                .on('load-error', fnSafeApply(function (scope) {
                    scope.onLoadError({});
                }))
                .on('area-move area-resize', fnSafeApply(function (scope) {
                    if (!!scope.changeOnFly) {
                        updateResultImage(scope);
                    }
                }))
                .on('area-move-end area-resize-end image-updated', fnSafeApply(function (scope) {
                    updateResultImage(scope);
                }));

            // Sync CropHost with Directive's options
            scope.$watch('image', function () {
                cropHost.setNewImageSource(scope.image);
            });
            scope.$watch('areaType', function () {
                cropHost.setAreaType(scope.areaType);
                updateResultImage(scope);
            });
            scope.$watch('aspectRatio', function () {
                cropHost.setAspectRatio(scope.aspectRatio);
                updateResultImage(scope);
            });
            scope.$watch('areaMinSize', function () {
                cropHost.setAreaMinSize(scope.areaMinSize);
                updateResultImage(scope);
            });
            scope.$watch('resultImageSize', function () {
                cropHost.setResultImageSize(scope.resultImageSize);
                updateResultImage(scope);
            });
            scope.$watch('resultImageFormat', function () {
                cropHost.setResultImageFormat(scope.resultImageFormat);
                updateResultImage(scope);
            });
            scope.$watch('resultImageQuality', function () {
                cropHost.setResultImageQuality(scope.resultImageQuality);
                updateResultImage(scope);
            });

            scope.$watch('canvasSize', function (newVal, oldVal) {
                if (newVal) {
                    var update = false;
                    if (!oldVal) {
                        update = true;
                    }
                    else if (newVal[0] === oldVal[0] && newVal[1] === oldVal[1]) {
                        update = false;
                    }
                    else {
                        update = true;
                    }

                    if (update) {
                        cropHost.setCanvasSize(newVal);
                        updateResultImage(scope);
                    }
                }
            });

            // Update CropHost dimensions when the directive element is resized
            scope.$watch(
                function () {
                    return [element[0].clientWidth, element[0].clientHeight];
                },
                function (value) {
                    cropHost.setMaxDimensions(value[0], value[1]);
                    updateResultImage(scope);
                },
                true
            );

            // Destroy CropHost Instance when the directive is destroying
            scope.$on('$destroy', function () {
                cropHost.destroy();
            });
        }
    }
        ;
}])
;
}());
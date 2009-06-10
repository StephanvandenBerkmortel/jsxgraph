/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview The geometry object Point is defined in this file. Point stores all
 * style and functional properties that are required to draw and move a point on
 * a board.
 * @author graphjs
 * @version 0.1
 */

/**
 * Constructs a new Point object.
 * @class This is the Point class. 
 * It is derived from @see GeometryElement.
 * It stores all properties required
 * to move, draw a point.
 * @constructor
 * @param {String,JXG.Board} board The board the new point is drawn on.
 * @param {Array} coordinates An array with the affine user coordinates of the point.
 * @param {String} id Unique identifier for the point. If null or an empty string is given,
 *  an unique id will be generated by Board
 * @see JXG.Board#addPoint
 * @param {String} name Not necessarily unique name for the point. If null or an
 *  empty string is given, an unique name will be generated
 * @see JXG.Board#generateName
 * @param {bool} show False if the point is invisible, True otherwise
 */
JXG.Point = function (board, coordinates, id, name, show, withLabel) {
    this.constructor();
    
    /**
     * Type of point; Possible values are OBJECT_TYPE_POINT, OBJECT_TYPE_GLIDER, OBJECT_TYPE_CAS. Default is OBJECT_TYPE_POINT
     * @type int
     */
    this.type = JXG.OBJECT_TYPE_POINT;
    this.elementClass = JXG.OBJECT_CLASS_POINT;

    this.init(board, id, name);

    /**
     * Coordinates of the point.
     * @type JXG.Coords
     */
    if (coordinates==null) {
        coordinates=[0,0];
    }
    this.coords = new JXG.Coords(JXG.COORDS_BY_USER, coordinates, this.board);
    this.initialCoords = new JXG.Coords(JXG.COORDS_BY_USER, coordinates, this.board);
    
    /**
     * Descriptive character, displayed next to the point
     * @type JXG.Label
     */
    /*
    this.label = new JXG.Label(this.board, this.name, this.coords, this.id+"Label");
    this.label.show = show;
    if(!show) {
        this.label.hiddenByParent = true;
    }
    */

    /**
     * If true, the infobox is shown on mouse over, else not.
     * @type boolean
     */
    this.showInfobox = true;
    
    this.label = {};
    this.label.relativeCoords = [10,10];
    this.nameHTML = this.board.algebra.replaceSup(this.board.algebra.replaceSub(this.name)); //?
    if (typeof withLabel=='undefined' || withLabel==true) {
        this.board.objects[this.id] = this;
        this.label.content = new JXG.Text(this.board, this.nameHTML, this.id, 
            [this.label.relativeCoords[0]/(this.board.unitX*this.board.zoomX),this.label.relativeCoords[1]/(this.board.unitY*this.board.zoomY)], this.id+"Label", "", null, true);
        delete(this.board.objects[this.id]);

        this.label.color = '#000000';
        if(!show) {
            this.label.hiddenByParent = true;
            this.label.content.visProp['visible'] = false;
        }
        this.hasLabel = true;
    } else {
        this.showInfobox = false;
    }
    
    /**
     * False: Point can be moved, True: Point can't be move with the mouse.
     * @type bool
     */
    this.fixed = false;
    //this.baseElement = this; // default is free
    
    /**
     * Relative position on a line if point is a glider on a line.
     * @type float
     */
    this.position = null;

    /**
     * Determines whether the point slides on a polygon if point is a glider
     * @type boolean
     */
    this.onPolygon = false;
    
    /**
     * Point style.
     * Possible values are
     * <ul><li> 0 for a small x</li>
     * <li> 1 for a medium x</li>
     * <li> 2 for a big x</li>
     * <li> 3 for a tiny circle</li>
     * <li> 4 for a small circle</li>
     * <li> 5 for a medium circle </li>
     * <li> 6 for a big circle </li>
     * <li> 7 for a small rectangle </li>
     * <li> 8 for a medium rectangle </li>
     * <li> 9 for a big rectangle </li>
     * <li> 10 for a small +</li>
     * <li> 11 for a medium +</li>
     * <li> 12 for a big +</li>
     * @type int
     * @see #setStyle
     */
    this.visProp['style'] = this.board.options.point.style;

    /**
     * Size of the point. This is just for the renderer and the hasPoint() method
     * to draw the point as a circle.
     * @type int
     */
    this.r = this.board.options.precision.hasPoint;
    this.visProp['fillColor'] = this.board.options.point.fillColor;
    this.visProp['highlightFillColor'] = this.board.options.point.highlightFillColor;  
    this.visProp['strokeColor'] = this.board.options.point.strokeColor;
    this.visProp['highlightStrokeColor'] = this.board.options.point.highlightStrokeColor;        

    /**
     * True when this object is visible, false otherwise.
     * @type bool
     */
    this.visProp['visible'] = show; 

    /**
     * When used as a glider this member stores the object, where to slide on.
     * @type JXG.GeometryElement
     */
    this.slideObject = null;
    
    /**
     * Stores the groups of this point in an array of Group.
     * @type Array
     * @see JXG.Group
     */
    this.group = [];
    
    /* Register point at board. */
    this.id = this.board.addPoint(this);
};

/**
 * Inherits here from @see JXG.GeometryElement.
 */
JXG.Point.prototype = new JXG.GeometryElement();

/**
 * Checks whether (x,y) is near the point.
 * @param {int} x Coordinate in x direction, screen coordinates.
 * @param {int} y Coordinate in y direction, screen coordinates.
 * @return {bool} True if (x,y) is near the point, False otherwise.
 */
JXG.Point.prototype.hasPoint = function (x,y) {
    var coordsScr = this.coords.scrCoords;
    return ((Math.abs(coordsScr[1]-x) < this.r+2) && (Math.abs(coordsScr[2]-y)) < this.r+2);
};

/**
* Dummy function for unconstrained points or gliders.
* @private
*/

JXG.Point.prototype.updateConstraint = function() {}
/**
 * Updates the position of the point
 */
JXG.Point.prototype.update = function (fromParent) {
    if (!this.needsUpdate) { return; }

    if(typeof fromParent == 'undefined') {
        fromParent = false;
    }
  
    if(this.traced) {
        this.cloneToBackground(true);
    }

    /*
     * We need to calculate the new coordinates no matter of the points visibility because
     * a child could be visible and depend on the coordinates of the point (e.g. perpendicular).
     * 
     * Check if point is a glider and calculate new coords in dependency of this.slideObject.
     */
    if(this.type == JXG.OBJECT_TYPE_GLIDER) {
        if(this.slideObject.type == JXG.OBJECT_TYPE_CIRCLE) {
            if (fromParent) {
                this.coords.setCoordinates(JXG.COORDS_BY_USER, [this.slideObject.midpoint.X()+Math.cos(this.position),this.slideObject.midpoint.Y()+Math.sin(this.position)]);
                this.coords  = this.board.algebra.projectPointToCircle(this, this.slideObject);
            } else {
                this.coords  = this.board.algebra.projectPointToCircle(this, this.slideObject);
                this.position = this.board.algebra.rad([this.slideObject.midpoint.X()+1.0,this.slideObject.midpoint.Y()],this.slideObject.midpoint,this);
            }
        } else if(this.slideObject.type == JXG.OBJECT_TYPE_LINE) {
            this.coords  = this.board.algebra.projectPointToLine(this, this.slideObject);
            
            var p1coords = this.slideObject.point1.coords;
            var p2coords = this.slideObject.point2.coords;
            if (fromParent) {
                this.coords.setCoordinates(JXG.COORDS_BY_USER, 
                                           [p1coords.usrCoords[1] + this.position*(p2coords.usrCoords[1] - p1coords.usrCoords[1]),
                                            p1coords.usrCoords[2] + this.position*(p2coords.usrCoords[2] - p1coords.usrCoords[2])]);
            } else {
                var factor = 1;
                var distP1S = p1coords.distance(JXG.COORDS_BY_USER, this.coords);
                var distP1P2 = p1coords.distance(JXG.COORDS_BY_USER, p2coords);
                var distP2S = p2coords.distance(JXG.COORDS_BY_USER, this.coords);
                
                if( ((distP1S > distP1P2) || (distP2S > distP1P2)) && (distP1S < distP2S)) { // Glider not between P1 & P2 and beyond P1
                    factor = -1;
                }
                this.position = factor*distP1S/distP1P2;

                // Snap the glider point of the slider into its appropiate position
                // First, recalculate the new value of this.position
                // Second, call update(fromParent==true) to make the positioning snappier.
                if (this.snapWidth!=null && Math.abs(this._smax-this._smin)>=JXG.Math.eps) {
                    var v = Math.round(this.Value()/this.snapWidth)*this.snapWidth;
                    this.position = factor*(v-this._smin)/(this._smax-this._smin);
                    this.update(true);
                }
            }
            var p1Scr = this.slideObject.point1.coords.scrCoords;
            var p2Scr = this.slideObject.point2.coords.scrCoords;
            
            var i;
            if(this.slideObject.getSlope() == 0) {
                i = 1;
            } else {
                i = 2;
            }

            var y = this.coords.scrCoords[i];
            if(!this.slideObject.visProp['straightFirst']) {
                if(p1Scr[i] < p2Scr[i]) {
                    if(y < p1Scr[i]) {
                       this.coords = this.slideObject.point1.coords;
                       this.position = 0;
                    }
                }
                else if(p1Scr[i] > p2Scr[i]) {
                    if(y > p1Scr[i]) {
                       this.coords = this.slideObject.point1.coords;
                       this.position = 0;
                    }
                }
            }
            if(!this.slideObject.visProp['straightLast']) {
                if(p1Scr[i] < p2Scr[i]) {
                    if(y > p2Scr[i]) {
                       this.coords = this.slideObject.point2.coords;
                       this.position = 1;
                    }
                }
                else if(p1Scr[i] > p2Scr[i]) {
                    if(y < p2Scr[i]) {
                       this.coords = this.slideObject.point2.coords;
                       this.position = 1;
                    }
                }
            }  

            if(this.onPolygon) {
                var p1 = this.slideObject.point1.coords;
                var p2 = this.slideObject.point2.coords;
                if(Math.abs(this.coords.scrCoords[1]-p1.scrCoords[1])<this.r && Math.abs(this.coords.scrCoords[2]-p1.scrCoords[2])<this.r) {
                    var poly = this.slideObject.parentPolygon;
                    for(var i=0; i<poly.borders.length; i++) {
                        if(this.slideObject == poly.borders[i]) {
                            this.slideObject = poly.borders[(i - 1 + poly.borders.length) % poly.borders.length];
                            break;
                        }
                    }
                }
                else if(Math.abs(this.coords.scrCoords[1]-p2.scrCoords[1])<this.r && Math.abs(this.coords.scrCoords[2]-p2.scrCoords[2])<this.r) {
                    var poly = this.slideObject.parentPolygon;
                    for(var i=0; i<poly.borders.length; i++) {
                        if(this.slideObject == poly.borders[i]) {
                            this.slideObject = poly.borders[(i + 1 + poly.borders.length) % poly.borders.length];
                            break;                        
                        }
                    }
                }
            }
        } else if(this.slideObject.type == JXG.OBJECT_TYPE_CURVE) {
            this.updateConstraint(); // In case, the point is a constrained glider.
            this.coords  = this.board.algebra.projectPointToCurve(this, this.slideObject);
        } else if(this.slideObject.type == JXG.OBJECT_TYPE_TURTLE) {
            this.updateConstraint(); // In case, the point is a constrained glider.
            this.coords  = this.board.algebra.projectPointToTurtle(this, this.slideObject);
        }
    }
    
    /* If point is a calculated point, call updateConstraint() to calculate new coords. */
    if (this.type == JXG.OBJECT_TYPE_CAS) {
        this.updateConstraint();
    }

    this.updateTransform();
    
    //this.updateRenderer();
    this.needsUpdate = false;
};

/**
 * Calls the renderer to update the drawing.
 */
JXG.Point.prototype.updateRenderer = function () {
    /* Call the renderer only if point is visible. */
    if(this.visProp['visible']) {
        var wasReal = this.isReal;
        this.isReal = (isNaN(this.coords.usrCoords[1]+this.coords.usrCoords[2]))?false:true;
        this.isReal = (Math.abs(this.coords.usrCoords[0])>this.board.algebra.eps)?this.isReal:false;  //Homogeneous coords: ideal point
        if (this.isReal) {
            if (wasReal!=this.isReal) { 
                this.board.renderer.show(this); 
                if(this.hasLabel && this.label.content.visProp['visible']) this.board.renderer.show(this.label.content); 
            }
            this.board.renderer.updatePoint(this);
        } else {
            if (wasReal!=this.isReal) { 
                this.board.renderer.hide(this); 
                if(this.hasLabel && this.label.content.visProp['visible']) this.board.renderer.hide(this.label.content); 
            }
        }
    } 

    /* Update the label if visible. */
    if(this.hasLabel && this.label.content.visProp['visible'] && this.isReal) {
        //this.label.setCoordinates(this.coords);
        this.label.content.update();
        //this.board.renderer.updateLabel(this.label);
        this.board.renderer.updateText(this.label.content);
    }
};

/**
 * Getter method for x, this is used by for CAS-points to access point coordinates.
 * @see #coords
 * @see JXG.Coords#x
 * @return {float} User coordinate of point in x direction.
 */
JXG.Point.prototype.X = function () {
    return this.coords.usrCoords[1];
};

/**
 * Getter method for y, this is used by CAS-points to access point coordinates.
 * @see #coords
 * @see JXG.Coords#y
 * @return {float} User coordinate of point in y direction.
 */
JXG.Point.prototype.Y = function () {
    return this.coords.usrCoords[2];
};

/**
 * Getter method for z, this is used by CAS-points to access point coordinates.
 * @see #coords
 * @see JXG.Coords#z
 * @return {float} User coordinate of point in z direction.
 */
JXG.Point.prototype.Z = function () {
    return this.coords.usrCoords[0];
};

/**
 * New evaluation of the function term. 
 * This is required for CAS-points: Their XTerm() method is overwritten in @see #addConstraint
 * @see #coords
 * @see JXG.Coords#x
 * @return {float} User coordinate of point in x direction.
 */
JXG.Point.prototype.XEval = function () {
    return this.coords.usrCoords[1];
};

/**
 * New evaluation of the function term. 
 * This is required for CAS-points: Their YTerm() method is overwritten in @see #addConstraint
 * @see #coords
 * @see JXG.Coords#y
 * @return {float} User coordinate of point in y direction.
 */
JXG.Point.prototype.YEval = function () {
    return this.coords.usrCoords[2];
};

/**
 * New evaluation of the function term. 
 * This is required for CAS-points: Their ZTerm() method is overwritten in @see #addConstraint
 * @see #coords
 * @see JXG.Coords#xz
 * @return {float} User coordinate of point in z direction.
 */
JXG.Point.prototype.ZEval = function () {
    return this.coords.usrCoords[0];
};

/**
 * Getter method for the distance to a second point, this is required for CAS-elements.
 * @see #coords
 * @see JXG.Coords#dist
 * @return {float} Distance in user coordinate to the point2
 */
JXG.Point.prototype.Dist = function(point2) {
    return this.coords.distance(JXG.COORDS_BY_USER, point2.coords);
};

/**
 * Sets x and y coordinate and calls update() method.
 * @param {int} x x coordinate in screen/user units
 * @param {int} y y coordinate in screen/user units
 * @see #update
 */
JXG.Point.prototype.setPositionDirectly = function (method, x, y) {
    var oldCoords = this.coords;
    this.coords = new JXG.Coords(method, [x,y], this.board);
    
    if(this.group.length != 0) {
        this.group[this.group.length-1].dX = this.coords.scrCoords[1] - oldCoords.scrCoords[1];
        this.group[this.group.length-1].dY = this.coords.scrCoords[2] - oldCoords.scrCoords[2];
        this.group[this.group.length-1].update(this);
    } else {
        this.update();
    }
};

JXG.Point.prototype.setPositionByTransform = function (method, x, y) {
    var oldCoords = this.coords;
    var t = this.board.createElement('transform',[x,y],{type:'translate'});
    if (this.transformations.length>0 && this.transformations[this.transformations.length-1].isNumericMatrix) {
        this.transformations[this.transformations.length-1].melt(t);
    } else {
        this.addTransform(this,t);
    }

    if (this.group.length != 0) {
/*
        var dCoords = new JXG.Coords(method, [x,y], this.board);
        this.group[this.group.length-1].dX = dCoords.scrCoords[1]-this.board.origin.scrCoords[1]; 
        this.group[this.group.length-1].dY = dCoords.scrCoords[2]-this.board.origin.scrCoords[2]; 
        this.group[this.group.length-1].update(this);
*/
    } else {
        this.update();
    }
};

JXG.Point.prototype.setPosition = function (method, x, y) { 
    this.setPositionByTransform(method, x, y);
};

/**
 * Convert the point to glider and call update().
 * @param {String,Object} slideObject Object the point is bound to.
 */
JXG.Point.prototype.makeGlider = function (slideObject) {
    this.slideObject = JXG.GetReferenceFromParameter(this.board, slideObject);
    this.type = JXG.OBJECT_TYPE_GLIDER;
    this.snapWidth = null;
    
    this.slideObject.addChild(this);

    if(this.slideObject.elementClass == JXG.OBJECT_CLASS_LINE) {
        this.generatePolynomial = function() {
            return this.slideObject.generatePolynomial(this);
        }
    } else if (this.slideObject.elementClass == JXG.OBJECT_CLASS_CIRCLE) {
        this.generatePolynomial = function() {
            return this.slideObject.generatePolynomial(this);
        }
    }

    //this.position = 0;
    this.needsUpdate = true;
    this.update();
};

/**
 * Convert the point to CAS point and call update().
 * @param {String} xterm Calculation term for x coordinate in geonext syntax
 * @param {String} yterm Calculation term for y coordinate in geonext syntax
 * @see JXG.Algebra#geonext2JS
 */
JXG.Point.prototype.addConstraint = function (terms) {
    this.type = JXG.OBJECT_TYPE_CAS;
    var elements = this.board.elementsByName;
    var newfuncs = [];
    var fs;
    
    for (var i=0;i<terms.length;i++) {
        var v = terms[i];
        if (typeof v=='string') {
            // Convert GEONExT syntax into  JavaScript syntax
            var t  = this.board.algebra.geonext2JS(v);
            newfuncs[i] = new Function('','return ' + t + ';');
        } else if (typeof v=='function') {
            newfuncs[i] = v;
        } else if (typeof v=='number') {
            newfuncs[i] = function(z){ return function() { return z; }; }(v);
        }
    }
    if (terms.length==1) { // Intersection function
        this.updateConstraint = function() { this.coords = newfuncs[0](); };
        if (!this.board.isSuspendedUpdate) { this.update(); }
        return;
    } else if (terms.length==2) { // Euclidean coordinates
        this.XEval = newfuncs[0];
        this.YEval = newfuncs[1];
        fs = 'this.coords.setCoordinates(JXG.COORDS_BY_USER,[this.XEval(),this.YEval()]);';
        this.updateConstraint = new Function('',fs);
    } else { // Homogeneous coordinates
        this.ZEval = newfuncs[0];
        this.XEval = newfuncs[1];
        this.YEval = newfuncs[2];
        fs = 'this.coords.setCoordinates(JXG.COORDS_BY_USER,[this.ZEval(),this.XEval(),this.YEval()]);';
        this.updateConstraint = new Function('',fs);
    }
    
    if (!this.board.isSuspendedUpdate) { this.update(); }
    return;
    
};
JXG.Point.prototype.addConstraintOld = function (xterm, yterm) {
    this.type = JXG.OBJECT_TYPE_CAS;
    var elements = this.board.elementsByName;

    // Only xterm is given
    if (yterm==null) {  // Intersection
        this.updateConstraint = function() { this.coords = xterm(); };
        if (!this.board.isSuspendedUpdate) { this.update(); }
        return;
    }

    // Convert GEONExT syntax into JavaScript syntax
    // Generate the methods X() and Y()
    if (typeof xterm=='string') {
        // Convert GEONExT syntax into  JavaScript syntax
        var newxterm = this.board.algebra.geonext2JS(xterm);
        this.XEval = new Function('','return ' + newxterm + ';');
    } else if (typeof xterm=='function') {
        this.XEval = xterm;
    } else if (typeof xterm=='number') {
        this.XEval = function() { return xterm; };
    }
    if (typeof yterm=='string') {
        // Convert GEONExT syntax into  JavaScript syntax
        var newyterm = this.board.algebra.geonext2JS(yterm);
        this.YEval = new Function('','return ' + newyterm + ';');
    } else if (typeof yterm=='function') {
        this.YEval = yterm;
    } else if (typeof yterm=='number') {
        this.YEval = function() { return yterm; };
    }
    var fs = 'this.coords.setCoordinates(JXG.COORDS_BY_USER,[this.XEval(),this.YEval()]);';
    this.updateConstraint = new Function('',fs);
    
    // Find parent elements
    /*
    for (el in elements) {
        if (el != this.name) {
            var s1 = "X(" + el + ")";
            var s2 = "Y(" + el + ")";
            if (xterm.indexOf(s1)>=0 || xterm.indexOf(s2)>=0 ||
                yterm.indexOf(s1)>=0 || yterm.indexOf(s2)>=0) {
                elements[el].addChild(this);
            }
        }
    }
    */
    if (!this.board.isSuspendedUpdate) { this.update(); }
    return;
    
};

JXG.Point.prototype.updateTransform = function () {
    if (this.transformations.length==0 || this.baseElement==null) {
        return;
    }
    if (this===this.baseElement) {
        var c = this.transformations[0].apply(this.baseElement,'self');
    } else {
        var c = this.transformations[0].apply(this.baseElement);
    }
    this.coords.setCoordinates(JXG.COORDS_BY_USER,[c[1],c[2]]);
    for (var i=1;i<this.transformations.length;i++) {
        c = this.transformations[i].apply(this);
        this.coords.setCoordinates(JXG.COORDS_BY_USER,[c[1],c[2]]);
    }
};

JXG.Point.prototype.addTransform = function (el, transform) {
    if (this.transformations.length==0) { // There is only one baseElement possible
        this.baseElement = el;
    }
    var list;
    if (JXG.IsArray(transform)) {
        list = transform;
    } else {
        list = [transform];
    }
    for (var i=0;i<list.length;i++) {
        this.transformations.push(list[i]);
    }
};

/**
 * Start animation.
 * @param {int} direction The direction the glider is animated.
 * @param {int} stepCount The number of steps.
 * @see #stopAnimation
 */
JXG.Point.prototype.startAnimation = function(direction, stepCount) {
    if((this.type == JXG.OBJECT_TYPE_GLIDER) && (typeof this.intervalCode == 'undefined')) {
        this.intervalCode = window.setInterval('JXG.JSXGraph.boards[\'' + this.board.id + '\'].objects[\'' + this.id + '\'].animate(' + direction + ', ' + stepCount + ')', 250);
        if(typeof this.intervalCount == 'undefined')
            this.intervalCount = 0;
    }
};

/**
 * Stop animation.
 * @see #startAnimation
 */
JXG.Point.prototype.stopAnimation = function() {
    if(typeof this.intervalCode != 'undefined') {
        window.clearInterval(this.intervalCode);
        delete(this.intervalCode);
//        delete(this.intervalCount);
    }
};

/**
 * Animates a glider. Is called by the browser after startAnimation is called.
 * @param {int} direction The direction the glider is animated.
 * @param {int} stepCount The number of steps.
 * @see #startAnimation
 * @see #stopAnimation
 * @private
 */
JXG.Point.prototype.animate = function(direction, stepCount) {
    this.intervalCount++;
    if(this.intervalCount > stepCount)
        this.intervalCount = 0;
    
    if(this.slideObject.type == JXG.OBJECT_TYPE_LINE) {
        var distance = this.slideObject.point1.coords.distance(JXG.COORDS_BY_SCREEN, this.slideObject.point2.coords);
        var slope = this.slideObject.getSlope();
        var dX;
        var dY;
        if(slope != 'INF') {
            var alpha = Math.atan(slope);
            dX = Math.round((this.intervalCount/stepCount) * distance*Math.cos(alpha));
            dY = Math.round((this.intervalCount/stepCount) * distance*Math.sin(alpha));
        } else {
            dX = 0;
            dY = Math.round((this.intervalCount/stepCount) * distance);
        }
        
        var startPoint;
        var factor = 1;
        if(direction < 0) {
            startPoint = this.slideObject.point2;
            if(this.slideObject.point2.coords.scrCoords[1] - this.slideObject.point1.coords.scrCoords[1] > 0)
                factor = -1;
            else if(this.slideObject.point2.coords.scrCoords[1] - this.slideObject.point1.coords.scrCoords[1] == 0) {
                if(this.slideObject.point2.coords.scrCoords[2] - this.slideObject.point1.coords.scrCoords[2] > 0)
                    factor = -1;
            }
        } else {
            startPoint = this.slideObject.point1;
            if(this.slideObject.point1.coords.scrCoords[1] - this.slideObject.point2.coords.scrCoords[1] > 0)
                factor = -1;
            else if(this.slideObject.point1.coords.scrCoords[1] - this.slideObject.point2.coords.scrCoords[1] == 0) {
                if(this.slideObject.point1.coords.scrCoords[2] - this.slideObject.point2.coords.scrCoords[2] > 0)
                    factor = -1;
            }
        }
        
        this.coords.setCoordinates(JXG.COORDS_BY_SCREEN, [startPoint.coords.scrCoords[1] + factor*dX, startPoint.coords.scrCoords[2] + factor*dY]);
    } else if(this.slideObject.type == JXG.OBJECT_TYPE_CURVE) {
        var newX;

        if(direction > 0) {
            newX = Math.round(this.intervalCount/stepCount * this.board.canvasWidth);
        } else {
            newX = Math.round((stepCount - this.intervalCount)/stepCount * this.board.canvasWidth);
        }
  
        this.coords.setCoordinates(JXG.COORDS_BY_SCREEN, [newX, 0]);
        this.coords = this.board.algebra.projectPointToCurve(this, this.slideObject);
    } else if(this.slideObject.type == JXG.OBJECT_TYPE_CIRCLE) {
        var alpha;
        if(direction < 0) {
            alpha = this.intervalCount/stepCount * 2*Math.PI;
        } else {
            alpha = (stepCount - this.intervalCount)/stepCount * 2*Math.PI;
        }

        var radius = this.slideObject.getRadius();

        this.coords.setCoordinates(JXG.COORDS_BY_USER, [this.slideObject.midpoint.coords.usrCoords[1] + radius*Math.cos(alpha), this.slideObject.midpoint.coords.usrCoords[2] + radius*Math.sin(alpha)]);
    }

    this.board.update(this);
};

/**
 * Set the style of a point.
 * @param {int} i Integer to determine the style.
 * @see #style
 */
JXG.Point.prototype.setStyle = function(i) {
    this.visProp['style'] = i;
    this.board.renderer.changePointStyle(this);
};

/**
 * Remove the point from the drawing.
 */
JXG.Point.prototype.remove = function() {    
    if (this.hasLabel) {
        this.board.renderer.remove(document.getElementById(this.label.id));
    }
    if(this.visProp['style']  >= 3 && this.visProp['style'] <= 9) {
        this.board.renderer.remove(document.getElementById(this.id));
    }
    else {
        this.board.renderer.remove(document.getElementById(this.id+'_x1'));
        this.board.renderer.remove(document.getElementById(this.id+'_x2'))        
    }
};

/**
 * return TextAnchor
 */
JXG.Point.prototype.getTextAnchor = function() {
    return this.coords;
};

/**
 * return LabelAnchor
 */
JXG.Point.prototype.getLabelAnchor = function() {
    return this.coords;
};

/**
 * Copy the element to the background.
 */
JXG.Point.prototype.cloneToBackground = function(addToTrace) {
    var copy = {};
    copy.id = this.id + 'T' + this.numTraces;
    this.numTraces++;
    copy.coords = this.coords;
    copy.visProp = this.visProp;
    copy.elementClass = JXG.OBJECT_CLASS_POINT;
    
    this.board.renderer.drawPoint(copy);

    if( (this.visProp['style']  >= 3) && (this.visProp['style'] <= 9) ) {
        this.traces[copy.id] = document.getElementById(copy.id);
    }
    else {
        this.traces[copy.id + '_x1'] = document.getElementById(copy.id+'_x1');
        this.traces[copy.id + '_x2'] = document.getElementById(copy.id+'_x2');
    }

    delete copy;
/*   
    this.board.renderer.cloneSubTree(this);
*/    
};


/**
 * There are several methods to construct a point.
 * The input parameter "parentArr" determines the point:
 * - 2 numbers: affine (Euclidean) coordinates of a free point
 * - 2 numbers and atts['slideObject'] : Glider with initial Euclidean coordinates
 * - 2 Strings or (1 String and 1 Number): constrained point
 * - 1 function: intersection of objects, this is just a constrained point too
 * - 1 transformation object: clone of a base point transformed by the given Transformation
 * - 3 numbers: homogeneous coordinates of a free point
 */
JXG.createPoint = function(board, parents, atts) {
    var el;
    if (atts==null) {
        atts = {};
    }
    if (typeof atts.withLabel == 'undefined') {
        atts.withLabel = true;
    }
        
    var isConstrained = false;
    for (var i=0;i<parents.length;i++) {
        if (typeof parents[i]=='function' || typeof parents[i]=='string') {
            isConstrained = true;
        }
    }
    if (!isConstrained) {
        if ( (JXG.IsNumber(parents[0])) && (JXG.IsNumber(parents[1])) ) {
            el = new JXG.Point(board, parents, atts['id'], atts['name'], (atts['visible']==undefined) || board.algebra.str2Bool(atts['visible']), atts['withLabel']);
            if ( atts["slideObject"] != null ) {
                el.makeGlider(atts["slideObject"]);
            } else {
                el.baseElement = el; // Free point
            }
        } else if ( (typeof parents[0]=='object') && (typeof parents[1]=='object') ) { // Transformation
            el = new JXG.Point(board, [0,0], atts['id'], atts['name'], (atts['visible']==undefined) || board.algebra.str2Bool(atts['visible']), atts['withLabel']);   
            el.addTransform(parents[0],parents[1]);
        }
        else {// Failure
            throw ("JSXGraph error: Can't create point with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'.");
        }
    } else {
        el = new JXG.Point(board, [0,0], atts['id'], atts['name'], (atts['visible']==undefined) || board.algebra.str2Bool(atts['visible']), atts['withLabel']);
        el.addConstraint(parents);
    }
    return el;
};


/**
 * Extra treatment for the glider point
 * The object on wihich the slider lives has to
 * be the last object in parentArr.
 * parentArr consists of three elements: [number, number, object]
 */
JXG.createGlider = function(board, parents, atts) {
    var el;
    if (atts==null) {
        atts = {};
    }
    if (typeof atts.withLabel == 'undefined') {
        atts.withLabel = true;
    }
    if (parents.length==1) {
      el = new JXG.Point(board, [0,0], atts['id'], atts['name'], (atts['visible']==undefined) || board.algebra.str2Bool(atts['visible']), atts['withLabel']);
    } else {
      //el = new JXG.Point(board, parents.slice(0,-1), atts['id'], atts['name'], (atts['visible']==undefined) || board.algebra.str2Bool(atts['visible']));
      el = board.createElement('point',parents.slice(0,-1), atts);
    }
    el.makeGlider(parents[parents.length-1]);
    return el;
};

/**
 * This is just a wrapper for board.intersectFunc.
 * @param {Array} parents Array containing the intersected Elements in the first two fields and
 *                        the index of the point if there is more than one intersection point.
 * @type JXG.Point
 * @return Point intersecting the parent elements.
 */
JXG.createIntersectionPoint = function(board, parents, attributes) {
    var el;
    if (parents.length>=3) {
        if(parents.length == 3)
            parents.push(null);
        el = board.createElement('point', [board.intersection(parents[0], parents[1], parents[2], parents[3])], attributes);
    }

    parents[0].addChild(el);
    parents[1].addChild(el);

    el.generatePolynomial = function () {
        var poly1 = parents[0].generatePolynomial(el);
        var poly2 = parents[1].generatePolynomial(el);

        if((poly1.length == 0) || (poly2.length == 0))
            return [];
        else
            return [poly1[0], poly2[0]];
    }
    
    return el;
};

JXG.JSXGraph.registerElement('point', JXG.createPoint);
JXG.JSXGraph.registerElement('glider', JXG.createGlider);
JXG.JSXGraph.registerElement('intersection', JXG.createIntersectionPoint);
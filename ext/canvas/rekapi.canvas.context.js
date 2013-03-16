var rekapiCanvasContext = function (context, _) {

  'use strict';

  var Kapi = context.Kapi;


  // PRIVATE UTILITY FUNCTIONS
  //

  /*!
   * Gets (and optionally sets) height or width on a canvas.
   * @param {HTMLCanvas} context
   * @param {string} heightOrWidth The dimension (either "height" or "width")
   * to get or set.
   * @param {number} opt_newSize The new value to set for `dimension`.
   * @return {number}
   */
  function dimension (context, heightOrWidth, opt_newSize) {
    if (typeof opt_newSize !== 'undefined') {
      context[heightOrWidth] = opt_newSize;
      context.style[heightOrWidth] = opt_newSize + 'px';
    }

    return context[heightOrWidth];
  }


  /*!
   * Takes care of some pre-drawing tasks for canvas animations.
   * @param {Kapi}
   */
  function beforeDraw (kapi) {
    if (kapi.config.clearOnUpdate) {
      kapi.canvas.clear();
    }
  }


  /*!
   * Draw all the `Actor`s at whatever position they are currently in.
   * @param {Kapi}
   * @return {Kapi}
   */
  function draw (kapi) {
    fireEvent(kapi, 'beforeDraw', _);
    var len = kapi.canvas._drawOrder.length;
    var drawOrder;

    if (kapi.canvas._drawOrderSorter) {
      var orderedActors =
          _.sortBy(kapi.canvas._canvasActors, kapi.canvas._drawOrderSorter);
      drawOrder = _.pluck(orderedActors, 'id');
    } else {
      drawOrder = kapi.canvas._drawOrder;
    }

    var currentActor, canvas_context;

    var i;
    for (i = 0; i < len; i++) {
      currentActor = kapi.canvas._canvasActors[drawOrder[i]];
      canvas_context = currentActor.context();
      currentActor.draw(canvas_context, currentActor.get());
    }
    fireEvent(kapi, 'afterDraw', _);

    return kapi;
  }


  /*!
   * @param {Kapi} kapi
   * @param {Kapi.Actor} actor
   */
  function addActor (kapi, actor) {
    if (actor instanceof Kapi.CanvasActor) {
      kapi.canvas._drawOrder.push(actor.id);
      kapi.canvas._canvasActors[actor.id] = actor;
    }
  }


  /*!
   * @param {Kapi} kapi
   * @param {Kapi.Actor} actor
   */
  function removeActor (kapi, actor) {
    if (actor instanceof Kapi.CanvasActor) {
      kapi.canvas._drawOrder = _.without(kapi.canvas._drawOrder, actor.id);
      delete kapi.canvas._canvasActors[actor.id];
    }
  }


  /*!
   * Sets up an instance of CanvasRenderer and attaches it to a `Kapi`
   * instance.  Also augments the Kapi instance with canvas-specific
   * functions.
   */
  Kapi.prototype._contextInitHook.canvas = function () {
    this.canvas = new CanvasRenderer(this);
    this.config.clearOnUpdate = true;

    _.extend(this._events, {
      'beforeDraw': []
      ,'afterDraw': []
    });

    // Set the dimensions on the <canvas> element based on Kapi constructor
    // parameters
    _.each(['Height', 'Width'], function (dimension) {
      var dimensionLower = dimension.toLowerCase();
      if (this.config[dimensionLower]) {
        this.canvas[dimensionLower](this.config[dimensionLower]);
        delete this.config[dimension];
      }
    }, this);

    this.on('afterUpdate', draw);
    this.on('addActor', addActor);
    this.on('removeActor', removeActor);
    this.on('beforeDraw', beforeDraw);
  };


  // CANVAS RENDERER OBJECT
  //

  /**
   * You can use Rekapi to render to an HTML5 `<canvas>`.  The Canvas renderer does two things:
   *
   *   1. Subclass `Kapi.Actor` as `Kapi.CanvasActor`.
   *   2. Attach an instance of `Kapi.CanvasRenderer` to each instance of `Kapi`, named `canvas`, at initialization time.  So:
   *
   * ```
   * // With the Rekapi Canvas renderer enabled
   * var kapi = new Kapi();
   * kapi.canvas instanceof Kapi.CanvasRenderer; // true
   * ```
   *
   * __Note:__ This constructor is called for you automatically - there is no need to call it explicitly.
   *
   * The Canvas renderer adds some new events you can bind to with `Kapi.on`.
   *
   *  - __beforeDraw__: Fires just before an actor is drawn to the screen.
   *  - __afterDraw__: Fires just after an actor is drawn to the screen.
   *
   * @param {Kapi} kapi
   * @constructor
   */
  var CanvasRenderer = Kapi.CanvasRenderer = function (kapi) /*!*/ {
    this.kapi = kapi;
    this._drawOrder = [];
    this._drawOrderSorter = null;
    this._canvasActors = {};
    return this;
  };


  /**
   * Get and optionally set the height of the associated `<canvas>` element.
   *
   * @param {number} opt_height
   * @return {number}
   */
  CanvasRenderer.prototype.height = function (opt_height) /*!*/ {
    return dimension(this.kapi.context, 'height', opt_height);
  };


  /**
   * Get and optionally set the width of the associated `<canvas>` element.
   *
   * @param {number} opt_width
   * @return {number}
   */
  CanvasRenderer.prototype.width = function (opt_width) /*!*/ {
    return dimension(this.kapi.context, 'width', opt_width);
  };


  /**
   * Erase the `<canvas>`.
   *
   * @return {Kapi}
   */
  CanvasRenderer.prototype.clear = function () /*!*/ {
    // TODO: Is this check necessary?
    if (this.kapi.context.getContext) {
      this.context().clearRect(
          0, 0, this.width(), this.height());
    }

    return this.kapi;
  };


  /**
   * Retrieve the 2d context of the `<canvas>` that is set as the `Kapi` instance's context.  This is needed for all rendering operations.  It is also provided to a `CanvasActor`'s `draw` method, so you mostly won't need to call it directly.  This overrides the `Kapi.prototype.context` method - it returns the rendered context, not the raw `<canvas>` element.  See the [MDN](https://developer.mozilla.org/en/Drawing_Graphics_with_Canvas) for more info on the Canvas context.
   * @return {CanvasRenderingContext2D}
   */
  CanvasRenderer.prototype.context = function () /*!*/ {
    return this.kapi.context.getContext('2d');
  };


  /**
   * Move a `CanvasActor` around in the layer list.  Each layer has one `CanvasActor`, and `CanvasActor`s are drawn in order of their layer.  Lower layers (starting with 0) are drawn earlier.  If `layer` is higher than the number of layers (which can be found with `actorCount()`) or lower than 0, this method will return `undefined`.
   *
   * __[Example](../../docs/examples/canvas_move_actor_to_layer.html)__
   * @param {Kapi.Actor} actor
   * @param {number} layer
   * @return {Kapi.Actor|undefined}
   */
  CanvasRenderer.prototype.moveActorToLayer = function (actor, layer) /*!*/ {
    if (layer < this._drawOrder.length) {
      this._drawOrder = _.without(this._drawOrder, actor.id);
      this._drawOrder.splice(layer, 0, actor.id);

      return actor;
    }

    return;
  };


  /**
   * Set a function that defines the draw order of the `CanvasActor`s.  This is called each frame before the `CanvasActor`s are drawn.  The following example assumes that all `CanvasActor`s are circles that have a `radius` property.  The circles will be drawn in order of the value of their `radius`, from smallest to largest.  This has the effect of layering larger circles on top of smaller circles, giving a sense of perspective.
   *
   * ```
   * kapi.canvas.setOrderFunction(function (actor) {
   *   return actor.get().radius;
   * });
   * ```
   * @param {function(Kapi.Actor, number)} sortFunction
   * @return {Kapi}
   */
  CanvasRenderer.prototype.setOrderFunction = function (sortFunction) /*!*/ {
    this._drawOrderSorter = sortFunction;
    return this.kapi;
  };


  /**
   * Remove the sort order function set by `setOrderFunction`.  Draw order defaults back to the order in which `CanvasActors` were added.
   *
   * __[Example](../../docs/examples/canvas_unset_order_function.html)__
   * @return {Kapi}
   */
  CanvasRenderer.prototype.unsetOrderFunction = function () /*!*/ {
    this._drawOrderSorter = null;
    return this.kapi;
  };

};

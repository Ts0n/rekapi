var rekapiCanvasActor = function (context, _) {

  'use strict';

  var Kapi = context.Kapi;

  // Proxy method
  function CanvasActorMethods () {}
  CanvasActorMethods.prototype = Kapi.Actor.prototype;

  /**
   * Constructor for rendering Actors to a `<canvas>`.  Extends `Kapi.Actor`.  Valid options for `opt_config` are the same as those for the standard [Actor](#Actor) constructor, with the following additions:
   *
   *  - __draw__ _(function(CanvasRenderingContext2D, Object))_: A function that renders something to a canvas.
   *
   * _Note_: `context` is inherited from the `Kapi` instance that a `Kapi.CanvasActor` is added to if it is not provided to this constructor.
   * @param {Object=} opt_config
   * @constructor
   */
  Kapi.CanvasActor = function (opt_config) /*!*/ {
    Kapi.Actor.call(this, opt_config);

    opt_config = opt_config || {};
    this.draw = opt_config.draw || noop;

    return this;
  };
  var CanvasActor = Kapi.CanvasActor;

  CanvasActor.prototype = new CanvasActorMethods();

  /*!
   * @param {Object} opt_context
   * @return {Object}
   */
  CanvasActor.prototype.context = function (opt_context) {
    if (opt_context) {
      this._context = opt_context;
    }

    return this._context && this._context.getContext('2d');
  };

  /**
   * Move this `CanvasActor` to a different layer in the `Kapi` instance that it belongs to.  This returns `undefined` if the operation was unsuccessful.  This is just a wrapper for [moveActorToLayer](#moveActorToLayer).
   * @param {number} layer
   * @return {Kapi.Actor|undefined}
   */
  CanvasActor.prototype.moveToLayer = function (layer) /*!*/ {
    return this.kapi.canvas.moveActorToLayer(this, layer);
  };
};

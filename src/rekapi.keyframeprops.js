var rekapiKeyframeProperty = function (context, _, Tweenable) {

  'use strict';

  var DEFAULT_EASING = 'linear';
  var Kapi = context.Kapi;


  /**
   * Represents an individual component of an `Actor`'s keyframe state.  In many cases you won't need to deal with this directly, `Actor` abstracts a lot of what this Object does away for you.
   *
   * __[Example](../../docs/examples/keyprop.html)__
   * @param {Kapi.Actor} ownerActor The Actor to which this KeyframeProperty is associated.
   * @param {number} millisecond Where in the animation this KeyframeProperty lives.
   * @param {string} name The property's name, such as "x" or "opacity."
   * @param {number} value The value of `name`.  This is the value to animate to.
   * @param {string=} opt_easing The easing to arrive to `value` at.  Defaults to linear.
   * @constructor
   */
  var KeyframeProperty = Kapi.KeyframeProperty =
      function (ownerActor, millisecond, name, value, opt_easing) /*!*/ {
    this.id = _.uniqueId('keyframeProperty_');
    this.ownerActor = ownerActor;
    this.millisecond = millisecond;
    this.name = name;
    this.value = value;
    this.easing = opt_easing || DEFAULT_EASING;
    this.nextProperty = null;

    return this;
  };


  /**
   * Augment a `KeyframeProperty`'s properties.
   *
   * __[Example](../../docs/examples/keyprop_modify_with.html)__
   * @param {Object} newProperties Contains the new `millisecond`, `easing`, or `value` values to update this KeyframeProperty with.  These correspond to the formal parameters of the KeyframeProperty constructor.
   */
  KeyframeProperty.prototype.modifyWith = function (newProperties) /*!*/ {
    var modifiedProperties = {};

    _.each(['millisecond', 'easing', 'value'], function (str) {
      modifiedProperties[str] = typeof(newProperties[str]) === 'undefined' ?
          this[str] : newProperties[str];
    }, this);

    _.extend(this, modifiedProperties);
  };


  /**
   * Create the reference to the next KeyframeProperty in an `Actor`'s `KeyframeProperty` track.
   *
   * __[Example](../../docs/examples/keyprop_link_to_next.html)__
   * @param {KeyframeProperty} nextProperty The KeyframeProperty that immediately follows this one in an animation.
   */
  KeyframeProperty.prototype.linkToNext = function (nextProperty) /*!*/ {
    this.nextProperty = nextProperty || null;
  };


  /**
   * Calculate the midpoint between this `KeyframeProperty` and the next `KeyframeProperty` in an `Actor`'s `KeyframeProperty` track.
   *
   * __[Example](../../docs/examples/keyprop_get_value_at.html)__
   * @param {number} millisecond The point in the animation to compute the midpoint of the two KeyframeProperties.
   * @return {number}
   */
  KeyframeProperty.prototype.getValueAt = function (millisecond) /*!*/ {
    var fromObj = {};
    var toObj = {};
    var value;

    if (this.nextProperty) {
      fromObj[this.name] = this.value;
      toObj[this.name] = this.nextProperty.value;
      var delta = this.nextProperty.millisecond - this.millisecond;
      var interpolatedPosition = (millisecond - this.millisecond) / delta;
      value = Tweenable.interpolate(fromObj, toObj, interpolatedPosition,
          this.nextProperty.easing)[this.name];
    } else {
      value =  this.value;
    }

    return value;
  };


  /**
   * Export a reference-less dump of this KeyframeProperty's state data.
   *
   * __[Example](../../docs/examples/keyprop_export_property_data.html)__
   * @return {Object}
   */
  KeyframeProperty.prototype.exportPropertyData = function () /*!*/ {
    return {
     'id': this.id
     ,'millisecond': this.millisecond
     ,'name': this.name
     ,'value': this.value
     ,'easing': this.easing
    };
  };

};

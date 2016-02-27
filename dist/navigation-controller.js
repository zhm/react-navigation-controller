'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _rebound = require('rebound');

var _rebound2 = _interopRequireDefault(_rebound);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _dom = require('./util/dom');

var _array = require('./util/array');

var _object = require('./util/object');

var _transition = require('./util/transition');

var Transition = _interopRequireWildcard(_transition);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SpringSystem = _rebound2.default.SpringSystem;
var SpringConfig = _rebound2.default.SpringConfig;
var OrigamiValueConverter = _rebound2.default.OrigamiValueConverter;
var mapValueInRange = _rebound2.default.MathUtil.mapValueInRange;


var transformPrefix = (0, _dom.getVendorPrefix)('transform');

var optionTypes = {
  pushView: {
    view: _react2.default.PropTypes.element.isRequired,
    transition: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.number]),
    onComplete: _react2.default.PropTypes.func
  },
  popView: {
    transition: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.number]),
    onComplete: _react2.default.PropTypes.func
  },
  popToRootView: {
    transition: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.number]),
    onComplete: _react2.default.PropTypes.func
  },
  popToViewAtIndex: {
    transition: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.number]),
    onComplete: _react2.default.PropTypes.func
  },
  setViews: {
    views: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.element).isRequired,
    preserveState: _react2.default.PropTypes.bool,
    transition: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.number]),
    onComplete: _react2.default.PropTypes.func
  }
};

/**
 * Validate the options passed into a method
 *
 * @param {string} method - The name of the method to validate
 * @param {object} options - The options that were passed to "method"
 */
function checkOptions(method, options) {
  var optionType = optionTypes[method];
  Object.keys(options).forEach(function (key) {
    if (optionType[key]) {
      var e = optionType[key](options, key, method, 'prop');
      if (e) throw e;
    }
  });
}

var NavigationController = function (_React$Component) {
  _inherits(NavigationController, _React$Component);

  function NavigationController(props) {
    _classCallCheck(this, NavigationController);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NavigationController).call(this, props));

    var _this$props = _this.props;
    var views = _this$props.views;
    var preserveState = _this$props.preserveState;

    _this.state = {
      views: (0, _array.dropRight)(views),
      preserveState: preserveState,
      mountedViews: []
    };
    // React no longer auto binds
    ['__onSpringUpdate', '__onSpringAtRest'].forEach(function (method) {
      _this[method] = _this[method].bind(_this);
    });
    return _this;
  }

  _createClass(NavigationController, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.__isTransitioning = false;
      this.__viewStates = [];
      this.__viewIndexes = [0, 1];
      this.__springSystem = new SpringSystem();
      this.__spring = this.__springSystem.createSpring(this.props.transitionTension, this.props.transitionFriction);
      this.__spring.addListener({
        onSpringUpdate: this.__onSpringUpdate.bind(this),
        onSpringAtRest: this.__onSpringAtRest.bind(this)
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      delete this.__springSystem;
      this.__spring.removeAllListeners();
      delete this.__spring;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Position the wrappers
      this.__transformViews(0, 0, -100, 0);
      // Push the last view
      this.pushView((0, _array.last)(this.props.views), {
        transition: Transition.type.NONE
      });
    }

    /**
     * Translate the view wrappers by a specified percentage
     *
     * @param {number} prevX
     * @param {number} prevY
     * @param {number} nextX
     * @param {number} nextY
     */

  }, {
    key: '__transformViews',
    value: function __transformViews(prevX, prevY, nextX, nextY) {
      var _this2 = this;

      var _viewIndexes = _slicedToArray(this.__viewIndexes, 2);

      var prev = _viewIndexes[0];
      var next = _viewIndexes[1];

      var prevView = this.refs['view-wrapper-' + prev];
      var nextView = this.refs['view-wrapper-' + next];
      requestAnimationFrame(function () {
        prevView.style[transformPrefix] = 'translate3d(' + prevX + '%,' + prevY + '%,0px)';
        prevView.style.zIndex = Transition.isReveal(_this2.state.transition) ? 1 : 0;
        nextView.style[transformPrefix] = 'translate3d(' + nextX + '%,' + nextY + '%,0px)';
        nextView.style.zIndex = Transition.isReveal(_this2.state.transition) ? 0 : 1;
      });
    }

    /**
     * Map a 0-1 value to a percentage for __transformViews()
     *
     * @param {number} value
     * @param {string} [transition] - The transition type
     * @return {array}
     */

  }, {
    key: '__animateViews',
    value: function __animateViews() {
      var value = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var transition = arguments.length <= 1 || arguments[1] === undefined ? Transition.type.NONE : arguments[1];

      var prevX = 0,
          prevY = 0;
      var nextX = 0,
          nextY = 0;
      switch (transition) {
        case Transition.type.NONE:
        case Transition.type.PUSH_LEFT:
          prevX = mapValueInRange(value, 0, 1, 0, -100);
          nextX = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.PUSH_RIGHT:
          prevX = mapValueInRange(value, 0, 1, 0, 100);
          nextX = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.PUSH_UP:
          prevY = mapValueInRange(value, 0, 1, 0, -100);
          nextY = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.PUSH_DOWN:
          prevY = mapValueInRange(value, 0, 1, 0, 100);
          nextY = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.COVER_LEFT:
          nextX = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.COVER_RIGHT:
          nextX = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.COVER_UP:
          nextY = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.COVER_DOWN:
          nextY = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.REVEAL_LEFT:
          prevX = mapValueInRange(value, 0, 1, 0, -100);
          break;
        case Transition.type.REVEAL_RIGHT:
          prevX = mapValueInRange(value, 0, 1, 0, 100);
          break;
        case Transition.type.REVEAL_UP:
          prevY = mapValueInRange(value, 0, 1, 0, -100);
          break;
        case Transition.type.REVEAL_DOWN:
          prevY = mapValueInRange(value, 0, 1, 0, 100);
          break;
      }
      return [prevX, prevY, nextX, nextY];
    }

    /**
     * Called once a view animation has completed
     */

  }, {
    key: '__animateViewsComplete',
    value: function __animateViewsComplete() {
      var _this3 = this;

      this.__isTransitioning = false;

      var _viewIndexes2 = _slicedToArray(this.__viewIndexes, 2);

      var prev = _viewIndexes2[0];
      var next = _viewIndexes2[1];
      // Hide the previous view wrapper

      var prevViewWrapper = this.refs['view-wrapper-' + prev];
      prevViewWrapper.style.display = 'none';
      // Did hide view lifecycle event
      var prevView = this.refs['view-0'];
      if (prevView && typeof prevView.navigationControllerDidHideView === 'function') {
        prevView.navigationControllerDidHideView(this);
      }
      // Did show view lifecycle event
      var nextView = this.refs['view-1'];
      if (nextView && typeof nextView.navigationControllerDidShowView === 'function') {
        nextView.navigationControllerDidShowView(this);
      }
      // Unmount the previous view
      var mountedViews = [];
      mountedViews[prev] = null;
      mountedViews[next] = (0, _array.last)(this.state.views);

      this.setState({
        transition: null,
        mountedViews: mountedViews
      }, function () {
        _this3.__viewIndexes = _this3.__viewIndexes[0] === 0 ? [1, 0] : [0, 1];
      });
    }

    /**
     * Set the display style of the view wrappers
     *
     * @param {string} value
     */

  }, {
    key: '__displayViews',
    value: function __displayViews(value) {
      this.refs['view-wrapper-0'].style.display = value;
      this.refs['view-wrapper-1'].style.display = value;
    }

    /**
     * Transtion the view wrappers manually, using a built-in animation, or custom animation
     *
     * @param {string} transition
     * @param {function} [onComplete] - Called once the transition is complete
     */

  }, {
    key: '__transitionViews',
    value: function __transitionViews(options) {
      var _this4 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transitionTension: this.props.transitionTension,
        transitionFriction: this.props.transitionFriction
      };
      options = (0, _object.assign)({}, defaults, options);
      var _options = options;
      var transition = _options.transition;
      var transitionTension = _options.transitionTension;
      var transitionFriction = _options.transitionFriction;
      var onComplete = _options.onComplete;
      // Create a function that will be called once the

      this.__transitionViewsComplete = function () {
        delete _this4.__transitionViewsComplete;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      };
      // Will hide view lifecycle event
      var prevView = this.refs['view-0'];
      if (prevView && typeof prevView.navigationControllerWillHideView === 'function') {
        prevView.navigationControllerWillHideView(this);
      }
      // Will show view lifecycle event
      var nextView = this.refs['view-1'];
      if (nextView && typeof nextView.navigationControllerWillShowView === 'function') {
        nextView.navigationControllerWillShowView(this);
      }
      // Built-in transition
      if (typeof transition === 'number') {
        // Manually transition the views
        if (transition === Transition.type.NONE) {
          this.__transformViews.apply(this, this.__animateViews(1, transition));
          requestAnimationFrame(function () {
            _this4.__animateViewsComplete();
            _this4.__transitionViewsComplete();
          });
        }
        // Otherwise use the springs
        else {
            this.__spring.setSpringConfig(new SpringConfig(OrigamiValueConverter.tensionFromOrigamiValue(transitionTension), OrigamiValueConverter.frictionFromOrigamiValue(transitionFriction)));
            this.__spring.setEndValue(1);
          }
      }
      // Custom transition
      if (typeof transition === 'function') {
        var _viewIndexes3 = _slicedToArray(this.__viewIndexes, 2);

        var prev = _viewIndexes3[0];
        var next = _viewIndexes3[1];

        var _prevView = this.refs['view-wrapper-' + prev];
        var _nextView = this.refs['view-wrapper-' + next];
        transition(_prevView, _nextView, function () {
          _this4.__animateViewsComplete();
          _this4.__transitionViewsComplete();
        });
      }
    }
  }, {
    key: '__onSpringUpdate',
    value: function __onSpringUpdate(spring) {
      if (!this.__isTransitioning) return;
      var value = spring.getCurrentValue();
      this.__transformViews.apply(this, this.__animateViews(value, this.state.transition));
    }
  }, {
    key: '__onSpringAtRest',
    value: function __onSpringAtRest(spring) {
      this.__animateViewsComplete();
      this.__transitionViewsComplete();
      this.__spring.setCurrentValue(0);
    }

    /**
     * Push a new view onto the stack
     *
     * @param {ReactElement} view - The view to push onto the stack
     * @param {object} [options]
     * @param {function} options.onComplete - Called once the transition is complete
     * @param {number|function} [options.transition] - The transition type or custom transition
     */

  }, {
    key: '__pushView',
    value: function __pushView(view, options) {
      var _this5 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transition: Transition.type.PUSH_LEFT
      };
      options = (0, _object.assign)({}, defaults, options, { view: view });
      checkOptions('pushView', options);
      if (this.__isTransitioning) return;
      var _options2 = options;
      var transition = _options2.transition;

      var _viewIndexes4 = _slicedToArray(this.__viewIndexes, 2);

      var prev = _viewIndexes4[0];
      var next = _viewIndexes4[1];

      var views = this.state.views.slice();
      // Alternate mounted views order
      var mountedViews = [];
      mountedViews[prev] = (0, _array.last)(views);
      mountedViews[next] = view;
      // Add the new view
      views = views.concat(view);
      // Show the wrappers
      this.__displayViews('block');
      // Push the view
      this.setState({
        transition: transition,
        views: views,
        mountedViews: mountedViews
      }, function () {
        // The view about to be hidden
        var prevView = _this5.refs['view-0'];
        if (prevView && _this5.state.preserveState) {
          // Save the state before it gets unmounted
          _this5.__viewStates.push(prevView.state);
        }
        // Transition
        _this5.__transitionViews(options);
      });
      this.__isTransitioning = true;
    }

    /**
     * Pop the last view off the stack
     *
     * @param {object} [options]
     * @param {function} [options.onComplete] - Called once the transition is complete
     * @param {number|function} [options.transition] - The transition type or custom transition
     */

  }, {
    key: '__popView',
    value: function __popView(options) {
      var _this6 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transition: Transition.type.PUSH_RIGHT
      };
      options = (0, _object.assign)({}, defaults, options);
      checkOptions('popView', options);
      if (this.state.views.length === 1) {
        throw new Error('popView() can only be called with two or more views in the stack');
      };
      if (this.__isTransitioning) return;
      var _options3 = options;
      var transition = _options3.transition;

      var _viewIndexes5 = _slicedToArray(this.__viewIndexes, 2);

      var prev = _viewIndexes5[0];
      var next = _viewIndexes5[1];

      var views = (0, _array.dropRight)(this.state.views);
      // Alternate mounted views order
      var p = (0, _array.takeRight)(this.state.views, 2).reverse();
      var mountedViews = [];
      mountedViews[prev] = p[0];
      mountedViews[next] = p[1];
      // Show the wrappers
      this.__displayViews('block');
      // Pop the view
      this.setState({
        transition: transition,
        views: views,
        mountedViews: mountedViews
      }, function () {
        // The view about to be shown
        var nextView = _this6.refs['view-1'];
        if (nextView && _this6.state.preserveState) {
          var state = _this6.__viewStates.pop();
          // Rehydrate the state
          if (state) {
            nextView.setState(state);
          }
        }
        // Transition
        _this6.__transitionViews(options);
      });
      this.__isTransitioning = true;
    }

    /**
     * Replace the views currently managed by the controller
     * with the specified items.
     *
     * @param {array} views
     * @param {object} options
     * @param {function} [options.onComplete] - Called once the transition is complete
     * @param {number|function} [options.transition] - The transition type or custom transition
     * @param {boolean} [options.preserveState] - Wheter or not view states should be rehydrated
     */

  }, {
    key: '__setViews',
    value: function __setViews(views, options) {
      var _this7 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      checkOptions('setViews', options);
      var _options4 = options;
      var _onComplete = _options4.onComplete;
      var preserveState = _options4.preserveState;

      options = (0, _object.assign)({}, options, {
        onComplete: function onComplete() {
          _this7.__viewStates.length = 0;
          _this7.setState({
            views: views,
            preserveState: preserveState
          }, function () {
            if (_onComplete) {
              _onComplete();
            }
          });
        }
      });
      this.__pushView((0, _array.last)(views), options);
    }
  }, {
    key: '__popToRootView',
    value: function __popToRootView(options) {
      __popToViewAtIndex(0, options);
    }
  }, {
    key: '__popToViewAtIndex',
    value: function __popToViewAtIndex(index, options) {
      var _this8 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transition: Transition.type.PUSH_RIGHT
      };
      options = (0, _object.assign)({}, defaults, options);
      checkOptions('popToViewAtIndex', options);
      if (this.state.views.length === 1) {
        throw new Error('popToViewAtIndex() can only be called with two or more views in the stack');
      };
      if (index < 0 || index > this.state.views.length - 2) {
        throw new Error('popToViewAtIndex() can only be called with a valid index');
      };
      if (this.__isTransitioning) return;
      var _options5 = options;
      var transition = _options5.transition;

      var _viewIndexes6 = _slicedToArray(this.__viewIndexes, 2);

      var prev = _viewIndexes6[0];
      var next = _viewIndexes6[1];

      var rootView = this.state.views[index];
      var topView = (0, _array.last)(this.state.views);
      var mountedViews = [];
      mountedViews[prev] = topView;
      mountedViews[next] = rootView;
      // Display only the root view
      var views = this.state.views.slice(0, index + 1);
      // Show the wrappers
      this.__displayViews('block');
      // Pop from the top view, all the way to the root view
      this.setState({
        transition: transition,
        views: views,
        mountedViews: mountedViews
      }, function () {
        // The view that will be shown
        var rootView = _this8.refs['view-1'];
        if (rootView && _this8.state.preserveState) {
          var state = _this8.__viewStates[index];
          // Rehydrate the state
          if (state) {
            rootView.setState(state);
          }
        }
        // Clear view states
        _this8.__viewStates = _this8.__viewStates.slice(0, index);
        // Transition
        _this8.__transitionViews(options);
      });
      this.__isTransitioning = true;
    }
  }, {
    key: 'pushView',
    value: function pushView() {
      this.__pushView.apply(this, arguments);
    }
  }, {
    key: 'popView',
    value: function popView() {
      this.__popView.apply(this, arguments);
    }
  }, {
    key: 'popToRootView',
    value: function popToRootView() {
      this.__popToRootView.apply(this, arguments);
    }
  }, {
    key: 'setViews',
    value: function setViews() {
      this.__setViews.apply(this, arguments);
    }
  }, {
    key: '__renderPrevView',
    value: function __renderPrevView() {
      var view = this.state.mountedViews[0];
      if (!view) return null;
      return _react2.default.cloneElement(view, {
        ref: 'view-' + this.__viewIndexes[0],
        navigationController: this
      });
    }
  }, {
    key: '__renderNextView',
    value: function __renderNextView() {
      var view = this.state.mountedViews[1];
      if (!view) return null;
      return _react2.default.cloneElement(view, {
        ref: 'view-' + this.__viewIndexes[1],
        navigationController: this
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var className = (0, _classnames2.default)('ReactNavigationController', this.props.className);
      var wrapperClassName = (0, _classnames2.default)('ReactNavigationControllerView', {
        'ReactNavigationControllerView--transitioning': this.__isTransitioning
      });
      return _react2.default.createElement(
        'div',
        { className: className },
        _react2.default.createElement(
          'div',
          {
            className: wrapperClassName,
            ref: 'view-wrapper-0' },
          this.__renderPrevView()
        ),
        _react2.default.createElement(
          'div',
          {
            className: wrapperClassName,
            ref: 'view-wrapper-1' },
          this.__renderNextView()
        )
      );
    }
  }]);

  return NavigationController;
}(_react2.default.Component);

NavigationController.propTypes = {
  views: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.element).isRequired,
  preserveState: _react2.default.PropTypes.bool,
  transitionTension: _react2.default.PropTypes.number,
  transitionFriction: _react2.default.PropTypes.number
};

NavigationController.defaultProps = {
  preserveState: false,
  transitionTension: 10,
  transitionFriction: 6
};

NavigationController.Transition = Transition;

exports.default = NavigationController;